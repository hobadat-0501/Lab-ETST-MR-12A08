import { ArrowRight, Banknote, CalendarDays, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import DataNotice from '../../../components/admin/DataNotice'
import { dayNum, longDate, monthNum, money, monthLabel, timeText } from '../../../lib/format'
import { prisma, databaseErrorMessage } from '../../../lib/prisma'
import { currentMonth, financeSummary, listEvents } from '../../../lib/queries'
import { requireAdminPage } from '../../../lib/session'

async function loadDashboard() {
  const now = new Date()
  const [pending, upcoming, summary] = await Promise.all([
    listEvents('pending'),
    prisma.event.count({ where: { status: 'confirmed', startAt: { gte: now } } }),
    financeSummary(),
  ])
  return { pending, upcoming, summary }
}

export default async function AdminHome() {
  await requireAdminPage()
  let data, error
  try { data = await loadDashboard() } catch { error = databaseErrorMessage() }
  const month = currentMonth()

  return <div className="content">
    <section className="page-heading"><div><div className="eyebrow">KHU VỰC QUẢN TRỊ <span className="eyebrow-sep">/</span> TỔNG QUAN</div><h1>Tổng quan</h1><p>Tình hình đăng ký lịch và thu chi của phòng lab.</p></div></section>
    {error && <DataNotice>{error}</DataNotice>}
    {data && <>
      <section className="finance-stats">
        <div><small>SỐ DƯ HIỆN TẠI</small><strong>{money(data.summary.balance)}</strong><span>{data.summary.total} giao dịch đã ghi nhận</span></div>
        <div><small>THU · {monthLabel(month).toLocaleUpperCase('vi-VN')}</small><strong className="income">{money(data.summary.income)}</strong><span>{data.summary.incomeCount} khoản thu</span></div>
        <div><small>CHI · {monthLabel(month).toLocaleUpperCase('vi-VN')}</small><strong>{money(data.summary.expense)}</strong><span>{data.summary.expenseCount} khoản chi</span></div>
      </section>
      <section className="approval-summary">
        <span className="approval-summary-icon"><ClipboardCheck size={19} /></span>
        <div><strong>{data.pending.length} đăng ký chờ duyệt</strong><p>{data.upcoming} lịch đã xác nhận sắp diễn ra.</p></div>
        <Link className="outline-button push-right" href="/admin/approvals">Xử lý <ArrowRight size={14} /></Link>
      </section>
      <section className="upcoming">
        <div className="section-title"><div><h3>Chờ duyệt gần nhất</h3><p>Tối đa 5 đăng ký theo ngày sử dụng</p></div><Link className="outline-button" href="/admin/finance"><Banknote size={14} /> Thu chi</Link></div>
        {data.pending.length ? data.pending.slice(0, 5).map(e => <div className="upcoming-row" key={e.id}>
          <div className="date-box"><b>{dayNum(e.startAt)}</b><small>TH{String(monthNum(e.startAt)).padStart(2, '0')}</small></div>
          <div className="event-line pending"></div>
          <div className="upcoming-info"><strong>{e.title}</strong><span>{e.person} · {e.room} · {longDate(e.startAt)}</span></div>
          <small className="upcoming-time">{timeText(e.startAt)} – {timeText(e.endAt)}</small><CalendarDays size={16} />
        </div>) : <div className="empty-state">Không có đăng ký nào đang chờ duyệt.</div>}
      </section>
    </>}
  </div>
}
