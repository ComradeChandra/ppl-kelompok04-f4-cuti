// Nilai formulir pengajuan dan konversinya ke payload API.
import type { CreateLeavePayload, LeaveDetail, LeaveType, UpdateDraftPayload } from '../../../types/leave'
import { LEAVE_TYPE_RULES } from './leave-type-rules'

export type FormAttachment = { attachmentId: string; fileName: string; sizeBytes?: number }

export type FormValues = {
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
  attachments: FormAttachment[]
}

export const EMPTY_VALUES: FormValues = { leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '', attachments: [] }

export function valuesFromDetail(d: LeaveDetail): FormValues {
  return { leaveType: d.leaveType, startDate: d.startDate, endDate: d.endDate, reason: d.reason, attachments: d.attachments }
}

// Lampiran hanya dikirim untuk jenis cuti yang memintanya.
export function attachmentIdsOf(values: FormValues) {
  return LEAVE_TYPE_RULES[values.leaveType].attachmentLabel ? values.attachments.map((a) => a.attachmentId) : []
}

export function toCreatePayload(values: FormValues, submit: boolean): CreateLeavePayload {
  const { leaveType, startDate, endDate, reason } = values
  return { leaveType, startDate, endDate, reason, attachmentIds: attachmentIdsOf(values), submit }
}

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i])

// PATCH draf hanya membawa field yang berubah dari draf tersimpan.
export function changedFields(draft: LeaveDetail, values: FormValues): UpdateDraftPayload {
  const patch: UpdateDraftPayload = {}
  if (values.leaveType !== draft.leaveType) patch.leaveType = values.leaveType
  if (values.startDate !== draft.startDate) patch.startDate = values.startDate
  if (values.endDate !== draft.endDate) patch.endDate = values.endDate
  if (values.reason !== draft.reason) patch.reason = values.reason
  const ids = attachmentIdsOf(values)
  if (!sameList(ids, draft.attachments.map((a) => a.attachmentId))) patch.attachmentIds = ids
  return patch
}
