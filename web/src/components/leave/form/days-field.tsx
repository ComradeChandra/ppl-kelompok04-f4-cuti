import { FieldLabel } from '../../atoms/field-label'
import { ReadOnlyField } from '../../atoms/read-only-field'
import { calendarDays, estimateWorkingDays } from '../../../lib/working-days'
import type { LeaveDetail } from '../../../types/leave'
import type { FormValues } from './form-values'
import { LEAVE_TYPE_RULES } from './leave-type-rules'

type DaysFieldProps = {
  values: FormValues
  draft: LeaveDetail | null
}

// Draf tersimpan memakai angka dari layanan; tanggal yang belum disimpan memakai perkiraan Senin–Jumat (±).
function daysText({ values, draft }: DaysFieldProps) {
  const { startDate, endDate, leaveType } = values
  if (!startDate || !endDate || endDate < startDate) return '-'
  if (leaveType === 'MATERNITY') return `${calendarDays(startDate, endDate)} hari kalender`
  if (draft && draft.startDate === startDate && draft.endDate === endDate) return `${draft.workingDays} hari kerja`
  return `± ${estimateWorkingDays(startDate, endDate)} hari kerja`
}

/** Jumlah hari cuti, dihitung sistem dan tidak bisa diubah pengguna. */
export function DaysField(props: DaysFieldProps) {
  return (
    <div>
      <FieldLabel id="days-label">{LEAVE_TYPE_RULES[props.values.leaveType].daysLabel}</FieldLabel>
      <ReadOnlyField hint="Dihitung sistem" labelledBy="days-label">
        {daysText(props)}
      </ReadOnlyField>
      <p className="mt-2 text-[11px] text-ink-muted">Tidak menghitung akhir pekan, libur, dan cuti bersama.</p>
    </div>
  )
}
