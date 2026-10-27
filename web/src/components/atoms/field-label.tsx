import type { ReactNode } from 'react'

type FieldLabelProps = {
  htmlFor?: string
  id?: string
  required?: boolean
  children: ReactNode
}

/** Label isian 13px medium; tanda bintang merah untuk isian wajib. */
export function FieldLabel({ htmlFor, id, required, children }: FieldLabelProps) {
  const Tag = htmlFor ? 'label' : 'span'
  return (
    <Tag htmlFor={htmlFor} id={id} className="mb-2 block pl-2 text-[13px] font-medium text-ink-soft">
      {children}
      {required && <span className="ml-0.5 text-required">*</span>}
    </Tag>
  )
}
