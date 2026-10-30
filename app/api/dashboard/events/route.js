import { assertAdmin, ok, parse, readJson, route } from '../../../../lib/http'
import { prisma } from '../../../../lib/prisma'
import { listEventsBetween } from '../../../../lib/queries'
import { toApiEvent } from '../../../../lib/serializers'
import { eventIdsInput } from '../../../../lib/validators'

// Dashboard calendar: pending and confirmed events with contact details.
export const GET = route(async request => {
  assertAdmin(request)
  const { searchParams } = new URL(request.url)
  const from = new Date(searchParams.get('from')), to = new Date(searchParams.get('to'))
  if (Number.isNaN(+from) || Number.isNaN(+to)) return ok([])
  return ok((await listEventsBetween(from, to, ['pending', 'confirmed'])).map(event => toApiEvent(event, { admin: true })))
})

// Permanently deletes the selected events.
export const DELETE = route(async request => {
  assertAdmin(request)
  const { ids } = parse(eventIdsInput, await readJson(request))
  const { count } = await prisma.event.deleteMany({ where: { id: { in: ids } } })
  return ok({ deleted: count })
})
