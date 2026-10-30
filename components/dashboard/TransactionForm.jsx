'use client'
import { useState } from 'react'
import { TRANSACTION_KINDS } from '../../lib/constants'
import { dayISO } from '../../lib/format'
import DatePicker from '../ui/DatePicker'
import Modal from '../ui/Modal'
import Select from '../ui/Select'

const KIND_OPTIONS = TRANSACTION_KINDS.map(k => ({ value: k, label: k }))

export default function TransactionForm({ transaction, onClose, onSubmit, busy }) {
  const [form, setForm] = useState({
    name: transaction?.name ?? '', description: transaction?.description ?? '', kind: transaction?.kind ?? 'Expense',
    amount: transaction?.amount ?? '', occurred_on: transaction?.occurred_on ?? dayISO(new Date()),
  })
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  return <Modal title={transaction ? 'Edit transaction' : 'New transaction'} onClose={onClose}
    onSubmit={e => { e.preventDefault(); onSubmit({ ...form, amount: Number(form.amount) }) }}>
    <label>Title<input required minLength="2" maxLength="160" value={form.name} onChange={set('name')} placeholder="e.g. Lab supplies" /></label>
    <label>Description <span className="optional">(optional)</span><input maxLength="500" value={form.description} onChange={set('description')} /></label>
    <div className="form-row">
      <label>Type<Select value={form.kind} onChange={v => setForm(f => ({ ...f, kind: v }))} options={KIND_OPTIONS} /></label>
      <label>Date<DatePicker value={form.occurred_on} onChange={v => setForm(f => ({ ...f, occurred_on: v }))} /></label>
    </div>
    <label>Amount (₫)<input required type="number" min="1" step="1" inputMode="numeric" value={form.amount} onChange={set('amount')} placeholder="0" /></label>
    <div className="modal-actions">
      <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    </div>
  </Modal>
}
