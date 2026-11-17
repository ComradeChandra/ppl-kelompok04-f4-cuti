// ID panjang (UUID v7 dari Kelompok 2) ditampilkan disingkat seperti di board Figma, contoh 01929b4a...7a90.
// ID pendek (EMP-001) ditampilkan utuh.
export function shortId(id: string) {
  return id.length > 16 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id
}
