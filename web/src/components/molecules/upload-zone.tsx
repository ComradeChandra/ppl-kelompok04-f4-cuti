import { useId, useState, type DragEvent } from 'react'
import { IconUpload } from '../atoms/icons'

type UploadZoneProps = {
  accept: string
  hint: string
  // Aturan berkas disuplai pemanggil; mengembalikan kalimat tolak atau null bila berkas diterima.
  check: (file: File) => string | null
  onFile: (file: File) => void
  onReject: (message: string) => void
  disabled?: boolean
  error?: boolean
  labelledBy?: string
}

/** Area pilih atau seret berkas. Penolakan dikembalikan lewat onReject; pesannya ditampilkan halaman. */
export function UploadZone({ accept, hint, check, onFile, onReject, disabled, error, labelledBy }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputId = useId()

  function take(file: File | undefined) {
    if (!file || disabled) return
    const problem = check(file)
    if (problem) onReject(problem)
    else onFile(file)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    take(e.dataTransfer.files[0])
  }

  const border = error ? 'border-danger' : dragging ? 'border-navy bg-field' : 'border-line-strong'
  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`flex flex-col items-center gap-1 rounded-lg border-[1.5px] border-dashed px-4 py-5 text-center ${border} ${
        disabled ? 'opacity-60' : 'cursor-pointer hover:bg-field'
      }`}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-labelledby={labelledBy}
        className="sr-only"
        onChange={(e) => {
          take(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <IconUpload className="text-ink-muted" />
      <span className="text-sm text-ink">
        <strong className="font-semibold">Pilih berkas</strong> atau seret ke sini
      </span>
      <span className="text-xs text-ink-faint">{hint}</span>
    </label>
  )
}
