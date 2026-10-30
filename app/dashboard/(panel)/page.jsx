import Link from 'next/link'
import { dayNum, longDate, money, monthLabel, monthShort, timeText } from '../../../lib/format'
import { SERVICE_ERROR } from '../../../lib/prisma'
import { countPendingEvents, currentMonth, financeSummary, listEvents } from '../../../lib/queries'
import { requireAdminPage } from '../../../lib/session'

export const metadata = { title: 'Overview' }

export default async function Overview() {
  await requireAdminPage()
  let data
  try {
    const [pending, pendingCount, summary] = await Promise.all([listEvents('pending').then(r => r.slice(0, 5)), countPendingEvents(), financeSummary()])
    data = { pending, pendingCount, summary }
  } catch (error) { console.error(error) }
  const month = monthLabel(currentMonth())

  return <>
    <div className="page-head"><div><h1>Overview</h1><p>Bookings and finances at a glance.</p></div></div>
    {!data ? <p className="notice" role="alert">{SERVICE_ERROR}</p> : <>
      <section className="stats">
        <div><small>Balance</small><strong>{money(data.summary.balance)}</strong><span>{data.summary.total} transactions</span></div>
        <div><small>Income · {month}</small><strong className="income">{money(data.summary.income)}</strong><span>{data.summary.incomeCount} entries</span></div>
        <div><small>Expenses · {month}</small><strong>{money(data.summary.expense)}</strong><span>{data.summary.expenseCount} entries</span></div>
        <Link href="/dashboard/approvals" className="stat-link"><small>Awaiting approval</small><strong>{data.pendingCount}</strong><span>Review requests →</span></Link>
      </section>
      <section className="panel">
        <h2>Next pending requests</h2>
        {data.pending.length ? data.pending.map(e => <Link key={e.id} href="/dashboard/approvals" className="row">
          <div className="date-box"><b>{dayNum(e.startAt)}</b><small>{monthShort(e.startAt)}</small></div>
          <div className="row-main"><strong>{e.title}</strong><span>{e.person} · {e.room} · {longDate(e.startAt)}</span></div>
          <small>{timeText(e.startAt)} – {timeText(e.endAt)}</small>
        </Link>) : <p className="empty">No requests are waiting for approval.</p>}
      </section>
    </>}
  </>
}
