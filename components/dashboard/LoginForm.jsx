'use client'
import { FlaskConical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { request } from '../../lib/format'

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await request('/api/dashboard/login', { method: 'POST', body: JSON.stringify(form) })
      router.replace('/dashboard')
      router.refresh()
    } catch (err) { setError(err.message); setBusy(false) }
  }

  return <main className="auth-page">
    <form className="auth-card" onSubmit={submit}>
      <div className="brand"><span className="brand-mark"><FlaskConical size={18} /></span><strong>ETST-MR</strong></div>
      <h1>Dashboard sign in</h1>
      <label>Username<input required autoFocus autoComplete="username" value={form.username} onChange={set('username')} /></label>
      <label>Password<input required type="password" autoComplete="current-password" value={form.password} onChange={set('password')} /></label>
      {error && <p className="notice" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </main>
}
