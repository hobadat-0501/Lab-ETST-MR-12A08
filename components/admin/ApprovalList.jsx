'use client'
import { Beaker, CalendarDays, Check, Clock3, Users, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { longDate, request, timeText } from '../../lib/format'
import { useToast } from '../ui/Toast'

const STATUS_LABEL = { pending: 'Chờ duyệt', confirmed: 'Đã duyệt', rejected: 'Đã từ chối' }

export default function ApprovalList({ events }) {
  const router = useRouter()
  const notify = useToast()
  const [updating, setUpdating] = useState('')
  const [rejecting, setRejecting] = useState('')
  const [reason, setReason] = useState('')

  async function update(id, status, reject_reason) {
    setUpdating(id)
    try {
      await request(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify({ status, reject_reason }) })
      notify(status === 'confirmed' ? 'Đã xác nhận lịch.' : 'Đã từ chối lịch.')
      setRejecting(''); setReason('')
      router.refresh()
    } catch (e) { notify(e.message) } finally { setUpdating('') }
  }

  return <div className="approval-list">{events.map(event => <article className="approval-card" key={event.id}>
    <div className="approval-card-head"><div><span className="approval-type">{event.activity_type}</span><h2>{event.title}</h2></div><span className="approval-status">{STATUS_LABEL[event.status]}</span></div>
    <div className="approval-details">
      <div><Users size={15} /><span><b>{event.person}</b><small>Người đăng ký</small></span></div>
      <div><CalendarDays size={15} /><span><b>{longDate(event.start_at)}</b><small>Ngày sử dụng</small></span></div>
      <div><Clock3 size={15} /><span><b>{timeText(event.start_at)} – {timeText(event.end_at)}</b><small>Thời gian</small></span></div>
      <div><Beaker size={15} /><span><b>{event.room}</b><small>Phòng</small></span></div>
      {event.email && <div><span className="approval-email-mark">@</span><span><b>{event.email}</b><small>Email liên hệ</small></span></div>}
      {event.reject_reason && <div><X size={15} /><span><b>{event.reject_reason}</b><small>Lý do từ chối</small></span></div>}
    </div>
    {rejecting === event.id && <label className="reason-field">Lý do từ chối (không bắt buộc)<input autoFocus maxLength="300" value={reason} onChange={e => setReason(e.target.value)} placeholder="VD: Phòng đã có lịch bảo trì" /></label>}
    <div className="approval-card-actions">
      {event.status !== 'rejected' && (rejecting === event.id
        ? <><button className="secondary-button" onClick={() => setRejecting('')}>Hủy</button><button className="reject-button" disabled={updating === event.id} onClick={() => update(event.id, 'rejected', reason)}><X size={15} />Xác nhận từ chối</button></>
        : <button className="reject-button" disabled={updating === event.id} onClick={() => { setRejecting(event.id); setReason('') }}><X size={15} />{event.status === 'confirmed' ? 'Hủy lịch' : 'Từ chối'}</button>)}
      {event.status !== 'confirmed' && rejecting !== event.id && <button className="primary-button" disabled={updating === event.id} onClick={() => update(event.id, 'confirmed')}><Check size={15} />{updating === event.id ? 'Đang lưu…' : 'Duyệt lịch'}</button>}
    </div>
  </article>)}</div>
}
