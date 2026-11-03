import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { SingleSelect } from '../components/molecules/single-select'
import { ACCOUNTS, findAccount, isApprover, useSession } from '../lib/session'

const OPTIONS = ACCOUNTS.map((a) => ({ value: a.token, label: `${a.name} (${a.employeeId})` }))

// Alamat yang harus ditinggalkan saat akun berganti: draf dan detail milik akun lama, dan
// Persetujuan cuti bila akun baru bukan COO/CEO. null berarti tetap di halaman yang sama.
function exitFor(path: string, token: string) {
  if (path.startsWith('/cuti/ajukan?')) return '/cuti/ajukan'
  if (path.startsWith('/cuti/') && !path.startsWith('/cuti/ajukan')) return '/cuti'
  if (path.startsWith('/persetujuan') && !isApprover(findAccount(token))) return '/cuti'
  return null
}

/** Pengganti login Kelompok 1 selama layanannya belum tersedia: memilih akun uji dari seed. */
export function AccountSwitcher() {
  const { account, switchAccount } = useSession()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const pending = useRef<{ token: string; to: string } | null>(null)
  const here = pathname + search

  // react-router menerapkan perpindahan setelah render berikutnya. Akun baru baru dipasang setelah tujuan
  // terbuka, agar penjaga rute persetujuan tidak sempat melihat akun baru di /persetujuan lalu ke 403.
  useEffect(() => {
    if (!pending.current || here !== pending.current.to) return
    switchAccount(pending.current.token)
    pending.current = null
  }, [here, switchAccount])

  function onChange(token: string) {
    const to = exitFor(here, token)
    if (!to) return switchAccount(token)
    pending.current = { token, to }
    navigate(to, { replace: true })
  }

  return <SingleSelect size="sm" ariaLabel="Masuk sebagai" options={OPTIONS} value={account.token} onChange={onChange} />
}
