import { ToastProvider } from '../components/ui/Toast'
import './globals.css'

export const metadata = {
  title: { default: 'ETST-MR', template: '%s · ETST-MR' },
  description: 'ETST-MR lab schedule and management',
}

export default function RootLayout({ children }) {
  return <html lang="en"><body><ToastProvider>{children}</ToastProvider></body></html>
}
