import { assertAdmin, ok, parse, readJson, route } from '../../../lib/http'
import { prisma } from '../../../lib/prisma'
import { listTransactions } from '../../../lib/queries'
import { toApiTransaction, toTransactionData } from '../../../lib/serializers'
import { transactionInput } from '../../../lib/validators'

export const GET = route(async request => {
  assertAdmin(request)
  const params = new URL(request.url).searchParams
  const data = await listTransactions({ month: params.get('month'), kind: params.get('kind') })
  return ok(data.map(toApiTransaction))
})

export const POST = route(async request => {
  assertAdmin(request)
  const input = parse(transactionInput, await readJson(request))
  const data = await prisma.transaction.create({ data: toTransactionData(input) })
  return ok(toApiTransaction(data), 201)
})
