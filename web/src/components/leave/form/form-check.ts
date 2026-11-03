// Pemeriksaan formulir sebelum dikirim, dan pemetaan penolakan API ke kolomnya (board "sketsa input": tepi merah
// dan pesan di bawah kolom). Aturan yang sama tetap diperiksa ulang layanan; di sini hanya umpan balik cepat.
import type { ApiError } from '../../../lib/api'
import type { FormValues } from './form-values'
import { LEAVE_TYPE_RULES } from './leave-type-rules'

export type FieldKey = 'leaveType' | 'startDate' | 'endDate' | 'reason' | 'attachment' | 'balance'

// Pesan kosong berarti kolom hanya ditandai merah (pesannya sudah tampil di kolom pasangannya).
export type FieldErrors = Partial<Record<FieldKey, string>>

export const REASON_MAX = 500

export function checkForm(values: FormValues): FieldErrors | null {
  const errors: FieldErrors = {}
  if (!values.startDate) errors.startDate = 'Tanggal mulai wajib diisi.'
  if (!values.endDate) errors.endDate = 'Tanggal akhir wajib diisi.'
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = 'Tanggal akhir tidak boleh sebelum tanggal mulai. Perbaiki tanggal akhir.'
  }
  if (!values.reason.trim()) errors.reason = 'Alasan cuti wajib diisi.'
  const rule = LEAVE_TYPE_RULES[values.leaveType]
  if (rule.attachmentLabel && values.attachments.length === 0) errors.attachment = rule.missingAttachment
  return Object.keys(errors).length ? errors : null
}

const CODE_FIELDS: Record<string, FieldKey[]> = {
  DATE_OVERLAP: ['startDate', 'endDate'],
  DEADLINE_H7: ['startDate'],
  NOT_ELIGIBLE: ['leaveType'],
  CROSS_YEAR_NOT_ALLOWED: ['endDate'],
  SICK_BACKDATE_LIMIT: ['startDate'],
  MENSTRUAL_LIMIT: ['startDate', 'endDate'],
  INSUFFICIENT_BALANCE: ['balance'],
  ATTACHMENT_REQUIRED: ['attachment'],
}

// VALIDATION_ERROR memakai satu kode untuk beberapa aturan, jadi kolomnya dibaca dari kalimat pesan.
function fieldsOf(err: ApiError): FieldKey[] {
  if (CODE_FIELDS[err.code]) return CODE_FIELDS[err.code]
  if (err.code !== 'VALIDATION_ERROR') return []
  if (/tanggal akhir/i.test(err.message)) return ['endDate']
  if (/tanggal|hari kerja/i.test(err.message)) return ['startDate', 'endDate']
  if (/alasan/i.test(err.message)) return ['reason']
  if (/attachment|lampiran/i.test(err.message)) return ['attachment']
  return []
}

/** Pesan layanan ditaruh di kolom pertama; kolom lain yang terlibat ikut bertepi merah. Null bila bukan soal kolom. */
export function errorsForApiError(err: ApiError): FieldErrors | null {
  const fields = fieldsOf(err)
  if (fields.length === 0) return null
  return Object.fromEntries(fields.map((f, i) => [f, i === 0 ? err.message : ''])) as FieldErrors
}
