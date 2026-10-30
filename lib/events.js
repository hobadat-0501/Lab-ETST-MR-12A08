import { CLOSE_HOUR, LAB_OFFSET_MS, OPEN_HOUR, RETENTION_DAYS, ROOM } from './constants'
import { ApiError } from './http'
import { prisma } from './prisma'

const findConflict = (tx, { room, startAt, endAt, statuses, excludeId }) => tx.event.findFirst({
  where: { room, status: { in: statuses }, startAt: { lt: endAt }, endAt: { gt: startAt }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  select: { id: true },
})

const DAY_MS = 86_400_000
const labMinutes = d => ((+d + LAB_OFFSET_MS) % DAY_MS) / 60_000
const labDayIndex = d => Math.floor((+d + LAB_OFFSET_MS) / DAY_MS)

const lockRoom = (tx, room) => tx.$executeRaw`SELECT pg_advisory_xact_lock(pg_catalog.hashtext(${room}))`

// Bookings are always for the lab room and may not start before the moment of submission
// (a minute of slack covers minute-precision pickers and request latency; earlier starts are clamped to now).
// The transaction locks the room so two concurrent requests cannot claim the same slot.
export function createEvent({ title, person, email, activity_type, report_scope, start_at, end_at }) {
  const now = new Date()
  if (+start_at < +now - 60_000) throw new ApiError('Start time cannot be in the past.', 400)
  const startAt = start_at < now ? now : start_at
  if (end_at <= startAt) throw new ApiError('End time must be after the start time.', 400)
  if (labDayIndex(startAt) !== labDayIndex(end_at) || labMinutes(startAt) < OPEN_HOUR * 60 || labMinutes(end_at) > CLOSE_HOUR * 60) {
    throw new ApiError(`The lab is open ${OPEN_HOUR}:00–${CLOSE_HOUR}:00. Bookings must fit within one day's opening hours.`, 400)
  }
  return prisma.$transaction(async tx => {
    await lockRoom(tx, ROOM)
    if (await findConflict(tx, { room: ROOM, startAt, endAt: end_at, statuses: ['pending', 'confirmed'] })) {
      throw new ApiError('The lab is already booked for that time.', 409)
    }
    return tx.event.create({ data: { title, person, room: ROOM, email, activityType: activity_type, reportScope: report_scope, startAt, endAt: end_at } })
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

// Pending and rejected requests expire RETENTION_DAYS after they were created; approved events RETENTION_DAYS after they end.
export async function purgeOldEvents(now = new Date()) {
  const cutoff = new Date(+now - RETENTION_DAYS * 86_400_000)
  const { count } = await prisma.event.deleteMany({
    where: { OR: [
      { status: { in: ['pending', 'rejected'] }, createdAt: { lt: cutoff } },
      { status: 'confirmed', endAt: { lt: cutoff } },
    ] },
  })
  return count
}
