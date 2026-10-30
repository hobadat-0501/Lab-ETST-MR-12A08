import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_NAME, verifySession } from './auth'

export async function isAdminSession() {
  return verifySession((await cookies()).get(COOKIE_NAME)?.value)
}

// Gọi trong từng layout/page admin: layout không render lại khi điều hướng nên không đủ để bảo vệ trang.
export async function requireAdminPage() {
  if (!(await isAdminSession())) redirect('/admin/login')
}
