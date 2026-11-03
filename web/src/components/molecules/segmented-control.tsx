import { useRef, type KeyboardEvent } from 'react'
import type { SelectOption } from '../../types/ui'

type SegmentedControlProps = {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  labelledBy?: string
  disabled?: boolean
  error?: boolean
}

/** Pilihan tunggal berupa tab bersambung; panah kiri/kanan memindah pilihan seperti radio group. */
export function SegmentedControl({ options, value, onChange, labelledBy, disabled, error }: SegmentedControlProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: KeyboardEvent, index: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={`grid grid-cols-2 overflow-hidden rounded-lg border bg-white sm:grid-cols-4 ${error ? 'border-danger' : 'border-line-strong'}`}
    >
      {options.map((option, i) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`border-line-strong px-3 py-2.5 text-[13px] font-medium not-first:border-l max-sm:nth-3:border-l-0 max-sm:nth-[n+3]:border-t ${
              active ? 'bg-navy text-white' : 'text-ink-soft hover:enabled:bg-field disabled:text-ink-faint'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
