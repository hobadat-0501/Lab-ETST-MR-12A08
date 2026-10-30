import DataNotice from '../../../../components/admin/DataNotice'
import FinanceView from '../../../../components/admin/FinanceView'
import { databaseErrorMessage } from '../../../../lib/prisma'
import { financeSummary, listTransactions } from '../../../../lib/queries'
import { toApiTransaction } from '../../../../lib/serializers'
import { requireAdminPage } from '../../../../lib/session'
import { MONTH_PATTERN, TRANSACTION_KINDS } from '../../../../lib/validators'

export default async function FinancePage({ searchParams }) {
  await requireAdminPage()
  const params = await searchParams
  const month = MONTH_PATTERN.test(params.month ?? '') ? params.month : ''
  const kind = TRANSACTION_KINDS.includes(params.kind) ? params.kind : ''
  try {
    const [transactions, summary] = await Promise.all([listTransactions({ month, kind }), financeSummary(month || undefined)])
    return <FinanceView transactions={transactions.map(toApiTransaction)} summary={summary} month={month} kind={kind} />
  } catch {
    return <div className="content"><DataNotice>{databaseErrorMessage()}</DataNotice></div>
  }
}
