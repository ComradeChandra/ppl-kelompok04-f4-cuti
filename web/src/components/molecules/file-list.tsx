import { Badge } from '../atoms/badge'
import { IconFile } from '../atoms/icons'

export type FileItem = { id: string; name: string; meta?: string }

type FileListProps = {
  files: FileItem[]
  onRemove?: (id: string) => void
}

/** Daftar berkas terunggah; tombol Hapus hanya tampil bila onRemove diberikan. */
export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null
  return (
    <ul className="mt-2.5 flex flex-col gap-1.5">
      {files.map((f) => (
        <li key={f.id} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-xs">
          <IconFile className="text-ink-muted" />
          <span className="min-w-0 flex-1 truncate">
            {f.name}
            {f.meta && <span className="text-ink-muted"> · {f.meta}</span>}
          </span>
          <Badge tone="success">Terunggah</Badge>
          {onRemove && (
            <button type="button" onClick={() => onRemove(f.id)} className="px-1 font-medium text-danger hover:underline">
              Hapus
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
