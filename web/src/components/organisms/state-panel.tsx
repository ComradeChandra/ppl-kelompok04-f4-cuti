import type { ReactNode } from 'react'

type StatePanelProps = {
  title: string
  description?: string
  tone?: 'neutral' | 'danger'
  action?: ReactNode
  framed?: boolean
}

/** Keadaan halaman (kosong, akses ditolak, sesi berakhir): judul di tengah, keterangan, dan tindakan. */
export function StatePanel({ title, description, tone = 'neutral', action, framed = true }: StatePanelProps) {
  const frame = framed ? 'rounded-card border border-line bg-white shadow-card' : ''
  return (
    <section className={`flex flex-col items-center px-6 py-12 text-center ${frame}`}>
      <p className={`text-base font-bold ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>{title}</p>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </section>
  )
}
