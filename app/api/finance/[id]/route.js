import { assertAdmin, ok, parse, readJson, route } from '../../../../lib/http'
import { prisma } from '../../../../lib/prisma'
import { toApiTransaction, toTransactionData } from '../../../../lib/serializers'
import { transactionInput } from '../../../../lib/validators'

export const PATCH = route(async (request, context) => {
  assertAdmin(request)
  const input = parse(transactionInput, await readJson(request))
  const { id } = await context.params
  return ok(toApiTransaction(await prisma.transaction.update({ where: { id }, data: toTransactionData(input) })))
})

export const DELETE = route(async (request, context) => {
  assertAdmin(request)
  const { id } = await context.params
  await prisma.transaction.delete({ where: { id } })
  return ok({ ok: true })
})
