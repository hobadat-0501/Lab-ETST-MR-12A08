import { NextResponse } from 'next/server'
import { COOKIE_NAME, SESSION_SECONDS, createSession, credentialsMatch, sessionCookieOptions } from '../../../../lib/auth'
import { ApiError, parse, readJson, route } from '../../../../lib/http'
import { clearFailures, clientKey, isBlocked, recordFailure } from '../../../../lib/rate-limit'
import { loginInput } from '../../../../lib/validators'

export const POST = route(async request => {
  const key = clientKey(request)
  if (isBlocked(key)) throw new ApiError('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.', 429)
  const { username, password } = parse(loginInput, await readJson(request))
  if (!process.env.ADMIN_SESSION_SECRET) throw new ApiError('Chưa cấu hình phiên đăng nhập quản lý.', 503)
  if (!credentialsMatch(username, password)) {
    recordFailure(key)
    throw new ApiError('Tên đăng nhập hoặc mật khẩu không đúng.', 401)
  }
  clearFailures(key)
  const response = NextResponse.json({ ok: true, username: process.env.ADMIN_USERNAME })
  response.cookies.set(COOKIE_NAME, createSession(process.env.ADMIN_USERNAME), sessionCookieOptions(SESSION_SECONDS))
  return response
})
