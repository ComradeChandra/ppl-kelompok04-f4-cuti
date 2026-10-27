import { ConfirmModal } from '../organisms/confirm-modal'
import { formatRange } from '../../lib/format-date'
import { LEAVE_TYPE_LABEL } from '../../lib/leave-labels'
import type { LeaveDetail } from '../../types/leave'
import type { Decision } from './use-approval-decision'

type DecisionConfirmModalProps = {
  request: LeaveDetail
  decision: Decision
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Konfirmasi Setujui atau Tolak, dengan ringkasan pengajuan dan langkah berikutnya. */
export function DecisionConfirmModal({ request: r, decision, busy, onConfirm, onCancel }: DecisionConfirmModalProps) {
  const summary = `${r.employeeName ?? r.employeeId} · ${LEAVE_TYPE_LABEL[r.leaveType]} · ${formatRange(r.startDate, r.endDate)} (${r.workingDays} hari kerja).`
  const approve = decision === 'APPROVE'
  const next = approve
    ? r.status === 'PENDING_COO'
      ? 'Pengajuan akan diteruskan ke CEO untuk keputusan akhir.'
      : 'Pengajuan akan disetujui final dan saldo cuti tahunan dipotong.'
    : 'Pengajuan akan ditolak dan pemohon menerima alasan penolakan.'

  return (
    <ConfirmModal
      title={approve ? 'Setujui pengajuan ini?' : 'Tolak pengajuan ini?'}
      description={
        <>
          <p>{summary}</p>
          <p>{next}</p>
        </>
      }
      confirmLabel={approve ? 'Ya, setujui' : 'Ya, tolak'}
      danger={!approve}
      busy={busy}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
