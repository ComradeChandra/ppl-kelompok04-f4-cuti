import { Card } from '../organisms/card'
import { formatDateTime, formatRange } from '../../lib/format-date'
import { LEAVE_TYPE_LABEL } from '../../lib/leave-labels'
import type { LeaveSummary } from '../../types/leave'

type ApprovalQueueProps = {
  items: LeaveSummary[]
  selectedId: string | null
  onSelect: (id: string) => void
}

/** Antrean pengajuan yang menunggu keputusan akun ini, urut tanggal mulai terdekat. */
export function ApprovalQueue({ items, selectedId, onSelect }: ApprovalQueueProps) {
  return (
    <Card title="Antrean pengajuan" className="overflow-hidden">
      <ul className="mt-4 border-t border-line">
        {items.length === 0 && <li className="px-6 py-5 text-sm text-ink-muted">Tidak ada pengajuan yang menunggu keputusan Anda.</li>}
        {items.map((r) => {
          const active = r.leaveRequestId === selectedId
          return (
            <li key={r.leaveRequestId}>
              <button
                type="button"
                aria-current={active || undefined}
                onClick={() => onSelect(r.leaveRequestId)}
                className={`w-full border-b border-l-3 border-b-line-faint px-6 py-3.5 text-left ${
                  active ? 'border-l-navy bg-nav-active' : 'border-l-transparent hover:bg-field'
                }`}
              >
                <p className="font-bold">{r.employeeName ?? r.employeeId}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {LEAVE_TYPE_LABEL[r.leaveType]} · {formatRange(r.startDate, r.endDate)} · {r.workingDays} hari kerja
                </p>
                <p className="mt-0.5 text-[11px] text-ink-faint">Diajukan {formatDateTime(r.createdAt)}</p>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
