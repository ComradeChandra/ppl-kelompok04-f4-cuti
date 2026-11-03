// Perkiraan hari di peramban sebelum disimpan. Angka final dihitung layanan F-4 dengan kalender libur Kelompok 3.

const toUtc = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`)

export function estimateWorkingDays(start: string, end: string) {
  let count = 0
  for (let d = toUtc(start); d <= toUtc(end); d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) count += 1
  }
  return count
}

export function calendarDays(start: string, end: string) {
  return Math.round((toUtc(end).getTime() - toUtc(start).getTime()) / 86_400_000) + 1
}
