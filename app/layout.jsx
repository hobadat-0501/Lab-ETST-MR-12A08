import { ToastProvider } from '../components/ui/Toast'
import './globals.css'

export const metadata = {
  title: 'Lab ETST-MR 12A08 — Lịch phòng lab',
  description: 'Lịch hoạt động và quản lý thu chi Lab ETST-MR 12A08',
}

export default function RootLayout({ children }) {
  return <html lang="vi"><body><ToastProvider>{children}</ToastProvider></body></html>
}
