import { createHmac, timingSafeEqual } from 'node:crypto'

export const COOKIE_NAME = 'lab_admin_session'
export const SESSION_SECONDS = 8 * 60 * 60

const sign = value => createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '').update(value).digest('base64url')
export const equalText = (a, b) => {
  const left = Buffer.from(String(a ?? ''))
  const right = Buffer.from(String(b ?? ''))
  return left.length === right.length && timingSafeEqual(left, right)
}

export const sessionCookieOptions = maxAge => ({
  httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge,
})

export function credentialsMatch(username, password) {
  return Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD)
    && equalText(username, process.env.ADMIN_USERNAME)
    && equalText(password, process.env.ADMIN_PASSWORD)
}

export function createSession(username) {
  const payload = Buffer.from(JSON.stringify({ sub: username, exp: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifySession(token) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !equalText(signature, sign(payload))) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data.sub === process.env.ADMIN_USERNAME && data.exp > Date.now()
  } catch { return false }
}

export const isAdminRequest = request => verifySession(request.cookies.get(COOKIE_NAME)?.value)
