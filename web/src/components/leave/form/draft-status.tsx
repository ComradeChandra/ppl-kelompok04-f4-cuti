import { Badge } from '../../atoms/badge'
import { Button } from '../../atoms/button'
import type { FormMode } from './use-leave-form'

type DraftStatusProps = {
  mode: FormMode
  onEdit: () => void
}

/** Penanda draf di kanan judul: terkunci dengan tombol Ubah draf, atau sedang diedit. */
export function DraftStatus({ mode, onEdit }: DraftStatusProps) {
  if (mode !== 'view' && mode !== 'edit') return null
  const editing = mode === 'edit'
  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <div className="flex items-center gap-2.5">
        <Badge tone={editing ? 'warning' : 'neutral'}>{editing ? 'Sedang mengedit draf' : 'Draf · belum dikirim'}</Badge>
        {!editing && <Button onClick={onEdit}>Ubah draf</Button>}
      </div>
      <p className="text-[11px] text-ink-muted">
        {editing ? 'Belum dikirim. Simpan draf untuk menyimpan perubahan.' : 'Draf tersimpan dan belum dikirim ke COO.'}
      </p>
    </div>
  )
}
