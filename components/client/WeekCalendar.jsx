import { Clock3 } from 'lucide-react'
import { DAY_NAMES, WORK_HOURS, dayISO, eventColor, hourOf, pad, timeText } from '../../lib/format'

export default function WeekCalendar({ days, events }) {
  const today = dayISO(new Date())
  return <div className="week-grid">
    <div className="time-head"></div>
    {days.map(d => <div className={`day-head ${dayISO(d) === today ? 'today' : ''}`} key={dayISO(d)}><span>{DAY_NAMES[d.getDay()]}</span><b>{d.getDate()}</b>{dayISO(d) === today && <i>HÔM NAY</i>}</div>)}
    <div className="time-column">{WORK_HOURS.map(h => <div className="time-label" key={h}>{pad(h)}:00</div>)}</div>
    <div className="calendar-days">{days.map(d => <div className={`day-column ${dayISO(d) === today ? 'today' : ''}`} key={dayISO(d)}>
      {WORK_HOURS.map(h => <div className="hour-line" key={h}></div>)}
      {events.filter(e => dayISO(new Date(e.start_at)) === dayISO(d)).map(e => {
        const start = hourOf(e.start_at), end = hourOf(e.end_at)
        return <div className={`event ${eventColor(e)}`} key={e.id} style={{ top: `${(start - 8) * 62 + 5}px`, height: `${Math.max(35, (end - start) * 62 - 8)}px` }}>
          <strong>{e.title}</strong><span>{e.person}</span>
          <small><Clock3 size={11} />{timeText(e.start_at)} – {timeText(e.end_at)} <i>·</i> {e.room}</small>
        </div>
      })}
    </div>)}</div>
  </div>
}
