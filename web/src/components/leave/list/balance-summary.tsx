import { useState } from 'react'
import { Badge } from '../../atoms/badge'
import { Card } from '../../organisms/card'
import { formatDate } from '../../../lib/format-date'
import type { LeaveBalance } from '../../../types/leave'
import { BalanceHistoryModal } from './balance-history-modal'

type BalanceSummaryProps = {
  balance: LeaveBalance | null
  failure: string | null
  year: string
}

const Dot = ({ className }: { className: string }) => <span aria-hidden className={`mr-1.5 inline-block size-2 rounded-full ${className}`} />

function Stat({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] text-ink-faint">{label}</p>
      <p className={`font-bold ${tone}`}>{value}</p>
    </div>
  )
}

// Board "daftar saldo karyawan baru": belum 12 bulan masa kerja, jenis cuti lain tetap bisa diajukan.
function NotEligible({ balance: b, year }: { balance: LeaveBalance; year: string }) {
  return (
    <Card title={`Saldo cuti tahunan ${year}`} className="mb-6">
      <div className="px-6 pt-3 pb-6">
        <p className="flex flex-wrap items-center gap-3 text-sm">
          <Badge>Belum berhak</Badge>
          {b.eligibleFrom ? (
            <span>
              Anda berhak cuti tahunan mulai <strong>{formatDate(b.eligibleFrom)}</strong> (12 bulan masa kerja).
            </span>
          ) : (
            <span>Tanggal masuk kerja belum tercatat.</span>
          )}
        </p>
        <p className="mt-3 text-[11px] text-ink-faint">Cuti sakit, haid, dan hamil/melahirkan tetap dapat diajukan.</p>
      </div>
    </Card>
  )
}

/** Ringkasan saldo cuti tahunan: dapat diajukan, menunggu persetujuan, jatah, terpakai, dan tanggal hangus. */
export function BalanceSummary({ balance: b, failure, year }: BalanceSummaryProps) {
  const [history, setHistory] = useState(false)
  if (failure || !b) {
    return (
      <Card className="mb-6 p-6">
        <p className="text-sm text-ink-muted">{failure ?? 'Memuat saldo...'}</p>
      </Card>
    )
  }
  if (!b.eligible) return <NotEligible balance={b} year={year} />
  const pct = (n: number) => `${b.entitlementDays ? (n / b.entitlementDays) * 100 : 0}%`
  return (
    <Card className="mb-6 p-6">
      <div className="mb-5 flex flex-wrap items-center gap-5 text-base">
        <span>
          <Dot className="bg-navy" />
          Dapat diajukan: {b.availableDays} hari
        </span>
        <span>
          <Dot className="bg-amber-500" />
          Menunggu persetujuan: {b.pendingDays} hari
        </span>
        <button type="button" onClick={() => setHistory(true)} className="ml-auto text-xs text-ink underline underline-offset-2 hover:text-navy">
          Lihat riwayat saldo
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <p className="text-[28px] leading-none font-bold">
          {b.remainingDays}
          <span className="ml-1.5 text-xs font-normal">hari tersisa</span>
        </p>
        <Stat label="Dapat diajukan" value={`${b.availableDays} hari`} tone="text-success-ink" />
        <Stat label="Menunggu persetujuan" value={`${b.pendingDays} hari`} tone="text-amber-700" />
        <Stat label="Jatah" value={`${b.entitlementDays} hari`} />
        <Stat label="Terpakai" value={`${b.usedDays} hari`} />
        <Stat label="Hangus pada" value={formatDate(b.expiresOn)} />
      </div>
      <div className="mt-6 mb-2 flex h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
        <span className="bg-navy" style={{ width: pct(b.availableDays) }} />
        <span className="bg-amber-500" style={{ width: pct(b.pendingDays) }} />
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-[11px] text-ink-muted">
        <span>
          <Dot className="bg-navy" />
          Dapat diajukan: {b.availableDays} hari <Dot className="ml-3 bg-amber-500" />
          Menunggu persetujuan: {b.pendingDays} hari
        </span>
        <span>
          <Dot className="bg-line-strong" />
          Terpakai {b.usedDays} hari (dari {b.entitlementDays} hari)
        </span>
      </div>
      {history && <BalanceHistoryModal employeeId={b.employeeId} year={year} onClose={() => setHistory(false)} />}
    </Card>
  )
}
