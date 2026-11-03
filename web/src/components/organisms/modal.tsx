import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  title: string
  description?: ReactNode
  footer: ReactNode
  onClose: () => void
  children?: ReactNode
  // Selama aksi berjalan, Esc dan klik latar tidak menutup modal.
  dismissible?: boolean
}

/** Dialog konfirmasi board: judul, deskripsi, isi opsional, dan tombol di kaki kanan. */
export function Modal({ title, description, footer, onClose, children, dismissible = true }: ModalProps) {
  const titleId = useId()
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    box.current?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && dismissible) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dismissible, onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-500/60 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && dismissible) onClose()
      }}
    >
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full rounded-t-card bg-white p-6 shadow-modal outline-none sm:max-w-lg sm:rounded-card"
      >
        <h2 id={titleId} className="text-[17px] font-bold text-ink">
          {title}
        </h2>
        {description && <div className="mt-2.5 text-sm leading-relaxed text-ink-dim">{description}</div>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-3">{footer}</div>
      </div>
    </div>,
    document.body,
  )
}
