import EventsManager from '../../../../components/dashboard/EventsManager'
import { SERVICE_ERROR } from '../../../../lib/prisma'
import { searchEvents } from '../../../../lib/queries'
import { toApiEvent } from '../../../../lib/serializers'
import { requireAdminPage } from '../../../../lib/session'

export const metadata = { title: 'Events' }

export default async function EventsPage({ searchParams }) {
  await requireAdminPage()
  const params = await searchParams
  const filters = Object.fromEntries(['status', 'type', 'q', 'from', 'to'].map(key => [key, typeof params[key] === 'string' ? params[key].trim() : '']))
  try {
    const events = (await searchEvents(filters)).map(e => toApiEvent(e, { admin: true }))
    return <EventsManager key={JSON.stringify(filters)} events={events} filters={filters} />
  } catch (error) {
    console.error(error)
    return <p className="notice" role="alert">{SERVICE_ERROR}</p>
  }
}
