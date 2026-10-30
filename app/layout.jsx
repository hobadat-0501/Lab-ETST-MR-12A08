import { ToastProvider } from '../components/ui/Toast'
import './globals.css'

export const metadata = {
  title: { default: 'ETST-MR LAB', template: '%s · ETST-MR LAB' },
  description: 'ETST-MR LAB schedule and management',
}

export default function RootLayout({ children }) {
  return <html lang="en"><body><ToastProvider>{children}</ToastProvider></body></html>
}
