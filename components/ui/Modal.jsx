'use client'
import { X } from 'lucide-react'

export default function Modal({ icon: Icon, title, subtitle, onClose, onSubmit, className = '', children }) {
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className={`modal ${className}`} onSubmit={onSubmit}>
      <div className="modal-head">
        <div>{Icon && <span className="modal-icon"><Icon size={19} /></span>}<h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="close-button" aria-label="Đóng" onClick={onClose}><X size={19} /></button>
      </div>
      {children}
    </form>
  </div>
}
