import { createEvent } from '../../../../lib/events'
import { assertAdmin, ok, parse, readJson, route } from '../../../../lib/http'
import { listEvents } from '../../../../lib/queries'
import { toApiEvent } from '../../../../lib/serializers'
import { EVENT_STATUSES, eventInput } from '../../../../lib/validators'

export const GET = route(async request => {
  assertAdmin(request)
  const status = new URL(request.url).searchParams.get('status')
  const events = await listEvents(EVENT_STATUSES.includes(status) || status === 'all' ? status : 'pending')
  return ok(events.map(event => toApiEvent(event, { admin: true })))
})

// Quản lý tạo lịch trực tiếp, không cần qua bước chờ duyệt.
export const POST = route(async request => {
  assertAdmin(request)
  const input = parse(eventInput, await readJson(request))
  return ok(toApiEvent(await createEvent(input, 'confirmed'), { admin: true }), 201)
})
