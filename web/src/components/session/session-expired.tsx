import { useNavigate } from 'react-router'
import { Button } from '../atoms/button'
import { StatePanel } from '../organisms/state-panel'
import { useSession } from '../../lib/session'

/** Keadaan 401. "Login kembali" memasang ulang akun uji sampai layanan login Kelompok 1 tersedia. */
export function SessionExpired() {
  const { account, switchAccount } = useSession()
  const navigate = useNavigate()

  function login() {
    switchAccount(account.token)
    navigate('/cuti', { replace: true })
  }

  return (
    <StatePanel
      title="Sesi berakhir, silakan login kembali."
      description="Isian yang belum terkirim tidak disimpan."
      action={
        <Button variant="primary" onClick={login}>
          Login kembali
        </Button>
      }
    />
  )
}
