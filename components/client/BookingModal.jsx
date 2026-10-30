'use client'
import { useState } from 'react'
import { ACTIVITY_TYPES, CLOSE_HOUR, OPEN_HOUR, REPORT_SCOPES, ROOM_LABEL } from '../../lib/constants'
import { labDate, labDay, pad } from '../../lib/format'
import DatePicker from '../ui/DatePicker'
import Modal from '../ui/Modal'
import Select from '../ui/Select'

const TIME = /^([01]?\d|2[0-3]):([0-5]\d)$/
const TYPE_OPTIONS = ACTIVITY_TYPES.map(t => ({ value: t, label: t }))
const OPEN = `${pad(OPEN_HOUR)}:00`, CLOSE = `${pad(CLOSE_HOUR)}:00`
const minutes = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m }
const hhmm = total => `${pad(Math.floor(total / 60))}:${pad(total % 60)}`

// Keeps only digits and inserts the colon as the user types: "930" -> "9:30", "1430" -> "14:30".
const formatTyping = raw => {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, -2)}:${digits.slice(-2)}` : digits
}
const padHour = value => TIME.test(value) ? value.padStart(5, '0') : value

// Opens on today starting now (rounded up to the next opening-hours minute); after closing it moves to tomorrow's opening time.
function defaults() {
  const now = new Date()
  const [h, m] = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' }).format(now).split(':').map(Number)
  let date = labDay(now), start = Math.max(h * 60 + m, OPEN_HOUR * 60)
  if (start >= CLOSE_HOUR * 60 - 15) { date = labDay(+now + 86_400_000); start = OPEN_HOUR * 60 }
  return { date, start: hhmm(start), end: hhmm(Math.min(start + 60, CLOSE_HOUR * 60)) }
}

export default function BookingModal({ onClose, onSubmit, onInvalid, busy }) {
  const [form, setForm] = useState(() => ({ title: '', person: '', activity_type: ACTIVITY_TYPES[0], report_scope: REPORT_SCOPES[0], email: '', ...defaults() }))
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const setTime = key => e => setForm(f => ({ ...f, [key]: formatTyping(e.target.value) }))
  const finishTime = key => () => setForm(f => ({ ...f, [key]: padHour(f[key]) }))

  function submit(e) {
    e.preventDefault()
    if (!TIME.test(form.start) || !TIME.test(form.end)) return onInvalid('Enter times as HH:MM, e.g. 14:30.')
    const [start, end] = [padHour(form.start), padHour(form.end)]
    if (minutes(start) < OPEN_HOUR * 60 || minutes(end) > CLOSE_HOUR * 60) return onInvalid(`The lab is open ${OPEN}–${CLOSE}.`)
    if (minutes(end) <= minutes(start)) return onInvalid('End time must be after the start time.')
    const startAt = labDate(form.date, start)
    if (+startAt < new Date().setSeconds(0, 0)) return onInvalid('Start time cannot be earlier than now.')
    onSubmit({ title: form.title, person: form.person, email: form.email, activity_type: form.activity_type, report_scope: form.activity_type === 'Report' ? form.report_scope : null, start_at: startAt.toISOString(), end_at: labDate(form.date, end).toISOString() })
  }

  const isReport = form.activity_type === 'Report', isGroup = isReport && form.report_scope === 'Group'
  const nameLabel = isGroup ? 'Group name or leader' : 'Your name'
  const timeProps = key => ({ required: true, inputMode: 'numeric', autoComplete: 'off', placeholder: 'HH:MM', maxLength: 5, pattern: '([01]?\\d|2[0-3]):[0-5]\\d', title: '24-hour time, e.g. 14:30', value: form[key], onChange: setTime(key), onBlur: finishTime(key) })

  return <Modal title="Book the lab" subtitle="Your booking appears on the calendar once it is approved." onClose={onClose} onSubmit={submit}>
    <label>Title<input required minLength="3" maxLength="160" placeholder="e.g. Progress report" value={form.title} onChange={set('title')} /></label>
    <div className="form-row">
      <label>Type<Select value={form.activity_type} onChange={v => setForm(f => ({ ...f, activity_type: v }))} options={TYPE_OPTIONS} /></label>
      <label>Room<input value={ROOM_LABEL} readOnly disabled /></label>
    </div>
    {isReport && <fieldset className="segmented">
      <legend>Presented by</legend>
      {REPORT_SCOPES.map(scope => <label key={scope}><input type="radio" name="report_scope" value={scope} checked={form.report_scope === scope} onChange={set('report_scope')} />{scope}</label>)}
    </fieldset>}
    <label>{nameLabel}<input required minLength="2" maxLength="120" autoComplete={isGroup ? 'off' : 'name'} placeholder={isGroup ? 'e.g. Team A, or the leader\'s name' : undefined} value={form.person} onChange={set('person')} /></label>
    <div className="form-row three">
      <label>Date<DatePicker value={form.date} min={labDay(new Date())} onChange={v => setForm(f => ({ ...f, date: v }))} /></label>
      <label>From<input {...timeProps('start')} /></label>
      <label>To<input {...timeProps('end')} title="24-hour time, e.g. 15:30" /></label>
    </div>
    <p className="hint">The lab is open {OPEN}–{CLOSE}. Bookings cannot start in the past.</p>
    <label>Email <span className="optional">(optional)</span><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} /></label>
    <div className="modal-actions">
      <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Book'}</button>
    </div>
  </Modal>
}
