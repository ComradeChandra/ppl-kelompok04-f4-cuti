import type { ReactNode } from 'react'
import { readOnlyBoxClass } from '../../lib/input-style'

type ReadOnlyFieldProps = {
  children: ReactNode
  hint?: string
  error?: boolean
  labelledBy?: string
}

/** Kotak nilai yang tidak bisa diubah pengguna, dengan keterangan kecil di kanan. */
export function ReadOnlyField({ children, hint, error, labelledBy }: ReadOnlyFieldProps) {
  return (
    <div
      role="status"
      aria-labelledby={labelledBy}
      aria-invalid={error || undefined}
      className={readOnlyBoxClass(error)}
    >
      <span>{children}</span>
      {hint && <span className="text-xs whitespace-nowrap text-ink-faint">{hint}</span>}
    </div>
  )
}
