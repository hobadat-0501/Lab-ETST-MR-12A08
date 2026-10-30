import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_NAME, verifySession } from './auth'

export async function isAdminSession() {
  return verifySession((await cookies()).get(COOKIE_NAME)?.value)
}

// Call from every dashboard page: layouts do not re-render on navigation, so a layout check alone is not enough.
export async function requireAdminPage() {
  if (!(await isAdminSession())) redirect('/dashboard/login')
}
