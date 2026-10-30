import { NextResponse } from 'next/server'
import { isAdminRequest } from '../../../../lib/auth'
import { databaseErrorMessage, prisma } from '../../../../lib/prisma'

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Bạn cần đăng nhập quản lý.' }, { status: 401 })
  }

  try {
    const events = await prisma.event.findMany({
      where: { status: 'pending' },
      orderBy: [{ startAt: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(events.map(event => ({
      id: event.id,
      title: event.title,
      person: event.person,
      email: event.email,
      activity_type: event.activityType,
      room: event.room,
      start_at: event.startAt.toISOString(),
      end_at: event.endAt.toISOString(),
      created_at: event.createdAt.toISOString(),
    })), { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: databaseErrorMessage() }, { status: 503 })
  }
}
