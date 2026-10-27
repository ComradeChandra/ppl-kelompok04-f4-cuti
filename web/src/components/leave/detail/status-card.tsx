import { Card } from '../../organisms/card'
import { Timeline } from '../../organisms/timeline'
import type { LeaveDetail } from '../../../types/leave'
import { rejectionReason, timelineSteps } from './timeline-steps'

/** Kartu "Status dan linimasa", ditambah kotak alasan penolakan bila pengajuan ditolak. */
export function StatusCard({ request }: { request: LeaveDetail }) {
  const reason = rejectionReason(request)
  return (
    <Card title="Status dan linimasa">
      <div className="px-6 pt-4 pb-6">
        <Timeline steps={timelineSteps(request)} />
        <p className="mt-4 text-[11px] text-ink-faint">Waktu ditampilkan dalam WIB.</p>
        {reason && (
          <div className="mt-4 rounded-lg border border-red-200 bg-danger-soft px-4 py-3">
            <p className="text-[13px] font-bold text-danger">Alasan penolakan</p>
            <p className="mt-1 text-sm break-words text-ink-soft">{reason}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
