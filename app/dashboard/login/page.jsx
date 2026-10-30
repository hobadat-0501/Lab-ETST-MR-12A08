import { redirect } from 'next/navigation'
import LoginForm from '../../../components/dashboard/LoginForm'
import { isAdminSession } from '../../../lib/session'

export const metadata = { title: 'Sign in', robots: { index: false } }

export default async function LoginPage() {
  if (await isAdminSession()) redirect('/dashboard')
  return <LoginForm />
}
