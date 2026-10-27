// Aturan berkas lampiran cuti (kontrak POST /api/v1/leave-attachments): PDF, JPG, atau PNG, maksimal 2 MB.

export const ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'
export const ATTACHMENT_HINT = 'PDF, JPG, atau PNG · maks. 2 MB'

const MAX_BYTES = 2 * 1024 * 1024
const TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export function checkAttachment(file: File): string | null {
  if (!TYPES.includes(file.type)) return 'Format berkas harus PDF, JPG, atau PNG.'
  if (file.size > MAX_BYTES) return 'Ukuran berkas maksimal 2 MB.'
  return null
}
