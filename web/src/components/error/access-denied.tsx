import { LinkButton } from '../atoms/link-button'
import { StatePanel } from '../organisms/state-panel'

/** Keadaan 403: membuka data milik orang lain atau halaman di luar peran. */
export function AccessDenied() {
  return (
    <StatePanel
      tone="danger"
      title="Anda tidak memiliki akses ke data ini."
      action={<LinkButton to="/cuti">‹ Kembali ke Cuti</LinkButton>}
    />
  )
}
