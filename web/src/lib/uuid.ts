// UUID v7 (RFC 9562): 48 bit waktu milidetik, versi 7, lalu bit acak. Format sama dengan ID terbitan F-4.
export function uuidv7() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let time = Date.now()
  for (let i = 5; i >= 0; i -= 1) {
    bytes[i] = time % 256
    time = Math.floor(time / 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
