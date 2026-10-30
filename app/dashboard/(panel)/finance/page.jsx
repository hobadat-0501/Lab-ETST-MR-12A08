import FinanceView from '../../../../components/dashboard/FinanceView'
import { TRANSACTION_KINDS } from '../../../../lib/constants'
import { SERVICE_ERROR } from '../../../../lib/prisma'
import { financeSummary, listTransactions } from '../../../../lib/queries'
import { toApiTransaction } from '../../../../lib/serializers'
import { requireAdminPage } from '../../../../lib/session'
import { MONTH_PATTERN } from '../../../../lib/validators'

export const metadata = { title: 'Finance' }

export default async function FinancePage({ searchParams }) {
  await requireAdminPage()
  const params = await searchParams
  const month = MONTH_PATTERN.test(params.month ?? '') ? params.month : ''
  const kind = TRANSACTION_KINDS.includes(params.kind) ? params.kind : ''
  try {
    const [transactions, summary] = await Promise.all([listTransactions({ month, kind }), financeSummary(month || undefined)])
    return <FinanceView transactions={transactions.map(toApiTransaction)} summary={summary} month={month} kind={kind} />
  } catch (error) {
    console.error(error)
    return <p className="notice" role="alert">{SERVICE_ERROR}</p>
  }
}
