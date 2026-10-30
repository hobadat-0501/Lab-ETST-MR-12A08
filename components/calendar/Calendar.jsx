'use client'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ACTIVITY_TYPES } from '../../lib/constants'
import { DAY_NAMES, HOURS, addDays, dayISO, eventColor, hourOf, longDate, mondayOf, pad, request, shortDate, timeText } from '../../lib/format'
import BookingModal from '../client/BookingModal'
import Modal from '../ui/Modal'
import { useToast } from '../ui/Toast'

const HOUR_PX = 56
const STATUS_LABEL = { pending: 'Pending approval', confirmed: 'Approved', rejected: 'Rejected' }

// Splits one day's events into side-by-side lanes so overlapping events (different rooms) stay visible.
function layoutDay(events) {
  const sorted = [...events].sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
  const placed = []
  let group = [], groupEnd = 0, laneEnds = []
  const flush = () => { const lanes = laneEnds.length; group.forEach(item => placed.push({ ...item, lanes })); group = []; laneEnds = [] }
  for (const event of sorted) {
    const start = +new Date(event.start_at), end = +new Date(event.end_at)
    if (group.length && start >= groupEnd) flush()
    let lane = laneEnds.findIndex(laneEnd => laneEnd <= start)
    if (lane < 0) lane = laneEnds.length
    laneEnds[lane] = end
    groupEnd = group.length ? Math.max(groupEnd, end) : end
    group.push({ event, lane })
  }
  flush()
  return placed
}

// Week calendar shared by both areas. The client sees approved events and can book; the dashboard also sees pending ones.
export default function Calendar({ admin = false }) {
  const notify = useToast()
  const scroller = useRef(null)
  const [weekStart, setWeekStart] = useState(null) // set after mount so server and browser agree on "today"
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const [type, setType] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [booking, setBooking] = useState(false)
  const [busy, setBusy] = useState(false)

  const days = useMemo(() => weekStart ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) : [], [weekStart])
  const endpoint = admin ? '/api/dashboard/events' : '/api/events'

  const load = useCallback(async () => {
    if (!weekStart) return
    try {
      const params = new URLSearchParams({ from: weekStart.toISOString(), to: addDays(weekStart, 7).toISOString() })
      setEvents(await request(`${endpoint}?${params}`))
      setError('')
    } catch (e) { setEvents([]); setError(e.message) }
  }, [weekStart, endpoint])

  useEffect(() => { setWeekStart(mondayOf(new Date())) }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => { if (weekStart && scroller.current && !scroller.current.scrollTop) scroller.current.scrollTop = 7 * HOUR_PX }, [weekStart])

  async function book(body) {
    setBusy(true)
    try {
      await request('/api/events', { method: 'POST', body: JSON.stringify(body) })
      setBooking(false)
      notify('Request sent. It will appear on the calendar once approved.')
      await load()
    } catch (e) { notify(e.message) } finally { setBusy(false) }
  }

  if (!weekStart) return <section className="calendar" aria-busy="true" />

  const needle = query.trim().toLowerCase()
  const visible = events.filter(e => (!type || e.activity_type === type) && (!needle || `${e.title} ${e.person} ${e.room}`.toLowerCase().includes(needle)))
  const today = dayISO(new Date())

  return <section className="calendar">
    <div className="calendar-toolbar">
      <div className="week-nav">
        <button className="icon-button" aria-label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft size={18} /></button>
        <h2>{shortDate(days[0])} – {shortDate(days[6])}, {days[6].getFullYear()}</h2>
        <button className="icon-button" aria-label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight size={18} /></button>
        <button className="outline-button" onClick={() => setWeekStart(mondayOf(new Date()))}>Today</button>
      </div>
      <div className="calendar-tools">
        <label className="search-box"><Search size={15} /><input type="search" aria-label="Search events" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <select aria-label="Filter by type" value={type} onChange={e => setType(e.target.value)}><option value="">All types</option>{ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}</select>
        {!admin && <button className="primary-button" onClick={() => setBooking(true)}><Plus size={16} />Book</button>}
      </div>
    </div>
    {error && <p className="notice" role="alert">{error}</p>}

    <div className="week" ref={scroller}>
      <div className="week-head">
        <div />
        {days.map(d => <div key={dayISO(d)} className={`day-head${dayISO(d) === today ? ' today' : ''}`}><span>{DAY_NAMES[d.getDay()]}</span><b>{d.getDate()}</b></div>)}
      </div>
      <div className="week-body" style={{ '--hour': `${HOUR_PX}px` }}>
        <div className="time-col">{HOURS.map(h => <span key={h}>{pad(h)}:00</span>)}</div>
        {days.map(d => {
          const iso = dayISO(d)
          return <div key={iso} className={`day-col${iso === today ? ' today' : ''}`}>
            {layoutDay(visible.filter(e => dayISO(new Date(e.start_at)) === iso)).map(({ event: e, lane, lanes }) => {
              const start = hourOf(e.start_at), end = dayISO(new Date(e.end_at)) === iso ? hourOf(e.end_at) : 24
              return <button key={e.id} className={`event ${eventColor(e)}`} onClick={() => setSelected(e)}
                style={{ top: start * HOUR_PX + 1, height: Math.max(22, (end - start) * HOUR_PX - 2), left: `calc(${lane / lanes * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}>
                <strong>{e.title}</strong><span>{timeText(e.start_at)} – {timeText(e.end_at)} · {e.room}</span>
              </button>
            })}
          </div>
        })}
      </div>
    </div>
    <div className="legend">
      <span><i className="dot report" />Report</span><span><i className="dot work" />Work</span>{admin && <span><i className="dot pending" />Pending</span>}
    </div>

    {selected && <Modal title={selected.title} subtitle={admin ? STATUS_LABEL[selected.status] : undefined} onClose={() => setSelected(null)}>
      <dl className="details">
        <dt>Type</dt><dd>{selected.activity_type}</dd>
        <dt>Date</dt><dd>{longDate(selected.start_at)}</dd>
        <dt>Time</dt><dd>{timeText(selected.start_at)} – {timeText(selected.end_at)}</dd>
        <dt>Room</dt><dd>{selected.room}</dd>
        <dt>Booked by</dt><dd>{selected.person}</dd>
        {selected.email && <><dt>Email</dt><dd>{selected.email}</dd></>}
      </dl>
      <div className="modal-actions">
        {admin && selected.status === 'pending' && <Link className="primary-button" href="/dashboard/approvals">Review request</Link>}
        <button className="secondary-button" type="button" onClick={() => setSelected(null)}>Close</button>
      </div>
    </Modal>}
    {booking && <BookingModal onClose={() => setBooking(false)} onSubmit={book} busy={busy} />}
  </section>
}
