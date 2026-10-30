import { ShieldCheck } from 'lucide-react'

export default function DataNotice({ children }) {
  return <div className="data-notice" role="alert"><ShieldCheck size={15} /><span>{children}</span></div>
}
