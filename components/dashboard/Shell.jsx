'use client'
import { Banknote, CalendarDays, ClipboardCheck, ExternalLink, FlaskConical, LayoutDashboard, ListChecks, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { usePolling } from '../ui/usePolling'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/dashboard/approvals', label: 'Approvals', icon: ClipboardCheck, badge: true },
  { href: '/dashboard/events', label: 'Events', icon: ListChecks },
  { href: '/dashboard/finance', label: 'Finance', icon: Banknote },
]

export default function Shell({ pendingCount, children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Pick up new booking requests without a manual reload (also refreshes the pending badge).
  usePolling(() => { if (pathname === '/dashboard' || pathname === '/dashboard/approvals') router.refresh() }, 5000)

  async function logout() {
    await fetch('/api/dashboard/logout', { method: 'POST' })
    router.replace('/dashboard/login')
    router.refresh()
  }

  return <div className="shell">
    <header className="mobile-bar">
      <button className="icon-button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}><Menu size={20} /></button>
      <div className="brand"><span className="brand-mark"><FlaskConical size={18} /></span><strong>ETST-MR LAB</strong></div>
    </header>
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="brand"><span className="brand-mark"><FlaskConical size={18} /></span><strong>ETST-MR LAB</strong></div>
      <nav>
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
            <Icon size={18} />{label}{badge && pendingCount > 0 && <span className="nav-count">{pendingCount}</span>}
          </Link>
        })}
      </nav>
      <div className="sidebar-bottom">
        <Link className="nav-item" href="/"><ExternalLink size={18} />Client site</Link>
        <button className="nav-item" onClick={logout}><LogOut size={18} />Sign out</button>
      </div>
    </aside>
    {open && <div className="scrim" onClick={() => setOpen(false)} />}
    <main className="content">{children}</main>
  </div>
}
