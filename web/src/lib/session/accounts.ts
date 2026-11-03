// Mock login Kelompok 1: token uji dari seed/seed.json layanan F-4.
// Diganti token dan profil dari layanan identitas Kelompok 1 setelah API-nya terbit.

export type Role = 'EMPLOYEE' | 'COO' | 'CEO'

export type Account = {
  token: string
  name: string
  employeeId: string
  role: Role
  roleLabel: string
}

export const ACCOUNTS: Account[] = [
  { token: 'token-uji-karyawan', name: 'Nadia Prameswari', employeeId: 'EMP-001', role: 'EMPLOYEE', roleLabel: 'Karyawan' },
  { token: 'token-uji-karyawan-2', name: 'Sinta Maharani', employeeId: 'EMP-003', role: 'EMPLOYEE', roleLabel: 'Karyawan' },
  { token: 'token-uji-karyawan-baru', name: 'Raka Wiratama', employeeId: 'EMP-002', role: 'EMPLOYEE', roleLabel: 'Karyawan' },
  { token: 'token-uji-karyawan-3', name: 'Akun uji EMP-999', employeeId: 'EMP-999', role: 'EMPLOYEE', roleLabel: 'Karyawan' },
  { token: 'token-uji-tenaga-ahli', name: 'Laras Anindita', employeeId: 'EMP-004', role: 'EMPLOYEE', roleLabel: 'Tenaga ahli' },
  { token: 'token-uji-coo', name: 'Bima Saputra', employeeId: 'EMP-005', role: 'COO', roleLabel: 'COO · Persetujuan tahap 1' },
  { token: 'token-uji-ceo', name: 'Maya Lestari', employeeId: 'EMP-006', role: 'CEO', roleLabel: 'CEO · Persetujuan tahap 2' },
]

export const isApprover = (account: Account) => account.role === 'COO' || account.role === 'CEO'

export function findAccount(token: string | null) {
  return ACCOUNTS.find((a) => a.token === token) ?? ACCOUNTS[0]
}
