// Label dan warna status cuti, dipakai menu Cuti dan Persetujuan cuti.
import type { LeaveStatus, LeaveType } from '../types/leave'
import type { BadgeTone } from '../types/ui'

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  ANNUAL: 'Tahunan',
  SICK: 'Sakit',
  MENSTRUAL: 'Haid',
  MATERNITY: 'Hamil/melahirkan',
}

export const LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SICK', 'MENSTRUAL', 'MATERNITY']

export const STATUS_LABEL: Record<LeaveStatus, string> = {
  DRAFT: 'Draf',
  PENDING_COO: 'Menunggu COO',
  PENDING_CEO: 'Menunggu CEO',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Gugur',
}

export const LEAVE_STATUSES = Object.keys(STATUS_LABEL) as LeaveStatus[]

export const STATUS_TONE: Record<LeaveStatus, BadgeTone> = {
  DRAFT: 'neutral',
  PENDING_COO: 'warning',
  PENDING_CEO: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral',
}
