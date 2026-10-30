import { MONTH_PATTERN } from './validators'
import { prisma } from './prisma'

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
    where: { ...(occurredOn ? { occurredOn } : {}), ...(['Thu', 'Chi'].includes(kind) ? { kind } : {}) },
    orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }],
    take: 1000,
  })
}

// Số dư toàn thời gian và tổng thu/chi của một tháng, tính bằng aggregate ở database.
export async function financeSummary(month = currentMonth()) {
  const [all, monthly] = await Promise.all([
    prisma.transaction.groupBy({ by: ['kind'], _sum: { amount: true }, _count: true }),
    prisma.transaction.groupBy({ by: ['kind'], where: { occurredOn: monthRange(month) }, _sum: { amount: true }, _count: true }),
  ])
  const pick = (rows, kind) => rows.find(r => r.kind === kind)
  const sum = (rows, kind) => Number(pick(rows, kind)?._sum.amount ?? 0)
  const count = (rows, kind) => pick(rows, kind)?._count ?? 0
  return {
    balance: sum(all, 'Thu') - sum(all, 'Chi'),
    total: count(all, 'Thu') + count(all, 'Chi'),
    income: sum(monthly, 'Thu'), incomeCount: count(monthly, 'Thu'),
    expense: sum(monthly, 'Chi'), expenseCount: count(monthly, 'Chi'),
  }
}

export function listEvents(status = 'pending') {
  return prisma.event.findMany({
    where: status === 'all' ? {} : { status },
    orderBy: status === 'pending' ? [{ startAt: 'asc' }, { createdAt: 'asc' }] : [{ startAt: 'desc' }],
    take: 200,
  })
}

export const countPendingEvents = () => prisma.event.count({ where: { status: 'pending' } })
