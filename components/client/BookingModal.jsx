'use client'
import { useState } from 'react'
import { ACTIVITY_TYPES, DURATIONS } from '../../lib/constants'
import Modal from '../ui/Modal'

const durationLabel = m => m < 60 ? `${m} minutes` : `${m / 60} ${m === 60 ? 'hour' : 'hours'}`

export default function BookingModal({ onClose, onSubmit, busy }) {
  const [form, setForm] = useState({ title: '', person: '', activity_type: ACTIVITY_TYPES[0], room: '', duration_minutes: 60, email: '' })
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  return <Modal title="Book the lab" subtitle="Your booking starts as soon as you submit it and appears on the calendar once approved." onClose={onClose}
    onSubmit={e => { e.preventDefault(); onSubmit({ ...form, duration_minutes: Number(form.duration_minutes) }) }}>
    <label>Title<input required minLength="3" maxLength="160" placeholder="e.g. Progress report" value={form.title} onChange={set('title')} /></label>
    <div className="form-row">
      <label>Your name<input required minLength="2" maxLength="120" autoComplete="name" value={form.person} onChange={set('person')} /></label>
      <label>Type<select value={form.activity_type} onChange={set('activity_type')}>{ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
    </div>
    <div className="form-row">
      <label>Room<input required minLength="2" maxLength="80" placeholder="e.g. Meeting room A" value={form.room} onChange={set('room')} /></label>
      <label>Duration<select value={form.duration_minutes} onChange={set('duration_minutes')}>{DURATIONS.map(m => <option key={m} value={m}>{durationLabel(m)}</option>)}</select></label>
    </div>
    <label>Email <span className="optional">(optional)</span><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} /></label>
    <div className="modal-actions">
      <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Book now'}</button>
    </div>
  </Modal>
}
