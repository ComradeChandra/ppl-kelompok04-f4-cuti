import type { ReactNode } from 'react'
import type { BadgeTone } from '../../types/ui'

const TONE: Record<BadgeTone, string> = {
  neutral: 'border-line-strong bg-line-faint text-ink-dim',
  warning: 'border-warning-line bg-warning-soft text-warning-ink',
  success: 'border-success-line bg-success-soft text-success-ink',
  danger: 'border-red-200 bg-danger-soft text-danger',
}

/** Lencana pil; warna dipilih pemanggil lewat tone. */
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONE[tone]}`}>
      {children}
    </span>
  )
}
