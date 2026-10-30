import { NextResponse } from 'next/server'
import { isAdminRequest } from '../../../lib/auth'
import { databaseErrorMessage, prisma } from '../../../lib/prisma'

const toApiTransaction = t => ({
  id: t.id, name: t.name, description: t.description,
  amount: Number(t.amount), kind: t.kind,
  occurred_on: t.occurredOn.toISOString().slice(0, 10),
  created_at: t.createdAt.toISOString(),
})

export async function GET(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Bạn cần đăng nhập quản lý.' }, { status: 401 })
  try {
    const data = await prisma.transaction.findMany({ orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }] })
    return NextResponse.json(data.map(toApiTransaction))
  } catch { return NextResponse.json({ error: databaseErrorMessage() }, { status: 503 }) }
}

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Bạn cần đăng nhập quản lý.' }, { status: 401 })
  try {
    const body = await request.json()
    const amount = Number(body.amount)
    const occurredOn = new Date(`${body.occurred_on}T00:00:00.000Z`)
    if (typeof body.name !== 'string' || body.name.trim().length < 2 || !Number.isSafeInteger(amount) || amount <= 0 || !['Thu', 'Chi'].includes(body.kind) || Number.isNaN(+occurredOn)) {
      return NextResponse.json({ error: 'Vui lòng kiểm tra nội dung, loại, ngày và số tiền.' }, { status: 400 })
    }
    const data = await prisma.transaction.create({ data: { name: body.name.trim(), description: body.description?.trim() || null, amount: BigInt(amount), kind: body.kind, occurredOn } })
    return NextResponse.json(toApiTransaction(data), { status: 201 })
  } catch { return NextResponse.json({ error: databaseErrorMessage() }, { status: 503 }) }
}
