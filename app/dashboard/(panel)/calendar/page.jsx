import Calendar from '../../../../components/calendar/Calendar'
import { requireAdminPage } from '../../../../lib/session'

export const metadata = { title: 'Calendar' }

export default async function CalendarPage() {
  await requireAdminPage()
  return <>
    <div className="page-head"><div><h1>Calendar</h1><p>Approved and pending bookings. Select an event for details.</p></div></div>
    <Calendar admin />
  </>
}
