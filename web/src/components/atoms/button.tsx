import type { ButtonHTMLAttributes } from 'react'
import { buttonClass, type ButtonSize, type ButtonVariant } from '../../lib/button-style'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  // Saat permintaan berjalan: tombol nonaktif, berlingkaran putar, dan berlabel loadingLabel.
  loading?: boolean
  loadingLabel?: string
}

/** Tombol board: satu komponen dengan varian primary, secondary, tertiary, danger, dan danger-outline. */
export function Button({ variant, size, className = '', type = 'button', loading, loadingLabel, children, disabled, ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <span aria-hidden className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  )
}
