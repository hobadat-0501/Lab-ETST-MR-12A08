import { ACTIVITY_TYPES, EVENT_STATUSES, TRANSACTION_KINDS } from './constants'
import { labDate } from './format'
import { prisma } from './prisma'
import { MONTH_PATTERN } from './validators'

export const currentMonth = () => new Date().toISOString().slice(0, 7)

function monthRange(month) {
  if (!MONTH_PATTERN.test(month ?? '')) return undefined
  const start = new Date(`${month}-01T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 1)
  return { gte: start, lt: end }
}

export function listTransactions({ month, kind } = {}) {
  const occurredOn = monthRange(month)
  return prisma.transaction.findMany({
    where: { ...(occurredOn ? { occurredOn } : {}), ...(TRANSACTION_KINDS.includes(kind) ? { kind } : {}) },
    orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }],
    take: 1000,
  })
}

// All-time balance plus one month's income/expense, aggregated in the database.
export async function financeSummary(month = currentMonth()) {
  const [all, monthly] = await Promise.all([
    prisma.transaction.groupBy({ by: ['kind'], _sum: { amount: true }, _count: true }),
    prisma.transaction.groupBy({ by: ['kind'], where: { occurredOn: monthRange(month) }, _sum: { amount: true }, _count: true }),
  ])
  const pick = (rows, kind) => rows.find(r => r.kind === kind)
  const sum = (rows, kind) => Number(pick(rows, kind)?._sum.amount ?? 0)
  const count = (rows, kind) => pick(rows, kind)?._count ?? 0
  return {
    balance: sum(all, 'Income') - sum(all, 'Expense'),
    total: count(all, 'Income') + count(all, 'Expense'),
    income: sum(monthly, 'Income'), incomeCount: count(monthly, 'Income'),
    expense: sum(monthly, 'Expense'), expenseCount: count(monthly, 'Expense'),
  }
}

export function listEvents(status = 'pending') {
  return prisma.event.findMany({
    where: { status },
    orderBy: status === 'pending' ? [{ startAt: 'asc' }, { createdAt: 'asc' }] : [{ startAt: 'desc' }],
    take: 200,
  })
}

// Events overlapping a time window. The public calendar only ever receives confirmed ones.
export function listEventsBetween(from, to, statuses) {
  return prisma.event.findMany({
    where: { status: { in: statuses }, startAt: { lt: to }, endAt: { gt: from } },
    orderBy: { startAt: 'asc' },
  })
}

export const countPendingEvents = () => prisma.event.count({ where: { status: 'pending' } })

// Dashboard event manager: every booking, newest first, narrowed by the given filters (all optional).
// `from` / `to` are lab-local "YYYY-MM-DD" days, inclusive, compared with the event's start time.
export function searchEvents({ status, type, q, from, to } = {}) {
  const day = /^\d{4}-\d{2}-\d{2}$/
  const start = day.test(from ?? '') ? labDate(from, '00:00') : null
  const end = day.test(to ?? '') ? new Date(+labDate(to, '00:00') + 86_400_000) : null
  return prisma.event.findMany({
    where: {
      ...(EVENT_STATUSES.includes(status) ? { status } : {}),
      ...(ACTIVITY_TYPES.includes(type) ? { activityType: type } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { person: { contains: q, mode: 'insensitive' } }] } : {}),
      ...(start || end ? { startAt: { ...(start ? { gte: start } : {}), ...(end ? { lt: end } : {}) } } : {}),
    },
    orderBy: { startAt: 'desc' },
    take: 500,
  })
}
