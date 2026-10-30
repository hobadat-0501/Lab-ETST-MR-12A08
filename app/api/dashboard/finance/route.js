import { assertAdmin, ok, parse, readJson, route } from '../../../../lib/http'
import { prisma } from '../../../../lib/prisma'
import { toApiTransaction, toTransactionData } from '../../../../lib/serializers'
import { transactionInput } from '../../../../lib/validators'

export const POST = route(async request => {
  assertAdmin(request)
  const input = parse(transactionInput, await readJson(request))
  const data = await prisma.transaction.create({ data: toTransactionData(input) })
  return ok(toApiTransaction(data), 201)
})
