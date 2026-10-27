import type { ReactNode } from 'react'
import { Button } from '../atoms/button'
import { Modal } from './modal'

type ConfirmModalProps = {
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

/** Modal ya/tidak: "Batal" bergaris dan tombol aksi utama (merah untuk aksi yang tidak bisa dibatalkan). */
export function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Batal',
  danger,
  busy,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      description={description}
      onClose={onCancel}
      dismissible={!busy}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Memproses...' : confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
