import { NavLink, useLocation } from 'react-router'
import { listLeaveRequests } from '../../lib/leave-api'
import { isApprover, useSession } from '../../lib/session'
import { useAsync } from '../../lib/use-async'
import { MENU_ITEMS } from './menu-items'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex items-center justify-between px-6 py-2.5 text-sm ${
    isActive ? 'bg-nav-active font-bold text-ink-strong' : 'text-ink-dim hover:bg-field'
  }`

/** Daftar menu sidebar; Persetujuan cuti memuat jumlah antrean yang menunggu keputusan akun ini. */
export function NavMenu() {
  const { account, today } = useSession()
  const location = useLocation()
  const approver = isApprover(account)
  // Dihitung ulang tiap pindah halaman agar angka turun setelah keputusan diambil.
  const queue = useAsync(
    () => (approver ? listLeaveRequests({ scope: 'approval', year: today.slice(0, 4) }) : Promise.resolve([])),
    [account.token, location.key],
  )
  const count = queue.data?.length ?? 0

  return (
    <nav aria-label="Menu utama" className="flex flex-col gap-1 pt-6">
      {MENU_ITEMS.filter((item) => !item.approverOnly || approver).map((item) => (
        <NavLink key={item.to} to={item.to} className={linkClass}>
          {({ isActive }) => (
            <>
              {isActive && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-navy" />}
              {item.label}
              {item.approverOnly && count > 0 && (
                <span className="min-w-5 rounded-full bg-navy px-1.5 text-center text-[11px] leading-5 font-semibold text-white">
                  {count}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
