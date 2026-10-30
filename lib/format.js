import { LAB_OFFSET, LAB_OFFSET_MS } from './constants'

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const pad = n => String(n).padStart(2, '0')
export const mondayOf = input => { const d = new Date(input); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const dayISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Lab-time helpers: shift by the fixed UTC+7 offset so every visitor sees and enters the lab's local time.
const labShift = v => new Date(+new Date(v) + LAB_OFFSET_MS)
export const labDay = v => labShift(v).toISOString().slice(0, 10)
export const labHour = v => { const d = labShift(v); return d.getUTCHours() + d.getUTCMinutes() / 60 }
export const labDate = (day, time) => new Date(`${day}T${time}:00${LAB_OFFSET}`)

// The lab runs on Vietnam time: pin the zone so server-rendered and browser-rendered text agree.
const TZ = 'Asia/Ho_Chi_Minh'
const intl = options => new Intl.DateTimeFormat('en-GB', options)
const time = intl({ hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })
const longDay = intl({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ })
const shortDay = intl({ day: 'numeric', month: 'short' })
const shortMonth = intl({ month: 'short', timeZone: TZ })
const dayOfMonth = intl({ day: 'numeric', timeZone: TZ })

export const timeText = v => time.format(new Date(v))
export const longDate = v => longDay.format(new Date(v))
export const shortDate = d => shortDay.format(d)
export const monthShort = v => shortMonth.format(new Date(v))
export const dayNum = v => dayOfMonth.format(new Date(v))
export const txDate = v => intl({ day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${v}T00:00:00Z`))
export const monthLabel = key => intl({ month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${key}-01T00:00:00Z`))
export const money = n => `${new Intl.NumberFormat('en-US').format(Math.abs(n))} ₫`

// Label for the person on a booking: reports show whether an individual or a group (name / leader) presents.
export const bookedByLabel = e => e.report_scope === 'Group' ? 'Group / leader' : e.report_scope === 'Individual' ? 'Presenter' : 'Booked by'

// Each event gets one of the palette colors (c0–c9, see globals.css), picked from its id so it is
// random-looking but stable across refreshes and identical for every viewer. Pending events are striped.
export const EVENT_COLORS = 10
export const eventColor = e => {
  let hash = 0
  for (const ch of e.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return `c${hash % EVENT_COLORS}${e.status === 'pending' ? ' pending' : ''}`
}

export async function request(url, options) {
  const res = await fetch(url, { cache: 'no-store', ...options, ...(options?.body ? { headers: { 'Content-Type': 'application/json' } } : {}) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}
