// Langkah linimasa status pengajuan (board "diajukan" dan "ditolak"): diajukan, tahap COO, tahap CEO, lalu hasil.
// Keputusan yang mengakhiri pengajuan ditulis "<keputusan> <tahap> · Selesai" dan menjadi langkah terakhir.
import { formatDateTime } from '../../../lib/format-date'
import type { ApprovalStage, LeaveDetail } from '../../../types/leave'
import type { TimelineStep } from '../../../types/ui'

function stageStep(r: LeaveDetail, stage: ApprovalStage): TimelineStep | null {
  const d = r.decisions.find((x) => x.stage === stage)
  const key = stage.toLowerCase()
  if (d) {
    const approved = d.decision === 'APPROVE'
    const final = !approved || stage === 'CEO'
    const title = `${approved ? 'Disetujui' : 'Ditolak'} ${stage}${final ? ' · Selesai' : ''}`
    const note = `${formatDateTime(d.decidedAt)}${final ? ' · keputusan akhir' : ''}`
    return { key, title, note, state: approved ? 'done' : 'failed' }
  }
  if (r.status === `PENDING_${stage}`) return { key, title: `Menunggu ${stage}`, note: 'Belum ada keputusan', state: 'current' }
  // Pengaju COO langsung ke tahap CEO; pengajuan CEO langsung disetujui.
  const skipped = (stage === 'COO' && ['PENDING_CEO', 'APPROVED'].includes(r.status)) || (stage === 'CEO' && r.status === 'APPROVED')
  if (skipped) return { key, title: `Tahap ${stage} dilewati`, note: 'Pengaju adalah COO atau CEO.', state: 'done' }
  if (r.decisions.some((x) => x.decision === 'REJECT')) return null
  return { key, title: `Menunggu ${stage}`, state: 'todo' }
}

function closingStep(r: LeaveDetail): TimelineStep | null {
  switch (r.status) {
    case 'CANCELLED':
      return { key: 'final', title: 'Dibatalkan · Selesai', note: r.cancelledAt ? formatDateTime(r.cancelledAt) : undefined, state: 'failed' }
    case 'EXPIRED':
      return { key: 'final', title: 'Gugur · Selesai', note: 'Belum diputus saat tanggal mulai tiba.', state: 'failed' }
    case 'APPROVED':
      // CEO yang menyetujui sudah ditulis "· Selesai"; langkah penutup hanya untuk pengajuan tanpa keputusan CEO.
      return r.decisions.some((d) => d.stage === 'CEO') ? null : { key: 'final', title: 'Disetujui · Selesai', state: 'done' }
    case 'REJECTED':
      return null
    default:
      return { key: 'final', title: 'Disetujui / Ditolak', state: 'todo' }
  }
}

export function timelineSteps(r: LeaveDetail): TimelineStep[] {
  const created = formatDateTime(r.createdAt)
  const first: TimelineStep =
    r.status === 'DRAFT'
      ? { key: 'created', title: 'Draf', note: `Dibuat ${created} · belum dikirim`, state: 'current' }
      : { key: 'created', title: 'Diajukan', note: `${created} · oleh ${r.employeeName ?? r.employeeId}`, state: 'done' }

  // Cuti haid cukup pemberitahuan (Q-08): tanpa tahap COO dan CEO.
  if (r.leaveType === 'MENSTRUAL' && r.decisions.length === 0 && r.status !== 'DRAFT') {
    const ok = r.status === 'APPROVED'
    const title = ok ? 'Disetujui otomatis · Selesai' : 'Dibatalkan · Selesai'
    return [first, { key: 'final', title, note: 'Cuti haid cukup pemberitahuan ke COO.', state: ok ? 'done' : 'failed' }]
  }
  const stages = [stageStep(r, 'COO'), stageStep(r, 'CEO')].filter((s): s is TimelineStep => s !== null)
  const closing = closingStep(r)
  return closing ? [first, ...stages, closing] : [first, ...stages]
}

export function rejectionReason(r: LeaveDetail) {
  return r.decisions.find((d) => d.decision === 'REJECT')?.reason ?? null
}
