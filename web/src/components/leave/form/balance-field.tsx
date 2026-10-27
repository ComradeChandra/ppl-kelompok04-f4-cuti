import { FieldLabel } from '../../atoms/field-label'
import { ReadOnlyField } from '../../atoms/read-only-field'
import { ApiError } from '../../../lib/api'
import { formatDate, yearOf } from '../../../lib/format-date'
import { LEAVE_TYPE_LABEL } from '../../../lib/leave-labels'
import { getLeaveBalance } from '../../../lib/leave-api'
import { useSession } from '../../../lib/session'
import { useAsync } from '../../../lib/use-async'
import type { LeaveType } from '../../../types/leave'

type BalanceFieldProps = {
  leaveType: LeaveType
  startDate: string
  error?: boolean
}

/** Saldo cuti tahunan yang masih dapat diajukan pada tahun tanggal mulai. Jenis lain tidak memotong saldo. */
export function BalanceField({ leaveType, startDate, error }: BalanceFieldProps) {
  const { account, today } = useSession()
  const year = yearOf(startDate || today)
  const balance = useAsync(() => getLeaveBalance(account.employeeId, year), [account.employeeId, year])

  let text = '-'
  const b = balance.data
  if (leaveType !== 'ANNUAL') text = `Tidak dipotong untuk cuti ${LEAVE_TYPE_LABEL[leaveType].toLowerCase()}`
  else if (balance.error instanceof ApiError && balance.error.code === 'EMPLOYEE_NOT_FOUND') text = 'Karyawan tidak ditemukan'
  else if (b && !b.eligible) text = b.eligibleFrom ? `Belum berhak (mulai ${formatDate(b.eligibleFrom)})` : 'Belum berhak'
  else if (b) text = `${b.availableDays} hari`

  return (
    <div>
      <FieldLabel id="balance-label">Saldo dapat diajukan</FieldLabel>
      <ReadOnlyField error={error} labelledBy="balance-label">
        {text}
      </ReadOnlyField>
    </div>
  )
}
