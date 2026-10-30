'use client'
import { Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { bookedByLabel, longDate, request, timeText } from '../../lib/format'
import { useToast } from '../ui/Toast'

const STATUS_LABEL = { pending: 'Pending', confirmed: 'Approved', rejected: 'Rejected' }

export default function ApprovalList({ events }) {
  const router = useRouter()
  const notify = useToast()
  const [updating, setUpdating] = useState('')
  const [rejecting, setRejecting] = useState('')
  const [reason, setReason] = useState('')

  async function update(id, status, reject_reason) {
    setUpdating(id)
    try {
      await request(`/api/dashboard/events/${id}`, { method: 'PATCH', body: JSON.stringify({ status, reject_reason }) })
      notify(status === 'confirmed' ? 'Booking approved.' : 'Booking rejected.')
      setRejecting(''); setReason('')
      router.refresh()
    } catch (e) { notify(e.message) } finally { setUpdating('') }
  }

  return <div className="cards">{events.map(e => {
    const busy = updating === e.id
    return <article className="card" key={e.id}>
      <header><div><small>{e.activity_type}{e.report_scope && ` · ${e.report_scope}`}</small><h2>{e.title}</h2></div><span className={`badge ${e.status}`}>{STATUS_LABEL[e.status]}</span></header>
      <dl className="details">
        <dt>{bookedByLabel(e)}</dt><dd>{e.person}</dd>
        <dt>Date</dt><dd>{longDate(e.start_at)}</dd>
        <dt>Time</dt><dd>{timeText(e.start_at)} – {timeText(e.end_at)}</dd>
        <dt>Room</dt><dd>{e.room}</dd>
        {e.email && <><dt>Email</dt><dd>{e.email}</dd></>}
        {e.reject_reason && <><dt>Reason</dt><dd>{e.reject_reason}</dd></>}
      </dl>
      {rejecting === e.id && <label>Reason for rejecting <span className="optional">(optional)</span><input autoFocus maxLength="300" value={reason} onChange={ev => setReason(ev.target.value)} placeholder="e.g. Room under maintenance" /></label>}
      <footer>
        {rejecting === e.id ? <>
          <button className="secondary-button" onClick={() => setRejecting('')}>Cancel</button>
          <button className="danger-button" disabled={busy} onClick={() => update(e.id, 'rejected', reason)}><X size={15} />Confirm rejection</button>
        </> : <>
          {e.status !== 'rejected' && <button className="danger-button" disabled={busy} onClick={() => { setRejecting(e.id); setReason('') }}><X size={15} />{e.status === 'confirmed' ? 'Cancel booking' : 'Reject'}</button>}
          {e.status !== 'confirmed' && <button className="primary-button" disabled={busy} onClick={() => update(e.id, 'confirmed')}><Check size={15} />{busy ? 'Saving…' : 'Approve'}</button>}
        </>}
      </footer>
    </article>
  })}</div>
}
