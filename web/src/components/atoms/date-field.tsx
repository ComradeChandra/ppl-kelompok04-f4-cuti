import type { InputHTMLAttributes } from 'react'
import { inputClass } from '../../lib/input-style'
import { IconCalendar } from './icons'

type DateFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  value: string
  onChange: (value: string) => void
  error?: boolean
}

/** Isian tanggal YYYY-MM-DD; seluruh kotak membuka pemilih tanggal, ikon bawaan diganti ikon sendiri. */
export function DateField({ value, onChange, error, className = '', ...props }: DateFieldProps) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error || undefined}
        className={`${inputClass(error)} pr-10 ${className}`}
        {...props}
      />
      <IconCalendar className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-muted" />
    </div>
  )
}
