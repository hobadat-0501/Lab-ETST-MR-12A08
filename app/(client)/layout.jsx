import { FlaskConical } from 'lucide-react'

export default function ClientLayout({ children }) {
  return <>
    <header className="client-bar"><div className="brand"><span className="brand-mark"><FlaskConical size={18} /></span><strong>ETST-MR LAB</strong></div></header>
    <main className="content">{children}</main>
  </>
}
