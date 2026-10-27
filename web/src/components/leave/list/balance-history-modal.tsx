import { Button } from '../../atoms/button'
import { Modal } from '../../organisms/modal'
import { errorMessage } from '../../../lib/api'
import { formatDateTime } from '../../../lib/format-date'
import { getBalanceLedger } from '../../../lib/leave-api'
import { useAsync } from '../../../lib/use-async'
import type { LedgerEntryType } from '../../../types/leave'

const ENTRY_LABEL: Record<LedgerEntryType, string> = {
  GRANT: 'Pemberian jatah tahunan',
  USAGE: 'Pemakaian cuti',
  REFUND: 'Pengembalian (pembatalan)',
  EXPIRE: 'Hangus akhir tahun',
  CORRECTION: 'Koreksi HR',
  IMPORT: 'Impor saldo awal',
}

type BalanceHistoryModalProps = {
  employeeId: string
  year: string
  onClose: () => void
}

/** Riwayat saldo cuti tahunan (API-K04-09): pemberian, pemakaian, pengembalian, dan hangus. */
export function BalanceHistoryModal({ employeeId, year, onClose }: BalanceHistoryModalProps) {
  const ledger = useAsync(() => getBalanceLedger(employeeId, year), [employeeId, year])
  const items = ledger.data ?? []

  return (
    <Modal
      title={`Riwayat saldo ${year}`}
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      {ledger.error !== null && <p className="text-sm text-ink-muted">{errorMessage(ledger.error, 'Riwayat belum dapat dimuat.')}</p>}
      {ledger.data && items.length === 0 && <p className="text-sm text-ink-muted">Belum ada perubahan saldo.</p>}
      <ul className="max-h-80 divide-y divide-line-faint overflow-auto">
        {items.map((e) => (
          <li key={e.entryId} className="flex items-center justify-between gap-4 py-3 text-sm">
            <div>
              <p className="font-medium">{ENTRY_LABEL[e.entryType]}</p>
              <p className="text-xs text-ink-muted">{formatDateTime(e.createdAt)}</p>
            </div>
            <span className={`font-bold ${e.changeDays < 0 ? 'text-danger' : 'text-success-ink'}`}>
              {e.changeDays > 0 ? `+${e.changeDays}` : e.changeDays} hari
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
