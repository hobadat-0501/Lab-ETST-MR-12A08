'use client'
import { ArrowRight, Banknote, CalendarDays, ChevronRight, ClipboardCheck, FlaskConical, LayoutDashboard, LogIn, Menu, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const CLIENT_NAV = [{ href: '/', label: 'Lịch phòng lab', icon: CalendarDays }]
const ADMIN_NAV = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/approvals', label: 'Duyệt đăng ký', icon: ClipboardCheck, badge: true },
  { href: '/admin/finance', label: 'Thu chi phòng lab', icon: Banknote },
]
const CRUMBS = { '/': 'Lịch phòng lab', '/admin': 'Tổng quan', '/admin/approvals': 'Duyệt đăng ký', '/admin/finance': 'Thu chi phòng lab' }

// Khung giao diện dùng chung. variant="admin" chỉ được render bên trong layout đã xác thực.
export default function Shell({ variant = 'client', pendingCount = 0, children }) {
  const admin = variant === 'admin'
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const nav = admin ? ADMIN_NAV : CLIENT_NAV

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/')
    router.refresh()
  }

  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><FlaskConical size={20} /></div><div><strong>Lab ETST-MR 12A08</strong><small>{admin ? 'KHU VỰC QUẢN TRỊ' : 'KHÔNG GIAN NGHIÊN CỨU'}</small></div></div>
      <div className="side-label">{admin ? 'QUẢN TRỊ RIÊNG' : 'KHÔNG GIAN'}</div>
      {nav.map(({ href, label, icon: Icon, badge }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-item ${pathname === href ? 'active' : ''}`}>
        <Icon size={18} />{label}{badge && pendingCount > 0 && <span className="nav-count">{pendingCount}</span>}
      </Link>)}
      {admin && <><div className="side-label manage-label">CÔNG KHAI</div><Link href="/" className="nav-item"><CalendarDays size={18} />Xem trang khách</Link></>}
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><Sparkles size={16} /></div><strong>Cần hỗ trợ?</strong><p>Liên hệ quản lý phòng lab để được trợ giúp.</p><a href="mailto:lab@utc.edu.vn">lab@utc.edu.vn <ArrowRight size={13} /></a></div>
        <div className="user-mini"><div className="avatar">{admin ? 'QL' : 'L'}</div><div><strong>{admin ? 'Quản lý lab' : 'Khách truy cập'}</strong><small>{admin ? 'Quản trị viên' : 'Không cần đăng nhập'}</small></div>
          {admin ? <button aria-label="Đăng xuất" onClick={logout}><LogIn size={16} /></button> : <Link aria-label="Đăng nhập quản lý" href="/admin/login"><LogIn size={16} /></Link>}
        </div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <button className="menu-button" aria-label="Mở menu" onClick={() => setOpen(!open)}><Menu size={19} /></button>
        <div className="crumb">{admin ? 'Quản trị' : 'Không gian'} <ChevronRight size={14} /> <b>{CRUMBS[pathname] ?? ''}</b></div>
        <div className="top-actions">
          <span className="live-dot"></span><span className="sync-label">Dữ liệu trực tiếp</span>
          {admin ? <button className="login-button" onClick={logout}><ShieldCheck size={15} />Quản lý · Đăng xuất</button> : <Link className="login-button" href="/admin/login"><ShieldCheck size={15} />Quản lý</Link>}
        </div>
      </header>
      {children}
    </main>
  </div>
}
