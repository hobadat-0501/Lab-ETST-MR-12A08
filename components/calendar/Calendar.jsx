'use client'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ACTIVITY_TYPES, CLOSE_HOUR, OPEN_HOUR } from '../../lib/constants'
import { DAY_NAMES, addDays, bookedByLabel, dayISO, eventColor, labDate, labDay, labHour, longDate, mondayOf, pad, request, shortDate, timeText } from '../../lib/format'
import BookingModal from '../client/BookingModal'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import { useToast } from '../ui/Toast'
import { usePolling } from '../ui/usePolling'

const HOUR_PX = 64
const POLL_MS = 5000 // how often other people's changes are picked up
const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i)
const TYPE_FILTER = [{ value: '', label: 'All types' }, ...ACTIVITY_TYPES.map(t => ({ value: t, label: t }))]
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
      const params = new URLSearchParams({ from: labDate(dayISO(weekStart), '00:00').toISOString(), to: labDate(dayISO(addDays(weekStart, 7)), '00:00').toISOString() })
      setEvents(await request(`${endpoint}?${params}`))
      setError('')
    } catch (e) { setError(e.message) } // keep what is already shown if a refresh fails
  }, [weekStart, endpoint])

  useEffect(() => { setWeekStart(mondayOf(new Date())) }, [])
  useEffect(() => { load() }, [load])
  usePolling(load, POLL_MS)

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
  const today = labDay(new Date())

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
        <Select ariaLabel="Filter by type" value={type} onChange={setType} options={TYPE_FILTER} />
        {!admin && <button className="primary-button" onClick={() => setBooking(true)}><Plus size={16} />Book</button>}
      </div>
    </div>
    {error && <p className="notice" role="alert">{error}</p>}

    <div className="week">
      <div className="week-head">
        <div />
        {days.map(d => <div key={dayISO(d)} className={`day-head${dayISO(d) === today ? ' today' : ''}`}><span>{DAY_NAMES[d.getDay()]}</span><b>{d.getDate()}</b></div>)}
      </div>
      <div className="week-body" style={{ '--hour': `${HOUR_PX}px`, '--hours': HOURS.length }}>
        <div className="time-col">{HOURS.map(h => <span key={h}>{pad(h)}:00</span>)}</div>
        {days.map(d => {
          const iso = dayISO(d)
          return <div key={iso} className={`day-col${iso === today ? ' today' : ''}`}>
            {layoutDay(visible.filter(e => labDay(e.start_at) === iso)).map(({ event: e, lane, lanes }) => {
              const start = Math.max(OPEN_HOUR, labHour(e.start_at)), end = labDay(e.end_at) === iso ? Math.min(CLOSE_HOUR, labHour(e.end_at)) : CLOSE_HOUR
              if (end <= start) return null // outside opening hours (legacy data)
              const height = Math.max(26, (end - start) * HOUR_PX - 2)
              return <button key={e.id} className={`event ${eventColor(e)}${height < 56 ? ' compact' : ''}`} onClick={() => setSelected(e)}
                title={`${e.title} · ${timeText(e.start_at)} – ${timeText(e.end_at)} · ${e.person}`}
                style={{ top: (start - OPEN_HOUR) * HOUR_PX + 1, height, left: `calc(${lane / lanes * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}>
                <strong>{e.title}</strong><span>{timeText(e.start_at)} – {timeText(e.end_at)} · {e.room}</span>
              </button>
            })}
          </div>
        })}
      </div>
    </div>
    <div className="legend">
      <span>Each booking gets its own color.</span>{admin && <span><i className="swatch" />Striped = pending approval</span>}
    </div>

    {selected && <Modal title={selected.title} subtitle={admin ? STATUS_LABEL[selected.status] : undefined} onClose={() => setSelected(null)}>
      <dl className="details">
        <dt>Type</dt><dd>{selected.activity_type}{selected.report_scope && ` · ${selected.report_scope}`}</dd>
        <dt>Date</dt><dd>{longDate(selected.start_at)}</dd>
        <dt>Time</dt><dd>{timeText(selected.start_at)} – {timeText(selected.end_at)}</dd>
        <dt>Room</dt><dd>{selected.room}</dd>
        <dt>{bookedByLabel(selected)}</dt><dd>{selected.person}</dd>
        {selected.email && <><dt>Email</dt><dd>{selected.email}</dd></>}
      </dl>
      <div className="modal-actions">
        {admin && selected.status === 'pending' && <Link className="primary-button" href="/dashboard/approvals">Review request</Link>}
        <button className="secondary-button" type="button" onClick={() => setSelected(null)}>Close</button>
      </div>
    </Modal>}
    {booking && <BookingModal onClose={() => setBooking(false)} onSubmit={book} onInvalid={notify} busy={busy} />}
  </section>
}
