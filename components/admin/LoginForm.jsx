'use client'
import { FlaskConical, LogIn, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { request } from '../../lib/format'

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await request('/api/admin/login', { method: 'POST', body: JSON.stringify(form) })
      router.replace('/admin')
      router.refresh()
    } catch (err) { setError(err.message); setBusy(false) }
  }

  return <div className="login-page">
    <form className="modal login-modal" onSubmit={submit}>
      <div className="modal-head"><div><span className="modal-icon"><FlaskConical size={19} /></span><h2>Đăng nhập quản lý</h2><p>Dành riêng cho quản lý Lab ETST-MR 12A08.</p></div></div>
      <label>Tên đăng nhập<input required autoComplete="username" placeholder="Tên đăng nhập" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></label>
      <label>Mật khẩu<input required type="password" autoComplete="current-password" placeholder="Nhập mật khẩu" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
      {error && <div className="data-notice" role="alert"><ShieldCheck size={15} /><span>{error}</span></div>}
      <div className="form-note"><ShieldCheck size={15} /> Khu vực quản trị chỉ mở sau khi xác thực thành công.</div>
      <div className="modal-actions"><Link className="secondary-button" href="/">Về trang khách</Link><button className="primary-button" type="submit" disabled={busy}><LogIn size={16} />{busy ? 'Đang xác thực…' : 'Đăng nhập'}</button></div>
    </form>
  </div>
}
