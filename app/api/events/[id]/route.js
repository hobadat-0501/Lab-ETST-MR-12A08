import { NextResponse } from 'next/server'
import { isAdminRequest } from '../../../../lib/auth'
import { databaseErrorMessage, prisma } from '../../../../lib/prisma'

export async function PATCH(request, context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Bạn cần đăng nhập quản lý.' }, { status: 401 })
  try {
    const { status } = await request.json()
    if (!['confirmed', 'rejected'].includes(status)) return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 })
    const { id } = await context.params
    const data = await prisma.event.update({ where: { id }, data: { status } })
    return NextResponse.json({ id: data.id, status: data.status })
  } catch { return NextResponse.json({ error: databaseErrorMessage() }, { status: 503 }) }
}
