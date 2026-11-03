// Menu sidebar ERP. Label disalin dari board Figma; Persetujuan cuti hanya untuk COO dan CEO.

export type MenuItem = {
  to: string
  label: string
  approverOnly?: boolean
}

export const MENU_ITEMS: MenuItem[] = [
  { to: '/beranda', label: 'Beranda' },
  { to: '/kehadiran', label: 'Kehadiran' },
  { to: '/cuti', label: 'Cuti' },
  { to: '/persetujuan', label: 'Persetujuan cuti', approverOnly: true },
  { to: '/payroll', label: 'Payroll' },
]

export const HEADER_TITLE: Record<string, string> = {
  beranda: 'Beranda',
  kehadiran: 'Kehadiran',
  cuti: 'Cuti',
  persetujuan: 'Persetujuan cuti',
  payroll: 'Payroll',
}
