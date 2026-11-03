import { strokeProps, type IconProps } from './icon-props'

export function IconFile({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...strokeProps} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

export function IconUpload({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...strokeProps} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5M12 3v12" />
    </svg>
  )
}

export function IconPlus({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...strokeProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
