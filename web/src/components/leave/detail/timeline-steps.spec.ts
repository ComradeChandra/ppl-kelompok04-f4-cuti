import { describe, expect, it } from 'vitest'
import type { LeaveDetail } from '../../../types/leave'
import { rejectionReason, timelineSteps } from './timeline-steps'

const base: LeaveDetail = {
  leaveRequestId: '01a17b15-fce8-7d0c-9f60-d7243f237fd2',
  employeeId: 'EMP-001',
  employeeName: 'Nadia Prameswari',
  leaveType: 'ANNUAL',
  startDate: '2026-11-23',
  endDate: '2026-11-24',
  workingDays: 2,
  status: 'PENDING_COO',
  createdAt: '2026-10-27T02:00:00Z',
  reason: 'Acara keluarga',
  attachments: [],
  decisions: [],
  cancelledAt: null,
  updatedAt: '2026-10-27T02:00:00Z',
}

const titles = (r: LeaveDetail) => timelineSteps(r).map((s) => `${s.title}:${s.state}`)

describe('timelineSteps', () => {
  it('menunggu COO pada pengajuan baru (board "diajukan")', () => {
    expect(titles(base)).toEqual(['Diajukan:done', 'Menunggu COO:current', 'Menunggu CEO:todo', 'Disetujui / Ditolak:todo'])
    expect(timelineSteps(base)[0].note).toBe('27 Okt 2026 09.00 WIB · oleh Nadia Prameswari')
  })

  it('menutup dengan keputusan CEO sebagai keputusan akhir', () => {
    const r: LeaveDetail = {
      ...base,
      status: 'APPROVED',
      decisions: [
        { stage: 'COO', decision: 'APPROVE', reason: null, decidedAt: '2026-10-27T02:00:01Z' },
        { stage: 'CEO', decision: 'APPROVE', reason: null, decidedAt: '2026-10-27T02:00:02Z' },
      ],
    }
    expect(titles(r)).toEqual(['Diajukan:done', 'Disetujui COO:done', 'Disetujui CEO · Selesai:done'])
    expect(timelineSteps(r)[2].note).toBe('27 Okt 2026 09.00 WIB · keputusan akhir')
  })

  it('berhenti di tahap yang menolak (board "ditolak")', () => {
    const r: LeaveDetail = {
      ...base,
      status: 'REJECTED',
      decisions: [
        { stage: 'COO', decision: 'APPROVE', reason: null, decidedAt: '2026-10-27T02:00:01Z' },
        { stage: 'CEO', decision: 'REJECT', reason: 'Penutupan proyek', decidedAt: '2026-10-27T02:00:02Z' },
      ],
    }
    expect(titles(r)).toEqual(['Diajukan:done', 'Disetujui COO:done', 'Ditolak CEO · Selesai:failed'])
    expect(rejectionReason(r)).toBe('Penutupan proyek')
  })

  it('cuti haid langsung disetujui tanpa tahap COO dan CEO', () => {
    expect(titles({ ...base, leaveType: 'MENSTRUAL', status: 'APPROVED' })).toEqual(['Diajukan:done', 'Disetujui otomatis · Selesai:done'])
  })
})
