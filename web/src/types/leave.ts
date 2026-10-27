// Bentuk data API F-4 (openapi/openapi.yaml versi 1.1.0).

export type LeaveType = 'ANNUAL' | 'SICK' | 'MENSTRUAL' | 'MATERNITY'

export type LeaveStatus =
  | 'DRAFT'
  | 'PENDING_COO'
  | 'PENDING_CEO'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'

export type ApprovalStage = 'COO' | 'CEO'

export type LeaveSummary = {
  leaveRequestId: string
  employeeId: string
  employeeName: string | null
  leaveType: LeaveType
  startDate: string
  endDate: string
  workingDays: number
  status: LeaveStatus
  createdAt: string
}

export type LeaveAttachment = {
  attachmentId: string
  fileName: string
}

export type LeaveDecision = {
  stage: ApprovalStage
  decision: 'APPROVE' | 'REJECT'
  reason: string | null
  decidedAt: string
}

export type LeaveDetail = LeaveSummary & {
  reason: string
  attachments: LeaveAttachment[]
  decisions: LeaveDecision[]
  cancelledAt: string | null
  updatedAt: string
}

export type LeaveCreated = Omit<LeaveSummary, 'employeeName'>

export type LeaveBalance = {
  employeeId: string
  year: number
  eligible: boolean
  eligibleFrom: string | null
  entitlementDays: number
  usedDays: number
  remainingDays: number
  pendingDays: number
  availableDays: number
  expiresOn: string
}

export type LedgerEntryType = 'GRANT' | 'USAGE' | 'REFUND' | 'EXPIRE' | 'CORRECTION' | 'IMPORT'

export type LedgerEntry = {
  entryId: string
  entryType: LedgerEntryType
  changeDays: number
  leaveRequestId: string | null
  reason: string | null
  createdAt: string
}

export type CreateLeavePayload = {
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
  attachmentIds: string[]
  submit: boolean
}

// PATCH draf: hanya field yang berubah yang dikirim (API-K04-11).
export type UpdateDraftPayload = Partial<Omit<CreateLeavePayload, 'submit'>>

export type DecisionPayload = { decision: 'APPROVE' } | { decision: 'REJECT'; reason: string }

export type CancelResult = {
  leaveRequestId: string
  status: LeaveStatus
  cancelledAt: string
}
