import { Badge } from '../../atoms/badge'
import { IconPlus } from '../../atoms/icons'
import { LinkButton } from '../../atoms/link-button'
import { StatePanel } from '../../organisms/state-panel'
import { formatRange } from '../../../lib/format-date'
import { LEAVE_TYPE_LABEL, STATUS_LABEL, STATUS_TONE } from '../../../lib/leave-labels'
import type { LeaveSummary } from '../../../types/leave'

type LeaveRequestTableProps = {
  items: LeaveSummary[] | null
  failure: string | null
  filtered: boolean
}

const HEAD = ['Tanggal mulai – akhir', 'Jenis', 'Hari kerja', 'Status', '']
const CELL = 'border-t border-line px-6 py-3.5'

/** Tabel "Pengajuan saya". Draf dibuka di formulir, pengajuan lain di halaman detail. */
export function LeaveRequestTable({ items, failure, filtered }: LeaveRequestTableProps) {
  if (failure) return <StatePanel framed={false} title={failure} />
  if (items === null) return <p className="border-t border-line px-6 py-8 text-center text-sm text-ink-muted">Memuat...</p>
  if (items.length === 0) {
    // Board "daftar saldo karyawan baru": keadaan kosong mengajak membuat pengajuan pertama.
    return filtered ? (
      <StatePanel framed={false} title="Tidak ada pengajuan dengan status ini." description="Ganti penyaring tahun atau status." />
    ) : (
      <StatePanel
        framed={false}
        title="Belum ada pengajuan cuti."
        description="Pengajuan yang Anda kirim akan tampil di sini beserta statusnya."
        action={
          <LinkButton to="/cuti/ajukan">
            <IconPlus size={14} /> Ajukan cuti
          </LinkButton>
        }
      />
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            {HEAD.map((h) => (
              <th key={h} scope="col" className="border-t border-line px-6 py-3 text-left text-xs font-semibold text-ink-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => {
            const draft = r.status === 'DRAFT'
            return (
              <tr key={r.leaveRequestId}>
                <td className={CELL}>{formatRange(r.startDate, r.endDate)}</td>
                <td className={CELL}>{LEAVE_TYPE_LABEL[r.leaveType]}</td>
                <td className={CELL}>{r.workingDays}</td>
                <td className={CELL}>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </td>
                <td className={`${CELL} text-right`}>
                  <LinkButton size="sm" to={draft ? `/cuti/ajukan?draf=${r.leaveRequestId}` : `/cuti/${r.leaveRequestId}`}>
                    {draft ? 'Buka draf' : 'Detail'}
                  </LinkButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
