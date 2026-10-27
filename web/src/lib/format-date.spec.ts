import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatRange, formatSize } from './format-date'

describe('format-date', () => {
  it('menulis tanggal dengan nama bulan Indonesia', () => {
    expect(formatDate('2026-10-20')).toBe('20 Okt 2026')
    expect(formatDate('2026-08-03')).toBe('03 Agu 2026')
  })

  it('meringkas rentang satu hari menjadi satu tanggal', () => {
    expect(formatRange('2026-11-09', '2026-11-09')).toBe('09 Nov 2026')
    expect(formatRange('2026-11-09', '2026-11-12')).toBe('09 Nov 2026 – 12 Nov 2026')
  })

  it('menampilkan waktu UTC dalam WIB', () => {
    expect(formatDateTime('2026-10-27T02:00:00Z')).toBe('27 Okt 2026 09.00 WIB')
    expect(formatDateTime('2026-12-31T17:30:00Z')).toBe('01 Jan 2027 00.30 WIB')
  })

  it('menulis ukuran berkas dalam KB atau MB', () => {
    expect(formatSize(1_258_291)).toBe('1.2 MB')
    expect(formatSize(300)).toBe('1 KB')
  })
})
