'use client'
import Modal from './Modal'

// Confirmation popup (replaces window.confirm) for destructive actions. Cancel is focused first so Enter cannot delete by accident.
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', busy, onConfirm, onClose }) {
  return <Modal title={title} onClose={onClose} onSubmit={e => { e.preventDefault(); onConfirm() }}>
    <p className="confirm-text">{message}</p>
    <div className="modal-actions">
      <button className="secondary-button" type="button" autoFocus onClick={onClose}>Cancel</button>
      <button className="danger-button solid" type="submit" disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button>
    </div>
  </Modal>
}
