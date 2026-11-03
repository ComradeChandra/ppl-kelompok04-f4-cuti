import { Navigate, Outlet } from 'react-router'
import { isApprover, useSession } from '../lib/session'

/** Penjaga rute persetujuan: hanya COO dan CEO; akun lain diarahkan ke halaman 403. */
export function ApproverRoute() {
  const { account } = useSession()
  return isApprover(account) ? <Outlet /> : <Navigate to="/403" replace />
}
