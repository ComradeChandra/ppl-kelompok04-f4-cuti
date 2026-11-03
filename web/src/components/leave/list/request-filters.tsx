import { SingleSelect } from '../../molecules/single-select'
import { LEAVE_STATUSES, STATUS_LABEL } from '../../../lib/leave-labels'

const STATUS_OPTIONS = [{ value: '', label: 'Semua status' }, ...LEAVE_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))]

type RequestFiltersProps = {
  years: number[]
  year: string
  status: string
  onYear: (year: string) => void
  onStatus: (status: string) => void
}

/** Penyaring tahun dan status untuk tabel Pengajuan saya; setiap perubahan memanggil ulang server. */
export function RequestFilters({ years, year, status, onYear, onStatus }: RequestFiltersProps) {
  const yearOptions = years.map((y) => ({ value: String(y), label: `Tahun ${y}` }))
  return (
    <div className="flex gap-2">
      <SingleSelect ariaLabel="Tahun" options={yearOptions} value={year} onChange={onYear} />
      <SingleSelect ariaLabel="Status" options={STATUS_OPTIONS} value={status} onChange={onStatus} />
    </div>
  )
}
