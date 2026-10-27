import { describe, expect, it } from 'vitest'
import { calendarDays, estimateWorkingDays } from './working-days'

describe('working-days', () => {
  it('menghitung Senin sampai Jumat saja', () => {
    expect(estimateWorkingDays('2026-11-09', '2026-11-11')).toBe(3)
    expect(estimateWorkingDays('2026-11-09', '2026-11-12')).toBe(4)
    expect(estimateWorkingDays('2026-11-14', '2026-11-15')).toBe(0)
  })

  it('menghitung hari kalender inklusif untuk cuti melahirkan', () => {
    expect(calendarDays('2026-12-01', '2027-02-28')).toBe(90)
  })
})
