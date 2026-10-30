'use client'
import { Activity, ArrowRight, Beaker, CalendarDays, ChevronLeft, ChevronRight, Plus, Search, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, dayISO, eventColor, fmtDate, mondayOf, pad, request, timeText } from '../../lib/format'
import { useToast } from '../ui/Toast'
import BookingModal from './BookingModal'
import WeekCalendar from './WeekCalendar'

export default function ScheduleView() {
  const notify = useToast()
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()))
  const [events, setEvents] = useState([])
  const [apiError, setApiError] = useState('')
  const [filter, setFilter] = useState('Tất cả')
  const [query, setQuery] = useState('')
  const [booking, setBooking] = useState(false)
  const [busy, setBusy] = useState(false)

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const weekLabel = `${fmtDate(days[0])} – ${fmtDate(days[6])}, ${days[6].getFullYear()}`

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ from: weekStart.toISOString(), to: addDays(weekStart, 7).toISOString() })
      setEvents(await request(`/api/events?${params}`))
      setApiError('')
    } catch (e) { setEvents([]); setApiError(e.message) }
  }, [weekStart])
  useEffect(() => { load() }, [load])

  const filtered = events.filter(e => (filter === 'Tất cả' || e.activity_type === filter) && (!query || `${e.title} ${e.person} ${e.room}`.toLowerCase().includes(query.toLowerCase())))

  async function submit(body) {
    setBusy(true)
    try {
      await request('/api/events', { method: 'POST', body: JSON.stringify(body) })
      setBooking(false)
      notify('Đã gửi đăng ký. Lịch sẽ hiển thị sau khi quản lý xác nhận.')
      await load()
    } catch (e) { notify(e.message) } finally { setBusy(false) }
  }

  return <div className="content">
    <section className="page-heading"><div><div className="eyebrow"><span className={`live-dot ${apiError ? 'offline' : ''}`}></span> KHÔNG GIAN CHUNG <span className="eyebrow-sep">/</span> LAB ETST-MR 12A08</div><h1>Lịch phòng lab</h1><p>Theo dõi lịch báo cáo và hoạt động nghiên cứu của mọi người.</p></div><button className="primary-button" onClick={() => setBooking(true)}><Plus size={17} /> Đăng ký lịch</button></section>
    <section className="overview-strip">
      <div className="overview-cell"><span className="overview-icon"><CalendarDays size={18} /></span><div><small>LỊCH TRONG TUẦN</small><strong>{events.length} <em>hoạt động</em></strong></div></div>
      <div className="overview-cell"><span className="overview-icon green"><Activity size={18} /></span><div><small>HIỆN ĐANG HIỂN THỊ</small><strong>{filtered.length} <em>hoạt động</em></strong></div></div>
      <div className="overview-note"><span className="note-mark">“</span><span>Lịch đã xác nhận được chia sẻ công khai.<br />Đăng ký lịch không cần tài khoản.</span></div>
    </section>
    {apiError && <div className="data-notice"><ShieldCheck size={15} /><span>{apiError}</span></div>}
    <section className="calendar-panel">
      <div className="calendar-toolbar">
        <div className="month-control">
          <button className="arrow-button" aria-label="Tuần trước" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft size={18} /></button>
          <h2>{weekLabel}</h2>
          <button className="arrow-button" aria-label="Tuần sau" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight size={18} /></button>
          <button className="today-button" onClick={() => setWeekStart(mondayOf(new Date()))}>Tuần này</button>
        </div>
        <div className="calendar-tools">
          <label className="search-box"><Search size={15} /><input placeholder="Tìm hoạt động..." value={query} onChange={e => setQuery(e.target.value)} /></label>
          <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Lọc loại lịch"><option>Tất cả</option><option>Báo cáo</option><option>Làm việc</option></select>
        </div>
      </div>
      <WeekCalendar days={days} events={filtered} />
      <div className="calendar-foot"><div className="legend"><span><i className="legend-dot mint-dot"></i>Báo cáo</span><span><i className="legend-dot blue-dot"></i>Làm việc</span></div><span><span className="lock-symbol">◉</span> Lịch công khai · Không cần tài khoản</span></div>
    </section>
    <section className="below-grid">
      <div className="upcoming">
        <div className="section-title"><div><h3>Sắp diễn ra</h3><p>Hoạt động trong tuần {weekLabel}</p></div><span className="text-count">{filtered.length} lịch</span></div>
        {filtered.length ? filtered.slice().sort((a, b) => new Date(a.start_at) - new Date(b.start_at)).slice(0, 4).map(e => <div className="upcoming-row" key={e.id}>
          <div className="date-box"><b>{new Date(e.start_at).getDate()}</b><small>TH{pad(new Date(e.start_at).getMonth() + 1)}</small></div>
          <div className={`event-line ${eventColor(e)}`}></div>
          <div className="upcoming-info"><strong>{e.title}</strong><span>{e.person} · {e.room}</span></div>
          <small className="upcoming-time">{timeText(e.start_at)} – {timeText(e.end_at)}</small><ChevronRight size={16} />
        </div>) : <div className="empty-state">{apiError ? 'Chưa thể tải lịch khi database chưa kết nối.' : 'Tuần này chưa có lịch đã xác nhận.'}</div>}
      </div>
      <div className="quick-card">
        <div className="quick-top"><span className="quick-icon"><Beaker size={18} /></span><span className="open-tag"><span className="live-dot"></span> MỞ ĐĂNG KÝ</span></div>
        <h3>Bạn cần sử dụng phòng lab?</h3><p>Đăng ký lịch báo cáo hoặc làm việc. Quản lý sẽ xác nhận trước khi lịch xuất hiện công khai.</p>
        <button onClick={() => setBooking(true)}>Tạo đăng ký <ArrowRight size={15} /></button><div className="quick-decoration">✳</div>
      </div>
    </section>
    {booking && <BookingModal days={days} onClose={() => setBooking(false)} onSubmit={submit} busy={busy} />}
  </div>
}
