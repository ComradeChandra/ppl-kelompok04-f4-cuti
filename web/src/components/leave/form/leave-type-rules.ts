// Ketentuan per jenis cuti di panel kanan formulir. Isi mengikuti keputusan mitra Q-01 sampai Q-09.
import type { LeaveType } from '../../../types/leave'

type LeaveTypeRule = {
  variant: string
  daysLabel: string
  attachmentLabel: string | null
  missingAttachment: string
  rules: string[]
  note?: string
}

const MEDICAL_NOTE = 'Lampiran medis hanya dapat diakses oleh Anda, COO, CEO, dan HR.'

export const LEAVE_TYPE_RULES: Record<LeaveType, LeaveTypeRule> = {
  ANNUAL: {
    variant: '',
    daysLabel: 'Jumlah hari kerja',
    attachmentLabel: null,
    missingAttachment: '',
    rules: [
      'Berhak setelah 12 bulan masa kerja.',
      'Diajukan paling lambat 7 hari kerja sebelum tanggal mulai.',
      'Jatah 12 hari per tahun, hangus pada 31 Desember.',
      'Diputus bertahap: COO, lalu CEO. Saldo dipotong setelah disetujui CEO.',
    ],
  },
  SICK: {
    variant: 'cuti sakit',
    daysLabel: 'Jumlah hari kerja',
    attachmentLabel: 'Lampiran surat keterangan dokter',
    missingAttachment: 'Surat dokter wajib dilampirkan.',
    rules: [
      'Tidak memotong jatah saldo cuti tahunan.',
      'Wajib melampirkan surat keterangan dokter.',
      'Boleh diajukan susulan paling lambat 3 hari kerja setelah kembali bekerja.',
      'Diputus bertahap: COO, lalu CEO.',
    ],
    note: MEDICAL_NOTE,
  },
  MENSTRUAL: {
    variant: 'cuti haid',
    daysLabel: 'Jumlah hari kerja',
    attachmentLabel: null,
    missingAttachment: '',
    rules: [
      'Maksimal 2 hari kerja per bulan.',
      'Cukup pemberitahuan: langsung disetujui setelah dikirim.',
      'Tanpa lampiran.',
      'Tidak memotong jatah saldo cuti tahunan.',
    ],
  },
  MATERNITY: {
    variant: 'cuti melahirkan',
    daysLabel: 'Jumlah hari kerja / kalender',
    attachmentLabel: 'Lampiran surat keterangan dokter kandungan / bidan (HPL)',
    missingAttachment: 'Surat keterangan dokter/bidan wajib dilampirkan.',
    rules: [
      'Durasi cuti 3 bulan (1,5 bulan sebelum persalinan dan 1,5 bulan setelah persalinan) sesuai UU Ketenagakerjaan.',
      'Tidak memotong jatah saldo cuti tahunan.',
      'Wajib melampirkan surat keterangan HPL dari dokter spesialis kandungan atau bidan.',
      'Diputus bertahap: COO, lalu CEO.',
    ],
    note: MEDICAL_NOTE,
  },
}
