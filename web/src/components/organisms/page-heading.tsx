import type { ReactNode } from 'react'
import { Link } from 'react-router'

export type Crumb = { label: string; to?: string }

type PageHeadingProps = {
  title: string
  crumbs?: Crumb[]
  subtitle?: string
  action?: ReactNode
}

/** Judul halaman 28px dengan breadcrumb atau subjudul; slot action di kanan. */
export function PageHeading({ title, crumbs, subtitle, action }: PageHeadingProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-[28px] leading-[1.5] font-bold tracking-[-0.025em] text-navy-pressed">{title}</h1>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mt-1 flex flex-wrap gap-1 text-[13px] text-ink-muted">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex gap-1">
                {i > 0 && <span className="text-ink-faint">›</span>}
                {c.to ? (
                  <Link to={c.to} className="hover:text-ink hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  c.label
                )}
              </span>
            ))}
          </nav>
        )}
        {subtitle && <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
