import { NextResponse } from 'next/server'
import { isAdminRequest } from './auth'
import { databaseErrorMessage } from './prisma'

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

export const ok = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export function assertAdmin(request) {
  if (!isAdminRequest(request)) throw new ApiError('Bạn cần đăng nhập quản lý.', 401)
}

export async function readJson(request) {
  try { return await request.json() } catch { throw new ApiError('Dữ liệu gửi lên không hợp lệ.', 400) }
}

export function parse(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) throw new ApiError(result.error.issues[0]?.message || 'Dữ liệu không hợp lệ.', 400)
  return result.data
}

// Bọc handler: ApiError trả đúng status, lỗi Prisma "không tìm thấy" trả 404, còn lại coi là lỗi kết nối database.
export const route = handler => async (request, context) => {
  try {
    return await handler(request, context)
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status })
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Không tìm thấy bản ghi.' }, { status: 404 })
    console.error(error)
    return NextResponse.json({ error: databaseErrorMessage() }, { status: 503 })
  }
}
