import type { ReactNode } from 'react'

type CardProps = {
  title?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}

/** Kartu putih bertepi tipis; judul 15px bold dan slot action di kanan judul. */
export function Card({ title, action, className = '', children }: CardProps) {
  return (
    <section className={`rounded-card border border-line bg-white shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-6 pt-6">
          {title && <h2 className="text-[15px] font-bold tracking-[-0.025em] text-ink-strong">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
