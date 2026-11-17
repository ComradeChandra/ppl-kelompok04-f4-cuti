import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setBearerToken, setUnauthorizedHandler } from '../api'
import { getServiceInfo } from '../leave-api'
import { accountsFor, findAccount, type Account, type EmployeeSource } from './accounts'
import { SessionContext } from './session-context'

const STORAGE_KEY = 'f4-cuti-token'

type Service = { today: string; source: EmployeeSource }

const localToday = () => new Date().toISOString().slice(0, 10)

function pickAccount(token: string | null, list: Account[]) {
  const account = findAccount(token, list)
  setBearerToken(account.token)
  return account
}

/** Akun uji aktif, tanggal layanan, dan sumber referensi karyawan; anak dirender setelah layanan menjawab. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState<Service | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    // Mode f2 hanya mengenal karyawan dari API Kelompok 2 (Sandy Walsh, Rina Maharani); mode seed hanya EMP-xxx.
    const start = (next: Service) => {
      setService(next)
      setAccount(pickAccount(localStorage.getItem(STORAGE_KEY), accountsFor(next.source)))
    }
    getServiceInfo().then(
      (info) => start({ today: info.today, source: info.employeeSource ?? 'seed' }),
      () => start({ today: localToday(), source: 'seed' }),
    )
    setUnauthorizedHandler(() => setExpired(true))
    return () => setUnauthorizedHandler(null)
  }, [])

  const accounts = useMemo(() => accountsFor(service?.source ?? 'seed'), [service])

  // Memilih akun (juga "Login kembali") memasang token baru dan menutup layar sesi berakhir.
  const switchAccount = useCallback(
    (token: string) => {
      const next = pickAccount(token, accounts)
      localStorage.setItem(STORAGE_KEY, next.token)
      setAccount(next)
      setExpired(false)
    },
    [accounts],
  )

  const value = useMemo(
    () =>
      service && account
        ? { account, accounts, today: service.today, employeeSource: service.source, expired, switchAccount }
        : null,
    [account, accounts, service, expired, switchAccount],
  )
  if (!value) return null
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
