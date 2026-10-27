// Untaian kelas tombol, dipakai Button dan LinkButton. Varian mengikuti board Figma.

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'danger-outline'
export type ButtonSize = 'md' | 'sm'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors '
  + 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus '
  + 'disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:enabled:bg-navy-pressed',
  secondary: 'border border-line-strong bg-white text-navy hover:enabled:bg-field',
  tertiary: 'text-ink-soft hover:enabled:bg-field',
  danger: 'bg-danger text-white hover:enabled:bg-danger-pressed',
  'danger-outline': 'border border-danger/40 bg-white text-danger hover:enabled:bg-danger-soft',
}

const SIZE: Record<ButtonSize, string> = {
  md: 'h-control px-5 text-sm',
  sm: 'h-8 px-3 text-xs',
}

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', extra = '') {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${extra}`.trim()
}
