import Link from 'next/link'
import ApprovalList from '../../../../components/dashboard/ApprovalList'
import { SERVICE_ERROR } from '../../../../lib/prisma'
import { listEvents } from '../../../../lib/queries'
import { toApiEvent } from '../../../../lib/serializers'
import { requireAdminPage } from '../../../../lib/session'

export const metadata = { title: 'Approvals' }

const TABS = [['pending', 'Pending'], ['confirmed', 'Approved'], ['rejected', 'Rejected']]

export default async function ApprovalsPage({ searchParams }) {
  await requireAdminPage()
  const requested = (await searchParams).status
  const status = TABS.some(([key]) => key === requested) ? requested : 'pending'
  let events = [], failed = false
  try { events = (await listEvents(status)).map(e => toApiEvent(e, { admin: true })) } catch (error) { console.error(error); failed = true }

  return <>
    <div className="page-head"><div><h1>Approvals</h1><p>Review booking requests before they appear on the public calendar.</p></div></div>
    <nav className="tabs" aria-label="Filter by status">{TABS.map(([key, label]) => <Link key={key} href={`/dashboard/approvals?status=${key}`} className={key === status ? 'active' : ''} aria-current={key === status ? 'page' : undefined}>{label}</Link>)}</nav>
    {failed ? <p className="notice" role="alert">{SERVICE_ERROR}</p>
      : events.length ? <ApprovalList events={events} />
      : <p className="empty">No {TABS.find(([key]) => key === status)[1].toLowerCase()} requests.</p>}
  </>
}
