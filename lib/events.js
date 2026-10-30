import { ApiError } from './http'
import { prisma } from './prisma'

const findConflict = (tx, { room, startAt, endAt, statuses, excludeId }) => tx.event.findFirst({
  where: { room, status: { in: statuses }, startAt: { lt: endAt }, endAt: { gt: startAt }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  select: { id: true },
})

const lockRoom = (tx, room) => tx.$executeRaw`SELECT pg_advisory_xact_lock(pg_catalog.hashtext(${room}))`

// A booking starts at the moment it is submitted, so it can never be in the past.
// The transaction locks the room so two concurrent requests cannot claim the same slot.
export function createEvent({ title, person, room, email, activity_type, duration_minutes }) {
  return prisma.$transaction(async tx => {
    await lockRoom(tx, room)
    const startAt = new Date()
    const endAt = new Date(+startAt + duration_minutes * 60_000)
    if (await findConflict(tx, { room, startAt, endAt, statuses: ['pending', 'confirmed'] })) {
      throw new ApiError('This room is already booked for that time.', 409)
    }
    return tx.event.create({ data: { title, person, room, email, activityType: activity_type, startAt, endAt } })
  })
}

export function setEventStatus(id, status, rejectReason) {
  return prisma.$transaction(async tx => {
    const event = await tx.event.findUniqueOrThrow({ where: { id } })
    if (event.status === status) throw new ApiError('This request already has that status.', 409)
    if (status === 'confirmed') {
      if (event.endAt <= new Date()) throw new ApiError('This booking has already ended and cannot be approved.', 409)
      await lockRoom(tx, event.room)
      if (await findConflict(tx, { room: event.room, startAt: event.startAt, endAt: event.endAt, statuses: ['confirmed'], excludeId: id })) {
        throw new ApiError('This overlaps with an already approved booking.', 409)
      }
    }
    return tx.event.update({ where: { id }, data: { status, rejectReason: status === 'rejected' ? rejectReason : null } })
  })
}
