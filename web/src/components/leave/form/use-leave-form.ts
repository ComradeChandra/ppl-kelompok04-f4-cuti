import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { errorCode, errorMessage } from '../../../lib/api'
import { getLeaveRequest } from '../../../lib/leave-api'
import { STATUS_LABEL } from '../../../lib/leave-labels'
import { useNotice } from '../../../lib/notice'
import type { LeaveDetail } from '../../../types/leave'
import type { FieldErrors, FieldKey } from './form-check'
import { EMPTY_VALUES, valuesFromDetail, type FormValues } from './form-values'

// new: pengajuan baru; view: draf tersimpan dan terkunci; edit: draf sedang diubah; loading: draf sedang dimuat.
export type FormMode = 'loading' | 'new' | 'view' | 'edit'

const FIELD_OF: Record<keyof FormValues, FieldKey[]> = {
  leaveType: ['leaveType', 'attachment', 'balance'],
  startDate: ['startDate', 'balance'],
  endDate: ['endDate', 'balance'],
  reason: ['reason'],
  attachments: ['attachment'],
}

/** Keadaan formulir pengajuan. Halaman memasang ulang hook ini (lewat key) setiap ?draf= berganti. */
export function useLeaveForm(draftId: string | null) {
  const notify = useNotice()
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [draft, setDraft] = useState<LeaveDetail | null>(null)
  const [mode, setMode] = useState<FormMode>(draftId ? 'loading' : 'new')
  const [errors, setErrors] = useState<FieldErrors>({})
  // Naik setiap draf disimpan, agar daftar "Draf saya" dimuat ulang.
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!draftId) return
    let alive = true
    getLeaveRequest(draftId).then(
      (d) => {
        if (!alive) return
        if (d.status !== 'DRAFT') {
          notify('info', `Pengajuan ini berstatus ${STATUS_LABEL[d.status]} dan tidak dapat diubah.`)
          navigate(`/cuti/${d.leaveRequestId}`, { replace: true })
          return
        }
        setDraft(d)
        setValues(valuesFromDetail(d))
        setMode('view')
      },
      (err: unknown) => {
        if (!alive) return
        notify('error', errorMessage(err), { code: errorCode(err) })
        navigate('/cuti/ajukan', { replace: true })
      },
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId])

  // Tanda merah dan pesannya hilang begitu pengguna mengubah kolom itu lagi.
  const update = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((current) => {
      const next = { ...current }
      for (const f of FIELD_OF[key]) delete next[f]
      return next
    })
  }, [])

  const startEdit = useCallback(() => setMode('edit'), [])

  const cancelEdit = useCallback(() => {
    if (!draft) return
    setValues(valuesFromDetail(draft))
    setErrors({})
    setMode('view')
  }, [draft])

  const applySaved = useCallback((saved: LeaveDetail) => {
    setDraft(saved)
    setValues(valuesFromDetail(saved))
    setErrors({})
    setMode('view')
    setVersion((n) => n + 1)
  }, [])

  return { values, update, draft, mode, errors, setErrors, startEdit, cancelEdit, applySaved, version }
}

export type LeaveForm = ReturnType<typeof useLeaveForm>
