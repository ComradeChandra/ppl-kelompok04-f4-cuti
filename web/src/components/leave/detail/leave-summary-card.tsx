import { Card } from '../../organisms/card'
import { formatRange } from '../../../lib/format-date'
import { LEAVE_TYPE_LABEL } from '../../../lib/leave-labels'
import type { LeaveDetail } from '../../../types/leave'

/** Kartu "Ringkasan pengajuan" di halaman detail. */
export function LeaveSummaryCard({ request: r }: { request: LeaveDetail }) {
  const rows: [string, string][] = [
    ['Pemohon', `${r.employeeName ?? '-'} · ${r.employeeId}`],
    ['Jenis cuti', LEAVE_TYPE_LABEL[r.leaveType]],
    ['Tanggal', formatRange(r.startDate, r.endDate)],
    ['Hari kerja', `${r.workingDays} hari`],
    ['Alasan', r.reason],
    ['Lampiran', r.attachments.length ? r.attachments.map((a) => a.fileName).join(', ') : 'Tidak ada'],
  ]
  return (
    <Card title="Ringkasan pengajuan">
      <dl className="px-6 pt-2 pb-4">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[110px_1fr] gap-3 border-b border-line-faint py-3 last:border-0">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
