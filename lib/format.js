export const DAY_NAMES = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
export const WORK_HOURS = Array.from({ length: 10 }, (_, i) => i + 8)

export const mondayOf = input => { const d = new Date(input); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const dayISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const hourOf = value => new Date(value).getHours() + new Date(value).getMinutes() / 60
export const pad = n => String(n).padStart(2, '0')

// Phòng lab ở Việt Nam: cố định múi giờ để server render và trình duyệt cho cùng kết quả (tránh lệch hydration).
const TZ = 'Asia/Ho_Chi_Minh'
const part = (v, type) => Number(new Intl.DateTimeFormat('en-GB', { [type]: 'numeric', timeZone: TZ }).format(new Date(v)))
export const dayNum = v => part(v, 'day')
export const monthNum = v => part(v, 'month')

export const money = n => new Intl.NumberFormat('vi-VN').format(Math.abs(n)) + ' ₫'
export const fmtDate = d => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short' }).format(d)
export const timeText = v => new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).format(new Date(v))
export const longDate = v => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: TZ }).format(new Date(v))
export const txDate = v => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${v}T00:00:00`))
export const monthLabel = key => new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date(`${key}-01T00:00:00`))

export const eventColor = e => e.status === 'pending' ? 'pending' : e.activity_type === 'Báo cáo' ? 'mint' : 'blue'

export async function request(url, options) {
  const res = await fetch(url, { cache: 'no-store', ...options, ...(options?.body ? { headers: { 'Content-Type': 'application/json' } } : {}) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra, vui lòng thử lại.')
  return data
}
