import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError, errorCode, errorMessage, isConnectionError } from '../../../lib/api'
import { createLeaveRequest, submitDraft, updateDraft } from '../../../lib/leave-api'
import { useNotice } from '../../../lib/notice'
import type { LeaveStatus } from '../../../types/leave'
import { checkForm, errorsForApiError } from './form-check'
import { changedFields, toCreatePayload } from './form-values'
import type { LeaveForm } from './use-leave-form'

const SENT_MESSAGE: Partial<Record<LeaveStatus, string>> = {
  PENDING_COO: 'Pengajuan cuti terkirim. Menunggu persetujuan COO.',
  PENDING_CEO: 'Pengajuan cuti terkirim. Menunggu persetujuan CEO.',
  APPROVED: 'Pemberitahuan cuti tercatat dan langsung disetujui.',
}

const NETWORK_MESSAGE = 'Pengajuan gagal dikirim. Periksa koneksi lalu coba lagi.'
const draftSavedMessage = (days: number) => `Draf tersimpan (${days} hari kerja). Draf belum dikirim ke COO.`

export type PendingAction = 'save' | 'submit' | null

/** Simpan draf, ubah draf, dan kirim. Penolakan per kolom tampil di bawah kolomnya; sisanya di pita pesan. */
export function useLeaveFormActions(form: LeaveForm) {
  const notify = useNotice()
  const navigate = useNavigate()
  const [pending, setPending] = useState<PendingAction>(null)
  // Kunci yang sama dipakai saat mengirim ulang setelah gagal, agar layanan tidak membuat pengajuan ganda.
  const idempotencyKey = useRef<string | null>(null)

  function validate() {
    const errors = checkForm(form.values)
    if (errors) form.setErrors(errors)
    return !errors
  }

  async function run(kind: Exclude<PendingAction, null>, task: () => Promise<void>, retry: () => void) {
    setPending(kind)
    try {
      await task()
    } catch (err) {
      const fieldErrors = err instanceof ApiError ? errorsForApiError(err) : null
      if (fieldErrors) form.setErrors(fieldErrors)
      else if (isConnectionError(err)) notify('error', NETWORK_MESSAGE, { code: errorCode(err), action: { label: 'Coba lagi', onClick: retry } })
      else notify('error', errorMessage(err), { code: errorCode(err) })
    } finally {
      setPending(null)
    }
  }

  async function create(submit: boolean) {
    idempotencyKey.current ??= crypto.randomUUID()
    const created = await createLeaveRequest(toCreatePayload(form.values, submit), idempotencyKey.current)
    idempotencyKey.current = null
    return created
  }

  function saveDraft() {
    if (!validate()) return
    void run('save', async () => {
      if (!form.draft) {
        const created = await create(false)
        notify('success', draftSavedMessage(created.workingDays))
        navigate(`/cuti/ajukan?draf=${created.leaveRequestId}`, { replace: true })
        return
      }
      const patch = changedFields(form.draft, form.values)
      if (Object.keys(patch).length === 0) {
        form.cancelEdit()
        notify('info', 'Tidak ada perubahan pada draf.')
        return
      }
      const saved = await updateDraft(form.draft.leaveRequestId, patch)
      form.applySaved(saved)
      notify('success', draftSavedMessage(saved.workingDays))
    }, saveDraft)
  }

  // Dipanggil setelah pengguna menyetujui modal konfirmasi Kirim.
  function submit() {
    void run('submit', async () => {
      let result
      if (!form.draft) {
        result = await create(true)
      } else {
        const patch = form.mode === 'edit' ? changedFields(form.draft, form.values) : {}
        if (Object.keys(patch).length > 0) await updateDraft(form.draft.leaveRequestId, patch)
        result = await submitDraft(form.draft.leaveRequestId)
      }
      notify('success', SENT_MESSAGE[result.status] ?? 'Pengajuan cuti terkirim.')
      navigate(`/cuti/${result.leaveRequestId}`)
    }, submit)
  }

  return { pending, busy: pending !== null, validate, saveDraft, submit }
}
