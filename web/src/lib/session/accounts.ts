// Mock login Kelompok 1: token uji dari seed/seed.json layanan F-4.
// Diganti token dan profil dari layanan identitas Kelompok 1 setelah API-nya terbit.

export type Role = 'EMPLOYEE' | 'COO' | 'CEO'

// Sumber referensi karyawan di layanan F-4 (GET /health → employeeSource).
export type EmployeeSource = 'seed' | 'f2'

export type Account = {
  token: string
  name: string
  employeeId: string
  role: Role
  roleLabel: string
  // Karyawan hanya dikenal pada satu sumber: EMP-xxx di seed F-4, UUID v7 di API Kelompok 2. Penyetuju tampil di keduanya.
  source: EmployeeSource | 'any'
}

export const ACCOUNTS: Account[] = [
  { token: 'token-uji-karyawan-f2', name: 'Sandy Walsh', employeeId: '01929b4a-5f10-7a22-9d44-3c8f1b2e7a90', role: 'EMPLOYEE', roleLabel: 'Karyawan', source: 'f2' },
  { token: 'token-uji-karyawan-f2-kontrak', name: 'Rina Maharani', employeeId: '01a1598a-6356-7933-8239-589944b35d30', role: 'EMPLOYEE', roleLabel: 'Karyawan kontrak', source: 'f2' },
  { token: 'token-uji-karyawan', name: 'Nadia Prameswari', employeeId: 'EMP-001', role: 'EMPLOYEE', roleLabel: 'Karyawan', source: 'seed' },
  { token: 'token-uji-karyawan-2', name: 'Sinta Maharani', employeeId: 'EMP-003', role: 'EMPLOYEE', roleLabel: 'Karyawan', source: 'seed' },
  { token: 'token-uji-karyawan-baru', name: 'Raka Wiratama', employeeId: 'EMP-002', role: 'EMPLOYEE', roleLabel: 'Karyawan', source: 'seed' },
  { token: 'token-uji-karyawan-3', name: 'Akun uji EMP-999', employeeId: 'EMP-999', role: 'EMPLOYEE', roleLabel: 'Karyawan', source: 'seed' },
  { token: 'token-uji-tenaga-ahli', name: 'Laras Anindita', employeeId: 'EMP-004', role: 'EMPLOYEE', roleLabel: 'Tenaga ahli', source: 'seed' },
  { token: 'token-uji-coo', name: 'Bima Saputra', employeeId: 'EMP-005', role: 'COO', roleLabel: 'COO · Persetujuan tahap 1', source: 'any' },
  { token: 'token-uji-ceo', name: 'Maya Lestari', employeeId: 'EMP-006', role: 'CEO', roleLabel: 'CEO · Persetujuan tahap 2', source: 'any' },
]

export const isApprover = (account: Account) => account.role === 'COO' || account.role === 'CEO'

/** Akun yang dapat dipakai pada sumber referensi karyawan yang sedang aktif di layanan. */
export function accountsFor(source: EmployeeSource) {
  return ACCOUNTS.filter((a) => a.source === source || a.source === 'any')
}

export function findAccount(token: string | null, list: Account[] = ACCOUNTS) {
  return list.find((a) => a.token === token) ?? list[0]
}
