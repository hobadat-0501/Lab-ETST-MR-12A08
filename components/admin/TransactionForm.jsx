'use client'
import { Banknote } from 'lucide-react'
import { useState } from 'react'
import { dayISO } from '../../lib/format'
import Modal from '../ui/Modal'

export default function TransactionForm({ transaction, onClose, onSubmit, busy }) {
  const [form, setForm] = useState({
    name: transaction?.name ?? '', description: transaction?.description ?? '', kind: transaction?.kind ?? 'Chi',
    amount: transaction?.amount ?? '', occurred_on: transaction?.occurred_on ?? dayISO(new Date()),
  })
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return <Modal icon={Banknote} title={transaction ? 'Sửa giao dịch' : 'Thêm giao dịch'} subtitle="Giao dịch được lưu trong PostgreSQL." onClose={onClose}
    onSubmit={e => { e.preventDefault(); onSubmit({ ...form, amount: Number(form.amount) }) }}>
    <label>Nội dung<input required minLength="2" value={form.name} onChange={e => upd('name', e.target.value)} placeholder="VD: Mua vật tư thí nghiệm" /></label>
    <label>Mô tả<input value={form.description} onChange={e => upd('description', e.target.value)} placeholder="Thông tin bổ sung (không bắt buộc)" /></label>
    <div className="form-row">
      <label>Loại giao dịch<select value={form.kind} onChange={e => upd('kind', e.target.value)}><option>Chi</option><option>Thu</option></select></label>
      <label>Ngày<input required type="date" value={form.occurred_on} onChange={e => upd('occurred_on', e.target.value)} /></label>
    </div>
    <label>Số tiền (VNĐ)<input required type="number" min="1" step="1" value={form.amount} onChange={e => upd('amount', e.target.value)} placeholder="0" /></label>
    <div className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Hủy</button><button className="primary-button" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu giao dịch'}</button></div>
  </Modal>
}
