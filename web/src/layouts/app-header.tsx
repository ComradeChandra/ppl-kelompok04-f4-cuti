import { useLocation } from 'react-router'
import { HEADER_TITLE } from '../components/navigation/menu-items'
import { useSession } from '../lib/session'
import { AccountSwitcher } from './account-switcher'

/** Bilah atas 64px: nama menu aktif di kiri, nama dan peran pengguna di kanan. */
export function AppHeader() {
  const { account } = useSession()
  const section = useLocation().pathname.split('/')[1]

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-4 md:px-8">
      <span className="text-sm text-ink-soft">{HEADER_TITLE[section] ?? 'Cuti'}</span>
      <div className="flex items-center gap-3">
        <p className="text-sm">
          <span className="font-bold text-ink">{account.name}</span>
          <span className="hidden text-ink-dim sm:inline"> · {account.roleLabel}</span>
        </p>
        <AccountSwitcher />
      </div>
    </header>
  )
}
