'use client'
import { useState } from 'react'
import { ACTIVITY_TYPES, ROOM } from '../../lib/constants'
import { pad } from '../../lib/format'
import Modal from '../ui/Modal'

// Value for <input type="datetime-local"> in the browser's local time.
const local = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
const minute = (d = new Date()) => { d.setSeconds(0, 0); return d }

export default function BookingModal({ onClose, onSubmit, busy, onInvalid }) {
  const [form, setForm] = useState(() => {
    const now = minute()
    return { title: '', person: '', activity_type: ACTIVITY_TYPES[0], start: local(now), end: local(new Date(+now + 3_600_000)), email: '' }
  })
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const earliest = local(minute()) // evaluated per render; re-checked on submit

  function submit(e) {
    e.preventDefault()
    const now = new Date(), start = new Date(form.start), end = new Date(form.end)
    if (+start < +minute(new Date(now))) return onInvalid('Start time cannot be earlier than now.')
    if (end <= start) return onInvalid('End time must be after the start time.')
    onSubmit({ title: form.title, person: form.person, email: form.email, activity_type: form.activity_type, start_at: start.toISOString(), end_at: end.toISOString() })
  }

  return <Modal title="Book the lab" subtitle="Your booking appears on the calendar once it is approved." onClose={onClose} onSubmit={submit}>
    <label>Title<input required minLength="3" maxLength="160" placeholder="e.g. Progress report" value={form.title} onChange={set('title')} /></label>
    <div className="form-row">
      <label>Your name<input required minLength="2" maxLength="120" autoComplete="name" value={form.person} onChange={set('person')} /></label>
      <label>Type<select value={form.activity_type} onChange={set('activity_type')}>{ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
    </div>
    <label>Room<input value={ROOM} readOnly disabled /></label>
    <div className="form-row">
      <label>From<input required type="datetime-local" min={earliest} value={form.start} onChange={set('start')} /></label>
      <label>To<input required type="datetime-local" min={form.start} value={form.end} onChange={set('end')} /></label>
    </div>
    <label>Email <span className="optional">(optional)</span><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} /></label>
    <div className="modal-actions">
      <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Book'}</button>
    </div>
  </Modal>
}
