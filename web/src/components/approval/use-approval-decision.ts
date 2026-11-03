import { useState } from 'react'
import { errorCode, errorMessage } from '../../lib/api'
import { decideLeaveRequest } from '../../lib/leave-api'
import { useNotice } from '../../lib/notice'
import type { LeaveDetail } from '../../types/leave'

export type Decision = 'APPROVE' | 'REJECT'

const REASON_REQUIRED = 'Alasan penolakan wajib diisi.'

/** Alasan penolakan, modal konfirmasi yang sedang terbuka, dan pengiriman keputusan COO/CEO. */
export function useApprovalDecision(request: LeaveDetail, onDecided: () => void) {
  const notify = useNotice()
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [pending, setPending] = useState<Decision | null>(null)
  const [busy, setBusy] = useState(false)

  function ask(decision: Decision) {
    if (decision === 'REJECT' && !reason.trim()) {
      setReasonError(REASON_REQUIRED)
      return
    }
    setPending(decision)
  }

  async function confirm() {
    if (!pending) return
    setBusy(true)
    try {
      const payload = pending === 'REJECT' ? { decision: pending, reason: reason.trim() } : { decision: pending }
      await decideLeaveRequest(request.leaveRequestId, payload)
      notify('success', pending === 'APPROVE' ? 'Pengajuan disetujui.' : 'Pengajuan ditolak.')
      onDecided()
    } catch (err) {
      const code = errorCode(err)
      if (code === 'REASON_REQUIRED') setReasonError(errorMessage(err))
      // 409: penyetuju lain sudah memutus, pengaju membatalkan, atau pengajuan gugur saat tanggal mulai tiba.
      else if (code === 'INVALID_STATE') notify('warning', errorMessage(err), { code, action: { label: 'Muat ulang', onClick: onDecided } })
      else notify('error', errorMessage(err), { code })
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  function changeReason(value: string) {
    setReason(value)
    setReasonError(null)
  }

  return { reason, changeReason, reasonError, pending, busy, ask, confirm, dismiss: () => setPending(null) }
}
