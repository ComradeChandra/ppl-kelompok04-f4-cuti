import { Outlet } from 'react-router'
import { SessionExpired } from '../components/session/session-expired'
import { useSession } from '../lib/session'
import { AppHeader } from './app-header'
import { AppNav } from './app-nav'
import { NoticeSlot } from './notice-slot'

/** Cangkang halaman: sidebar, bilah atas, pesan halaman, lalu isi halaman (atau layar sesi berakhir). */
export function AppLayout() {
  const { account, expired } = useSession()
  return (
    <div className="flex min-h-screen">
      <AppNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="w-full max-w-[1280px] p-4 md:p-8">
          <NoticeSlot />
          {/* key: seluruh halaman dimuat ulang saat akun uji diganti. */}
          {expired ? <SessionExpired /> : <Outlet key={account.token} />}
        </main>
      </div>
    </div>
  )
}
