import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../lib/api'
import { checkForm, errorsForApiError } from './form-check'
import { EMPTY_VALUES, type FormValues } from './form-values'

const valid: FormValues = { ...EMPTY_VALUES, startDate: '2026-11-09', endDate: '2026-11-11', reason: 'Acara keluarga' }

describe('checkForm', () => {
  it('meloloskan isian lengkap', () => {
    expect(checkForm(valid)).toBeNull()
  })

  it('menaruh pesan VAL-02 di kolom tanggal akhir', () => {
    expect(checkForm({ ...valid, endDate: '2026-11-06' })).toEqual({
      endDate: 'Tanggal akhir tidak boleh sebelum tanggal mulai. Perbaiki tanggal akhir.',
    })
  })

  it('meminta lampiran untuk cuti melahirkan', () => {
    expect(checkForm({ ...valid, leaveType: 'MATERNITY' })).toEqual({
      attachment: 'Surat keterangan dokter/bidan wajib dilampirkan.',
    })
  })

  it('memberi pesan untuk setiap kolom kosong', () => {
    expect(checkForm(EMPTY_VALUES)).toEqual({
      startDate: 'Tanggal mulai wajib diisi.',
      endDate: 'Tanggal akhir wajib diisi.',
      reason: 'Alasan cuti wajib diisi.',
    })
  })
})

describe('errorsForApiError', () => {
  it('menaruh pesan layanan di kolom pertama dan menandai kolom pasangannya', () => {
    expect(errorsForApiError(new ApiError(409, 'DATE_OVERLAP', 'Bertumpuk.'))).toEqual({ startDate: 'Bertumpuk.', endDate: '' })
    expect(errorsForApiError(new ApiError(422, 'DEADLINE_H7', 'H-7.'))).toEqual({ startDate: 'H-7.' })
    expect(errorsForApiError(new ApiError(422, 'INSUFFICIENT_BALANCE', 'Saldo.'))).toEqual({ balance: 'Saldo.' })
  })

  it('membaca kolom VALIDATION_ERROR dari pesannya', () => {
    const err = new ApiError(400, 'VALIDATION_ERROR', 'Tanggal akhir tidak boleh sebelum tanggal mulai.')
    expect(errorsForApiError(err)).toEqual({ endDate: err.message })
  })

  it('mengembalikan null untuk galat yang bukan soal kolom', () => {
    expect(errorsForApiError(new ApiError(404, 'EMPLOYEE_NOT_FOUND', 'x'))).toBeNull()
  })
})
