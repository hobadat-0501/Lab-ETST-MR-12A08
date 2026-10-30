import { setEventStatus } from '../../../../lib/events'
import { assertAdmin, ok, parse, readJson, route } from '../../../../lib/http'
import { eventStatusInput } from '../../../../lib/validators'

export const PATCH = route(async (request, context) => {
  assertAdmin(request)
  const { status, reject_reason } = parse(eventStatusInput, await readJson(request))
  const { id } = await context.params
  const event = await setEventStatus(id, status, reject_reason)
  return ok({ id: event.id, status: event.status })
})
