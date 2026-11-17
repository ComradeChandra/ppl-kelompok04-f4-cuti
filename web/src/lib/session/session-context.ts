import { createContext } from 'react'
import type { Account, EmployeeSource } from './accounts'

export type Session = {
  account: Account
  // Akun uji yang dapat dipilih pada sumber referensi karyawan yang aktif.
  accounts: Account[]
  // Tanggal "hari ini" milik layanan (DEMO_TODAY), agar aturan H-7 di layar sama dengan di layanan.
  today: string
  employeeSource: EmployeeSource
  // true setelah layanan membalas 401: halaman diganti layar "Sesi berakhir".
  expired: boolean
  switchAccount: (token: string) => void
}

export const SessionContext = createContext<Session | null>(null)
