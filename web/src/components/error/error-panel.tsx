import { LinkButton } from '../atoms/link-button'

type ErrorPanelProps = {
  code?: string
  title: string
  description: string
}

/** Kartu keadaan halaman (belum tersedia, akses ditolak, tidak ditemukan) dengan jalan kembali ke menu Cuti. */
export function ErrorPanel({ code, title, description }: ErrorPanelProps) {
  return (
    <section className="mx-auto mt-10 max-w-md rounded-card border border-line bg-white p-8 text-center shadow-card">
      {code && <p className="text-4xl font-bold text-navy">{code}</p>}
      <h1 className="mt-2 text-xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-dim">{description}</p>
      <LinkButton to="/cuti" variant="primary" className="mt-6">
        Kembali ke Cuti
      </LinkButton>
    </section>
  )
}
