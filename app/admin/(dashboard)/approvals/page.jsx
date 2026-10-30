import { Check, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import ApprovalList from '../../../../components/admin/ApprovalList'
import DataNotice from '../../../../components/admin/DataNotice'
import { databaseErrorMessage } from '../../../../lib/prisma'
import { listEvents } from '../../../../lib/queries'
import { toApiEvent } from '../../../../lib/serializers'
import { requireAdminPage } from '../../../../lib/session'

const TABS = [['pending', 'Chờ duyệt'], ['confirmed', 'Đã duyệt'], ['rejected', 'Đã từ chối']]

export default async function ApprovalsPage({ searchParams }) {
  await requireAdminPage()
  const requested = (await searchParams).status
  const status = TABS.some(([key]) => key === requested) ? requested : 'pending'
  let events = [], error
  try { events = (await listEvents(status)).map(e => toApiEvent(e, { admin: true })) } catch { error = databaseErrorMessage() }

  return <div className="content approvals-content">
    <section className="page-heading"><div><div className="eyebrow">KHU VỰC QUẢN TRỊ <span className="eyebrow-sep">/</span> DUYỆT ĐĂNG KÝ</div><h1>Duyệt đăng ký</h1><p>Xem xét lịch sử dụng phòng trước khi xuất hiện trên lịch chung.</p></div></section>
    <nav className="tab-bar" aria-label="Lọc theo trạng thái">{TABS.map(([key, label]) => <Link key={key} href={`/admin/approvals?status=${key}`} className={key === status ? 'active' : ''}>{label}</Link>)}</nav>
    <section className="approval-summary"><span className="approval-summary-icon"><ClipboardCheck size={19} /></span><div><strong>{events.length} đăng ký · {TABS.find(([key]) => key === status)[1].toLowerCase()}</strong><p>Khách truy cập không thể xem các đăng ký đang chờ duyệt.</p></div></section>
    {error && <DataNotice>{error}</DataNotice>}
    {events.length ? <ApprovalList events={events} /> : !error && <div className="approval-empty"><span><Check size={19} /></span><strong>Không có đăng ký nào</strong><p>Khi có đăng ký mới, yêu cầu sẽ hiển thị ở đây.</p></div>}
  </div>
}
