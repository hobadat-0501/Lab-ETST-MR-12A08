import { assertAdmin, ok, route } from '../../../../lib/http'
import { listEventsBetween } from '../../../../lib/queries'
import { toApiEvent } from '../../../../lib/serializers'

// Dashboard calendar: pending and confirmed events with contact details.
export const GET = route(async request => {
  assertAdmin(request)
  const { searchParams } = new URL(request.url)
  const from = new Date(searchParams.get('from')), to = new Date(searchParams.get('to'))
  if (Number.isNaN(+from) || Number.isNaN(+to)) return ok([])
  return ok((await listEventsBetween(from, to, ['pending', 'confirmed'])).map(event => toApiEvent(event, { admin: true })))
})
