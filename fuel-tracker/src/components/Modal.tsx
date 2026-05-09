import "./Modal.css"
import type { ReactNode } from "react"

interface Props {
  onClose: () => void
  children: ReactNode
  title: string
}

function Modal({ onClose, children, title }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}

export default Modal