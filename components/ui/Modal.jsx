'use client'
import { X } from 'lucide-react'
import { useEffect, useId } from 'react'

// Dialog that closes on Escape or a backdrop click. Renders a <form> when onSubmit is given.
export default function Modal({ title, subtitle, onClose, onSubmit, children }) {
  const titleId = useId()
  const Body = onSubmit ? 'form' : 'div'
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <Body className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onSubmit={onSubmit}>
      <div className="modal-head">
        <div><h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button>
      </div>
      {children}
    </Body>
  </div>
}
