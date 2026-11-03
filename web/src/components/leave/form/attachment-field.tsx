import { FieldLabel } from '../../atoms/field-label'
import { FileList } from '../../molecules/file-list'
import { UploadZone } from '../../molecules/upload-zone'
import { formatSize } from '../../../lib/format-date'
import { uuidv7 } from '../../../lib/uuid'
import { ATTACHMENT_ACCEPT, ATTACHMENT_HINT, checkAttachment } from './attachment-rules'
import type { FormAttachment } from './form-values'

type AttachmentFieldProps = {
  label: string
  attachments: FormAttachment[]
  onChange: (next: FormAttachment[]) => void
  onReject: (message: string) => void
  disabled?: boolean
  error?: boolean
}

/** Lampiran wajib cuti sakit dan melahirkan. Berkas yang ditolak dilaporkan lewat onReject. */
export function AttachmentField({ label, attachments, onChange, onReject, disabled, error }: AttachmentFieldProps) {
  // Layanan v1.1.0 belum mengimplementasikan POST /api/v1/leave-attachments, jadi attachmentId
  // dibuat di peramban (UUID v7). Ganti dengan unggahan sungguhan setelah endpoint tersedia.
  function add(file: File) {
    onChange([...attachments, { attachmentId: uuidv7(), fileName: file.name, sizeBytes: file.size }])
  }

  const files = attachments.map((a) => ({
    id: a.attachmentId,
    name: a.fileName,
    meta: a.sizeBytes ? formatSize(a.sizeBytes) : undefined,
  }))

  return (
    <div>
      <FieldLabel id="attachment-label" required>
        {label}
      </FieldLabel>
      <UploadZone
        accept={ATTACHMENT_ACCEPT}
        hint={ATTACHMENT_HINT}
        check={checkAttachment}
        onFile={add}
        onReject={onReject}
        disabled={disabled}
        error={error}
        labelledBy="attachment-label"
      />
      <FileList
        files={files}
        onRemove={disabled ? undefined : (id) => onChange(attachments.filter((a) => a.attachmentId !== id))}
      />
    </div>
  )
}
