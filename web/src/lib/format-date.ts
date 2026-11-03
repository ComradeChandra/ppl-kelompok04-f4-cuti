// Format tanggal tampilan. Tanggal bisnis memakai zona Asia/Jakarta (WIB).

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-')
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`
}

export function formatRange(start: string, end: string) {
  return start === end ? formatDate(start) : `${formatDate(start)} – ${formatDate(end)}`
}

const WIB = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function formatDateTime(iso: string) {
  const p = Object.fromEntries(WIB.formatToParts(new Date(iso)).map((x) => [x.type, x.value]))
  return `${p.day} ${MONTHS[Number(p.month) - 1]} ${p.year} ${p.hour}.${p.minute} WIB`
}

export function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export const yearOf = (isoDate: string) => Number(isoDate.slice(0, 4))
