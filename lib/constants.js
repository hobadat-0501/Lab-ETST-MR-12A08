export const ACTIVITY_TYPES = ['Report', 'Work']
export const TRANSACTION_KINDS = ['Income', 'Expense']
export const EVENT_STATUSES = ['pending', 'confirmed', 'rejected']

// The lab has a single room; bookings cannot choose another one.
export const ROOM = '12A08'

// Opening hours, in the lab's own time zone (Vietnam, UTC+7, no daylight saving).
export const OPEN_HOUR = 7
export const CLOSE_HOUR = 18
export const LAB_OFFSET = '+07:00'
export const LAB_OFFSET_MS = 7 * 3_600_000
