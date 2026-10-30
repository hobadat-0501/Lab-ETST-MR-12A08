import Shell from '../../../components/ui/Shell'
import { countPendingEvents } from '../../../lib/queries'
import { requireAdminPage } from '../../../lib/session'

export const metadata = { title: 'Quản trị — Lab ETST-MR 12A08', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }) {
  await requireAdminPage()
  const pendingCount = await countPendingEvents().catch(() => 0)
  return <Shell variant="admin" pendingCount={pendingCount}>{children}</Shell>
}
