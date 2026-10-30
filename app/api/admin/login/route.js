import { NextResponse } from 'next/server'
import { COOKIE_NAME, createSession, credentialsMatch } from '../../../../lib/auth'

export async function POST(request) {
  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Dữ liệu đăng nhập không hợp lệ.' }, { status: 400 }) }
  if (!process.env.ADMIN_SESSION_SECRET) return NextResponse.json({ error: 'Chưa cấu hình phiên đăng nhập quản lý.' }, { status: 503 })
  if (!credentialsMatch(body.username, body.password)) return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }, { status: 401 })
  const response = NextResponse.json({ ok: true, username: process.env.ADMIN_USERNAME })
  response.cookies.set(COOKIE_NAME, createSession(process.env.ADMIN_USERNAME), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 8 * 60 * 60 })
  return response
}
