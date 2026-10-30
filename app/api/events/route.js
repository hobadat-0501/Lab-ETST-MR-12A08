import { isAdminRequest } from '../../../lib/auth'
import { createEvent } from '../../../lib/events'
import { ok, parse, readJson, route } from '../../../lib/http'
import { prisma } from '../../../lib/prisma'
import { toApiEvent } from '../../../lib/serializers'
import { eventInput } from '../../../lib/validators'

const parseDate = value => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(+date) ? date : null
}

// Công khai chỉ thấy lịch đã xác nhận; trang quản trị dùng /api/admin/events.
export const GET = route(async request => {
  const url = new URL(request.url)
  const from = parseDate(url.searchParams.get('from'))
  const to = parseDate(url.searchParams.get('to'))
  const admin = isAdminRequest(request)
  const data = await prisma.event.findMany({
    where: {
      status: admin ? { in: ['pending', 'confirmed'] } : 'confirmed',
      ...(from ? { startAt: { gte: from, ...(to ? { lt: to } : {}) } } : {}),
    },
    orderBy: { startAt: 'asc' },
  })
  return ok(data.map(event => toApiEvent(event, { admin })))
})

export const POST = route(async request => {
  const input = parse(eventInput, await readJson(request))
  return ok(toApiEvent(await createEvent(input)), 201)
})
