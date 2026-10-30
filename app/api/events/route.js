import { NextResponse } from 'next/server'
import { isAdminRequest } from '../../../lib/auth'
import { databaseErrorMessage, prisma } from '../../../lib/prisma'

const toApiEvent = (event, includeEmail = false) => ({
  id: event.id, title: event.title, person: event.person,
  ...(includeEmail ? { email: event.email } : {}),
  activity_type: event.activityType, room: event.room,
  start_at: event.startAt.toISOString(), end_at: event.endAt.toISOString(),
  status: event.status, created_at: event.createdAt.toISOString(),
})

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const isAdmin = isAdminRequest(request)
    const where = {
      ...(from ? { startAt: { gte: new Date(from), ...(to ? { lt: new Date(to) } : {}) } } : {}),
      ...(isAdmin ? { status: { in: ['pending', 'confirmed'] } } : { status: 'confirmed' }),
    }
    const data = await prisma.event.findMany({ where, orderBy: { startAt: 'asc' } })
    return NextResponse.json(data.map(event => toApiEvent(event, isAdmin)))
  } catch (error) { return NextResponse.json({ error: databaseErrorMessage() }, { status: 503 }) }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const person = typeof body.person === 'string' ? body.person.trim() : ''
    const room = typeof body.room === 'string' ? body.room.trim() : ''
    const startAt = new Date(body.start_at)
    const endAt = new Date(body.end_at)
    if (title.length < 3 || title.length > 160 || person.length < 2 || room.length < 2 || Number.isNaN(+startAt) || Number.isNaN(+endAt) || endAt <= startAt) {
      return NextResponse.json({ error: 'Vui lòng kiểm tra thông tin và khung giờ.' }, { status: 400 })
    }
    if (!['Báo cáo', 'Làm việc'].includes(body.activity_type)) return NextResponse.json({ error: 'Loại hoạt động không hợp lệ.' }, { status: 400 })
    const data = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(pg_catalog.hashtext(${room}))`
      const conflict = await tx.event.findFirst({ where: { room, status: { in: ['pending', 'confirmed'] }, startAt: { lt: endAt }, endAt: { gt: startAt } }, select: { id: true } })
      if (conflict) {
        const error = new Error('Khung giờ này đã có đăng ký trong phòng.')
        error.status = 409
        throw error
      }
      return tx.event.create({ data: { title, person, email: body.email || null, activityType: body.activity_type, room, startAt, endAt, status: 'pending' } })
    })
    return NextResponse.json(toApiEvent(data), { status: 201 })
  } catch (error) { return NextResponse.json({ error: error.status ? error.message : databaseErrorMessage() }, { status: error.status || 503 }) }
}
