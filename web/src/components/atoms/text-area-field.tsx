import type { ReactNode, TextareaHTMLAttributes } from 'react'
import { inputClass } from '../../lib/input-style'

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  value: string
  onChange: (value: string) => void
  maxLength: number
  error?: boolean
  // Isi kiri baris bawah (misalnya pesan galat); penghitung karakter selalu di kanan.
  footer?: ReactNode
}

/** Isian teks panjang bertinggi tetap (tanpa grip ubah ukuran) dengan penghitung karakter. */
export function TextAreaField({ value, onChange, maxLength, error, footer, ...props }: TextAreaFieldProps) {
  return (
    <div>
      <textarea
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error || undefined}
        className={inputClass(error, true)}
        {...props}
      />
      <div className="flex justify-between gap-3">
        <div>{footer}</div>
        <p className="mt-1 shrink-0 text-[11px] text-ink-faint">
          {value.length} / {maxLength} karakter
        </p>
      </div>
    </div>
  )
}
