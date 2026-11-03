import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type Anchor = { left: number; top: number; width: number }

type PopoverProps = {
  anchor: Anchor
  onClose: () => void
  children: ReactNode
}

// Panel dipasang lewat portal dengan posisi fixed, agar tidak terpotong kartu yang ber-overflow.
// Posisi diukur pemanggil di penangan klik (bukan di efek), lalu dioper sebagai anchor.

/** Panel melayang di bawah pemicunya; tertutup oleh klik di luar, Esc, atau gulir halaman. */
export function Popover({ anchor, onClose, children }: PopoverProps) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!panel.current?.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={panel}
      style={{ left: anchor.left, top: anchor.top, minWidth: anchor.width }}
      className="fixed z-40 max-h-72 overflow-auto rounded-lg border border-line bg-white py-1 shadow-popover"
    >
      {children}
    </div>,
    document.body,
  )
}
