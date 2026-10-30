export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const HOURS = Array.from({ length: 24 }, (_, i) => i)

export const pad = n => String(n).padStart(2, '0')
export const mondayOf = input => { const d = new Date(input); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const dayISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const hourOf = value => new Date(value).getHours() + new Date(value).getMinutes() / 60

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

export const eventColor = e => e.status === 'pending' ? 'pending' : e.activity_type === 'Report' ? 'report' : 'work'

export async function request(url, options) {
  const res = await fetch(url, { cache: 'no-store', ...options, ...(options?.body ? { headers: { 'Content-Type': 'application/json' } } : {}) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}
