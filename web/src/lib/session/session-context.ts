import { createContext } from 'react'
import type { Account } from './accounts'

export type Session = {
  account: Account
  // Tanggal "hari ini" milik layanan (DEMO_TODAY), agar aturan H-7 di layar sama dengan di layanan.
  today: string
  // true setelah layanan membalas 401: halaman diganti layar "Sesi berakhir".
  expired: boolean
  switchAccount: (token: string) => void
}

export const SessionContext = createContext<Session | null>(null)
