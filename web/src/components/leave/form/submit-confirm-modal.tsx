import { ConfirmModal } from '../../organisms/confirm-modal'
import { formatRange } from '../../../lib/format-date'
import { LEAVE_TYPE_LABEL } from '../../../lib/leave-labels'
import type { FormValues } from './form-values'

type SubmitConfirmModalProps = {
  values: FormValues
  onConfirm: () => void
  onCancel: () => void
}

/** Konfirmasi Kirim: ringkasan pengajuan dan siapa yang akan memutuskannya. Status mengirim tampil di formulir. */
export function SubmitConfirmModal({ values, onConfirm, onCancel }: SubmitConfirmModalProps) {
  const next =
    values.leaveType === 'MENSTRUAL'
      ? 'Pemberitahuan cuti haid langsung tercatat dan disetujui.'
      : 'Pengajuan akan dikirim ke COO untuk diputuskan dan tidak dapat diubah lagi.'
  return (
    <ConfirmModal
      title="Kirim pengajuan cuti?"
      description={
        <>
          <p>
            {LEAVE_TYPE_LABEL[values.leaveType]} · {formatRange(values.startDate, values.endDate)}.
          </p>
          <p>{next}</p>
        </>
      }
      confirmLabel="Ya, kirim"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
