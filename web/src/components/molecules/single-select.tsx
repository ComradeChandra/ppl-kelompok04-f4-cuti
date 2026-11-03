import { useCallback, useId, useState, type MouseEvent } from 'react'
import type { SelectOption } from '../../types/ui'
import { IconCheck, IconChevronDown } from '../atoms/icons'
import { Popover, type Anchor } from './popover'

type SingleSelectProps = {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  size?: 'md' | 'sm'
}

const TRIGGER = {
  md: 'h-control px-3.5 text-sm',
  sm: 'h-8 px-2.5 text-xs',
}

/** Pemilih satu nilai pengganti select bawaan; daftar pilihannya digambar sendiri lewat Popover. */
export function SingleSelect({ options, value, onChange, ariaLabel, size = 'md' }: SingleSelectProps) {
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const listId = useId()
  const close = useCallback(() => setAnchor(null), [])
  const current = options.find((o) => o.value === value)

  function toggle(e: MouseEvent<HTMLButtonElement>) {
    if (anchor) return close()
    const box = e.currentTarget.getBoundingClientRect()
    setAnchor({ left: box.left, top: box.bottom + 4, width: box.width })
  }

  function pick(next: string) {
    onChange(next)
    close()
  }

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={Boolean(anchor)}
        aria-controls={anchor ? listId : undefined}
        onClick={toggle}
        className={`inline-flex items-center justify-between gap-2 rounded-lg border border-line-strong bg-white text-ink hover:bg-field ${TRIGGER[size]}`}
      >
        <span className="truncate">{current?.label ?? '-'}</span>
        <IconChevronDown className="shrink-0 text-ink-muted" />
      </button>
      {anchor && (
        <Popover anchor={anchor} onClose={close}>
          <ul id={listId} role="listbox" aria-label={ariaLabel}>
            {options.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-sm hover:bg-field"
                >
                  {o.label}
                  {o.value === value && <IconCheck className="text-navy" />}
                </button>
              </li>
            ))}
          </ul>
        </Popover>
      )}
    </>
  )
}
