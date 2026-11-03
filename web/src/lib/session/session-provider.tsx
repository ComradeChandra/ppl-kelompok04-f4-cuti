import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setBearerToken, setUnauthorizedHandler } from '../api'
import { getServiceToday } from '../leave-api'
import { findAccount } from './accounts'
import { SessionContext } from './session-context'

const STORAGE_KEY = 'f4-cuti-token'

function restoreAccount() {
  const account = findAccount(localStorage.getItem(STORAGE_KEY))
  setBearerToken(account.token)
  return account
}

const localToday = () => new Date().toISOString().slice(0, 10)

/** Menyimpan akun uji yang aktif dan tanggal layanan; anak dirender setelah tanggal diketahui. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState(restoreAccount)
  const [today, setToday] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    getServiceToday().then(setToday, () => setToday(localToday()))
    setUnauthorizedHandler(() => setExpired(true))
    return () => setUnauthorizedHandler(null)
  }, [])

  // Memilih akun (juga "Login kembali") memasang token baru dan menutup layar sesi berakhir.
  const switchAccount = useCallback((token: string) => {
    const next = findAccount(token)
    // Token dipasang sebelum render berikutnya agar permintaan halaman baru memakai akun yang benar.
    setBearerToken(next.token)
    localStorage.setItem(STORAGE_KEY, next.token)
    setAccount(next)
    setExpired(false)
  }, [])

  const value = useMemo(
    () => (today ? { account, today, expired, switchAccount } : null),
    [account, today, expired, switchAccount],
  )
  if (!value) return null
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
