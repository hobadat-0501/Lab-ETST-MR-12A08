'use client'
import { CalendarDays, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { DAY_NAMES, WORK_HOURS, dayISO, pad } from '../../lib/format'
import Modal from '../ui/Modal'

const hourOptions = WORK_HOURS.map(h => <option key={h} value={h}>{pad(h)}:00</option>)

export default function BookingModal({ days, onClose, onSubmit, busy }) {
  const [form, setForm] = useState({ title: '', person: '', type: 'Báo cáo', room: 'Phòng họp A', date: dayISO(days[0]), start: 9, end: 10, email: '' })
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const at = hour => new Date(`${form.date}T${pad(hour)}:00`).toISOString()

  return <Modal icon={CalendarDays} title="Đăng ký sử dụng phòng" subtitle="Đăng ký được quản lý xác nhận trước khi hiển thị trong lịch chung." onClose={onClose}
    onSubmit={e => { e.preventDefault(); onSubmit({ title: form.title, person: form.person, email: form.email, activity_type: form.type, room: form.room, start_at: at(form.start), end_at: at(form.end) }) }}>
    <label>Tên hoạt động<input required minLength="3" placeholder="VD: Báo cáo tiến độ đề tài" value={form.title} onChange={e => upd('title', e.target.value)} /></label>
    <div className="form-row">
      <label>Người đăng ký<input required placeholder="Họ và tên" value={form.person} onChange={e => upd('person', e.target.value)} /></label>
      <label>Loại hoạt động<select value={form.type} onChange={e => upd('type', e.target.value)}><option>Báo cáo</option><option>Làm việc</option></select></label>
    </div>
    <div className="form-row">
      <label>Ngày<select value={form.date} onChange={e => upd('date', e.target.value)}>{days.map(d => <option value={dayISO(d)} key={dayISO(d)}>{DAY_NAMES[d.getDay()]}, {d.getDate()} tháng {d.getMonth() + 1}</option>)}</select></label>
      <label>Phòng<input required value={form.room} onChange={e => upd('room', e.target.value)} placeholder="Tên phòng" /></label>
    </div>
    <div className="form-row">
      <label>Bắt đầu<select value={form.start} onChange={e => upd('start', Number(e.target.value))}>{hourOptions}</select></label>
      <label>Kết thúc<select value={form.end} onChange={e => upd('end', Number(e.target.value))}>{hourOptions}</select></label>
    </div>
    <label>Email liên hệ<input type="email" placeholder="ban@example.com" value={form.email} onChange={e => upd('email', e.target.value)} /></label>
    <div className="form-note"><ShieldCheck size={15} /> Không cần tài khoản. Lịch sẽ hiển thị sau khi quản lý xác nhận.</div>
    <div className="modal-actions">
      <button className="secondary-button" type="button" onClick={onClose}>Hủy</button>
      <button className="primary-button" type="submit" disabled={busy}><CalendarDays size={16} />{busy ? 'Đang gửi…' : 'Gửi đăng ký'}</button>
    </div>
  </Modal>
}
