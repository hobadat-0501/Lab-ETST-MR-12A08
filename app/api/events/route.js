import { createEvent } from '../../../lib/events'
import { ok, parse, readJson, route } from '../../../lib/http'
import { listEventsBetween } from '../../../lib/queries'
import { toApiEvent } from '../../../lib/serializers'
import { eventInput } from '../../../lib/validators'

// Public: confirmed events only, with no contact details.
export const GET = route(async request => {
  const { searchParams } = new URL(request.url)
  const from = new Date(searchParams.get('from')), to = new Date(searchParams.get('to'))
  if (Number.isNaN(+from) || Number.isNaN(+to)) return ok([])
  return ok((await listEventsBetween(from, to, ['confirmed'])).map(event => toApiEvent(event)))
})

export const POST = route(async request => {
  const input = parse(eventInput, await readJson(request))
  return ok(toApiEvent(await createEvent(input)), 201)
})
