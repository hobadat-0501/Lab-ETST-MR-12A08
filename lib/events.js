import { ApiError } from './http'
import { prisma } from './prisma'

const findConflict = (tx, { room, startAt, endAt, statuses, excludeId }) => tx.event.findFirst({
  where: { room, status: { in: statuses }, startAt: { lt: endAt }, endAt: { gt: startAt }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  select: { id: true },
})

const lockRoom = (tx, room) => tx.$queryRaw`SELECT pg_advisory_xact_lock(pg_catalog.hashtext(${room}))`

// Tạo lịch trong transaction có khoá theo phòng để hai yêu cầu đồng thời không cùng chiếm một khung giờ.
export function createEvent({ title, person, room, email, activity_type, start_at, end_at }, status = 'pending') {
  return prisma.$transaction(async tx => {
    await lockRoom(tx, room)
    if (await findConflict(tx, { room, startAt: start_at, endAt: end_at, statuses: ['pending', 'confirmed'] })) {
      throw new ApiError('Khung giờ này đã có đăng ký trong phòng.', 409)
    }
    return tx.event.create({ data: { title, person, room, email, activityType: activity_type, startAt: start_at, endAt: end_at, status } })
  })
}

export function setEventStatus(id, status, rejectReason) {
  return prisma.$transaction(async tx => {
    const event = await tx.event.findUniqueOrThrow({ where: { id } })
    if (event.status === status) throw new ApiError('Đăng ký đã ở trạng thái này.', 409)
    if (status === 'confirmed') {
      await lockRoom(tx, event.room)
      if (await findConflict(tx, { room: event.room, startAt: event.startAt, endAt: event.endAt, statuses: ['confirmed'], excludeId: id })) {
        throw new ApiError('Khung giờ này đã trùng với một lịch đã xác nhận.', 409)
      }
    }
    return tx.event.update({ where: { id }, data: { status, rejectReason: status === 'rejected' ? rejectReason : null } })
  })
}
