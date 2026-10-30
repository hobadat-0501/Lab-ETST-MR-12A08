import { ROOM } from './constants'
import { ApiError } from './http'
import { prisma } from './prisma'

const findConflict = (tx, { room, startAt, endAt, statuses, excludeId }) => tx.event.findFirst({
  where: { room, status: { in: statuses }, startAt: { lt: endAt }, endAt: { gt: startAt }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  select: { id: true },
})

const lockRoom = (tx, room) => tx.$executeRaw`SELECT pg_advisory_xact_lock(pg_catalog.hashtext(${room}))`

// Bookings are always for the lab room and may not start before the moment of submission
// (a minute of slack covers minute-precision pickers and request latency; earlier starts are clamped to now).
// The transaction locks the room so two concurrent requests cannot claim the same slot.
export function createEvent({ title, person, email, activity_type, start_at, end_at }) {
  const now = new Date()
  if (+start_at < +now - 60_000) throw new ApiError('Start time cannot be in the past.', 400)
  const startAt = start_at < now ? now : start_at
  if (end_at <= startAt) throw new ApiError('End time must be after the start time.', 400)
  return prisma.$transaction(async tx => {
    await lockRoom(tx, ROOM)
    if (await findConflict(tx, { room: ROOM, startAt, endAt: end_at, statuses: ['pending', 'confirmed'] })) {
      throw new ApiError('The lab is already booked for that time.', 409)
    }
    return tx.event.create({ data: { title, person, room: ROOM, email, activityType: activity_type, startAt, endAt: end_at } })
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
