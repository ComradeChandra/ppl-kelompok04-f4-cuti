import type { Notice, NoticeKind } from '../../types/ui'
import { IconCheck, IconClose } from '../atoms/icons'

const LOOK: Record<NoticeKind, { box: string; action: string }> = {
  success: { box: 'border-success-line bg-success-soft text-success-ink', action: 'border-success-ink/40' },
  error: { box: 'border-red-200 bg-danger-soft text-danger', action: 'border-danger/50' },
  warning: { box: 'border-warning-line bg-warning-soft text-warning-ink', action: 'border-warning-ink/50' },
  info: { box: 'border-line-strong bg-line-faint text-ink-soft', action: 'border-line-strong' },
}

type AlertBannerProps = {
  notice: Notice
  onClose?: () => void
}

/** Pita pesan di atas isi halaman, dengan tombol tindakan opsional (Coba lagi, Muat ulang). */
export function AlertBanner({ notice, onClose }: AlertBannerProps) {
  const look = LOOK[notice.kind]
  return (
    <div
      role={notice.kind === 'error' || notice.kind === 'warning' ? 'alert' : 'status'}
      data-error-code={notice.code}
      className={`mb-5 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${look.box}`}
    >
      {notice.kind === 'success' && <IconCheck className="shrink-0" />}
      <p className="flex-1">{notice.text}</p>
      {notice.action && (
        <button
          type="button"
          onClick={notice.action.onClick}
          className={`h-8 rounded-md border bg-white px-3 text-[13px] font-medium whitespace-nowrap ${look.action}`}
        >
          {notice.action.label}
        </button>
      )}
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Tutup pesan" className="grid size-7 place-items-center rounded-md opacity-70 hover:opacity-100">
          <IconClose size={14} />
        </button>
      )}
    </div>
  )
}
