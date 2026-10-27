import { useState } from 'react'
import { Button } from '../../atoms/button'
import { LinkButton } from '../../atoms/link-button'
import { ConfirmModal } from '../../organisms/confirm-modal'
import { errorCode, errorMessage } from '../../../lib/api'
import { formatRange } from '../../../lib/format-date'
import { cancelLeaveRequest } from '../../../lib/leave-api'
import { useNotice } from '../../../lib/notice'
import { useSession } from '../../../lib/session'
import type { LeaveDetail } from '../../../types/leave'

const CANCELLABLE = ['DRAFT', 'PENDING_COO', 'PENDING_CEO', 'APPROVED']

type DetailActionsProps = {
  request: LeaveDetail
  onChanged: () => void
}

/** Kembali, buka draf, dan Batalkan pengajuan (hanya pemilik, sebelum tanggal mulai). */
export function DetailActions({ request: r, onChanged }: DetailActionsProps) {
  const { account, today } = useSession()
  const notify = useNotice()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const mine = r.employeeId === account.employeeId
  const cancellable = mine && CANCELLABLE.includes(r.status) && r.startDate > today
  const refund = r.status === 'APPROVED' && r.leaveType === 'ANNUAL'

  async function cancel() {
    setBusy(true)
    try {
      await cancelLeaveRequest(r.leaveRequestId)
      notify('success', refund ? 'Pengajuan dibatalkan, saldo dikembalikan.' : 'Pengajuan dibatalkan.')
      onChanged()
    } catch (err) {
      // 409: pengajuan sudah diputus atau gugur sejak halaman dibuka.
      if (errorCode(err) === 'INVALID_STATE') {
        notify('warning', 'Pengajuan ini sudah diproses. Muat ulang halaman.', { code: 'INVALID_STATE', action: { label: 'Muat ulang', onClick: onChanged } })
      } else {
        notify('error', errorMessage(err), { code: errorCode(err) })
      }
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <div className="mt-6 flex flex-wrap justify-between gap-3">
      <LinkButton to="/cuti">‹ Kembali</LinkButton>
      <div className="flex gap-3">
        {mine && r.status === 'DRAFT' && (
          <LinkButton to={`/cuti/ajukan?draf=${r.leaveRequestId}`} variant="primary">
            Buka draf
          </LinkButton>
        )}
        {cancellable && (
          <Button variant="danger-outline" onClick={() => setConfirming(true)}>
            Batalkan pengajuan
          </Button>
        )}
      </div>
      {confirming && (
        <ConfirmModal
          title="Batalkan pengajuan cuti?"
          description={`Pengajuan ${formatRange(r.startDate, r.endDate)} akan dibatalkan dan tidak dapat diaktifkan kembali.${
            refund ? ' Saldo yang sudah dipotong akan dikembalikan.' : ''
          }`}
          cancelLabel="Tidak"
          confirmLabel="Ya, batalkan"
          danger
          busy={busy}
          onConfirm={cancel}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
