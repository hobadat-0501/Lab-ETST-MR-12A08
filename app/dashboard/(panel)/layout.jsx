import Shell from '../../../components/dashboard/Shell'
import { countPendingEvents } from '../../../lib/queries'
import { requireAdminPage } from '../../../lib/session'

export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } }

export default async function DashboardLayout({ children }) {
  await requireAdminPage()
  const pendingCount = await countPendingEvents().catch(() => 0)
  return <Shell pendingCount={pendingCount}>{children}</Shell>
}
