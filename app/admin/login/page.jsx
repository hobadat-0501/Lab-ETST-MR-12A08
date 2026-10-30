import { redirect } from 'next/navigation'
import LoginForm from '../../../components/admin/LoginForm'
import { isAdminSession } from '../../../lib/session'

export const metadata = { title: 'Đăng nhập quản lý — Lab ETST-MR 12A08', robots: { index: false } }

export default async function LoginPage() {
  if (await isAdminSession()) redirect('/admin')
  return <LoginForm />
}
