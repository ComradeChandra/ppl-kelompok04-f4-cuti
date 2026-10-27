import { Badge } from '../atoms/badge'
import { Button } from '../atoms/button'
import { FieldError } from '../atoms/field-error'
import { FieldLabel } from '../atoms/field-label'
import { TextAreaField } from '../atoms/text-area-field'
import { Card } from '../organisms/card'
import { formatDateTime, formatRange, yearOf } from '../../lib/format-date'
import { getLeaveBalance } from '../../lib/leave-api'
import { LEAVE_TYPE_LABEL, STATUS_LABEL, STATUS_TONE } from '../../lib/leave-labels'
import { useAsync } from '../../lib/use-async'
import type { LeaveBalance, LeaveDetail } from '../../types/leave'
import { DecisionConfirmModal } from './decision-confirm-modal'
import { useApprovalDecision } from './use-approval-decision'

const Box = ({ children }: { children: string }) => (
  <p className="min-h-control rounded-lg bg-field px-4 py-2.5 text-sm break-words text-ink">{children}</p>
)

function balanceText(b: LeaveBalance | null) {
  if (!b) return '-'
  return b.eligible ? `${b.remainingDays} dari ${b.entitlementDays} hari` : 'Belum berhak cuti tahunan'
}

function previousDecision(r: LeaveDetail) {
  const coo = r.decisions.find((d) => d.stage === 'COO')
  if (!coo) return 'Belum ada keputusan sebelumnya (tahap pertama).'
  return `COO ${coo.decision === 'APPROVE' ? 'menyetujui' : 'menolak'} pada ${formatDateTime(coo.decidedAt)}.`
}

/** Rincian satu pengajuan dalam antrean beserta alasan penolakan dan tombol Tolak/Setujui. */
export function ApprovalPanel({ request: r, onDecided }: { request: LeaveDetail; onDecided: () => void }) {
  const decision = useApprovalDecision(r, onDecided)
  const balance = useAsync(() => getLeaveBalance(r.employeeId, yearOf(r.startDate)), [r.leaveRequestId])
  const rows: [string, string][] = [
    ['Jenis cuti', LEAVE_TYPE_LABEL[r.leaveType]],
    ['Tanggal', formatRange(r.startDate, r.endDate)],
    ['Hari kerja', `${r.workingDays} hari`],
    ['Saldo pemohon', balanceText(balance.data)],
  ]

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{r.employeeName ?? r.employeeId}</h2>
          <p className="text-xs text-ink-muted">ID karyawan {r.employeeId}</p>
        </div>
        <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
      </div>
      <dl className="mb-6 grid gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-muted">{k}</dt>
            <dd className={k === 'Saldo pemohon' ? 'font-bold' : ''}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel>Alasan cuti</FieldLabel>
          <Box>{r.reason}</Box>
        </div>
        <div>
          <FieldLabel>Lampiran</FieldLabel>
          <Box>{r.attachments.length ? r.attachments.map((a) => a.fileName).join(', ') : 'Tidak ada lampiran'}</Box>
        </div>
      </div>
      <div className="mt-5">
        <FieldLabel>Keputusan tahap sebelumnya</FieldLabel>
        <Box>{previousDecision(r)}</Box>
      </div>
      <div className="mt-5">
        <FieldLabel htmlFor="reject-reason">Alasan penolakan (wajib bila menolak)</FieldLabel>
        <TextAreaField
          id="reject-reason"
          value={decision.reason}
          onChange={decision.changeReason}
          maxLength={500}
          placeholder="Tulis alasan penolakan..."
          error={Boolean(decision.reasonError)}
          footer={<FieldError message={decision.reasonError ?? undefined} />}
        />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="danger-outline" onClick={() => decision.ask('REJECT')}>
          Tolak
        </Button>
        <Button variant="primary" onClick={() => decision.ask('APPROVE')}>
          Setujui
        </Button>
      </div>
      {decision.pending && (
        <DecisionConfirmModal
          request={r}
          decision={decision.pending}
          busy={decision.busy}
          onConfirm={decision.confirm}
          onCancel={decision.dismiss}
        />
      )}
    </Card>
  )
}
