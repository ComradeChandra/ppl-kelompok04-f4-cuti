// Operasi API F-4 yang dipakai antarmuka. ID kontrak (API-K04-xx) mengikuti openapi/openapi.yaml.
import { callApi } from './api'
import type {
  CancelResult,
  CreateLeavePayload,
  DecisionPayload,
  LeaveBalance,
  LeaveCreated,
  LeaveDetail,
  LeaveStatus,
  LedgerEntry,
  LeaveSummary,
  UpdateDraftPayload,
} from '../types/leave'

const enc = encodeURIComponent

export function getServiceToday() {
  return callApi<{ today: string }>('/health').then((res) => res.today)
}

// API-K04-01
export function getLeaveBalance(employeeId: string, year: number | string) {
  return callApi<LeaveBalance>(`/api/v1/leave-balances/${enc(employeeId)}?year=${year}`)
}

// API-K04-09: riwayat perubahan saldo cuti tahunan.
export function getBalanceLedger(employeeId: string, year: number | string) {
  return callApi<{ items: LedgerEntry[] }>(`/api/v1/leave-balances/${enc(employeeId)}/ledger?year=${year}`).then((res) => res.items)
}

type ListQuery = { scope: 'mine' | 'approval'; year: number | string; status?: LeaveStatus | '' }

// API-K04-02
export function listLeaveRequests({ scope, year, status }: ListQuery) {
  const params = new URLSearchParams({ scope, year: String(year) })
  if (status) params.set('status', status)
  return callApi<{ items: LeaveSummary[] }>(`/api/v1/leave-requests?${params}`).then((res) => res.items)
}

export function getLeaveRequest(id: string) {
  return callApi<LeaveDetail>(`/api/v1/leave-requests/${enc(id)}`)
}

// API-K04-03. Idempotency-Key yang sama tidak membuat pengajuan ganda saat dikirim ulang.
export function createLeaveRequest(payload: CreateLeavePayload, idempotencyKey: string) {
  return callApi<LeaveCreated>('/api/v1/leave-requests', {
    method: 'POST',
    body: payload,
    headers: { 'Idempotency-Key': idempotencyKey },
  })
}

// API-K04-11 dan API-K04-12
export function updateDraft(id: string, patch: UpdateDraftPayload) {
  return callApi<LeaveDetail>(`/api/v1/leave-requests/${enc(id)}`, { method: 'PATCH', body: patch })
}

export function submitDraft(id: string) {
  return callApi<LeaveCreated>(`/api/v1/leave-requests/${enc(id)}/submit`, { method: 'POST' })
}

// API-K04-04 dan API-K04-05
export function decideLeaveRequest(id: string, payload: DecisionPayload) {
  return callApi<{ status: LeaveStatus }>(`/api/v1/leave-requests/${enc(id)}/decisions`, { method: 'POST', body: payload })
}

export function cancelLeaveRequest(id: string) {
  return callApi<CancelResult>(`/api/v1/leave-requests/${enc(id)}/cancel`, { method: 'POST' })
}
