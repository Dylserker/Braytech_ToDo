import { useEffect, type ReactNode } from 'react'
import './Modal.css'

type ModalProps = {
  isOpen: boolean
  title: string
  eyebrow?: string
  onClose: () => void
  children: ReactNode
}

function Modal({ isOpen, title, eyebrow, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className="modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal__close" type="button" aria-label="Fermer" onClick={onClose}>
          ×
        </button>
        {eyebrow && <p className="modal__eyebrow">{eyebrow}</p>}
        <h2 id="modal-title">{title}</h2>
        {children}
      </section>
    </div>
  )
}

export default Modal