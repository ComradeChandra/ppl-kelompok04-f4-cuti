import { strokeProps, type IconProps } from './icon-props'

export function IconCalendar({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...strokeProps} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

export function IconChevronDown({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...strokeProps} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function IconClose({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...strokeProps} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function IconCheck({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...strokeProps} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
