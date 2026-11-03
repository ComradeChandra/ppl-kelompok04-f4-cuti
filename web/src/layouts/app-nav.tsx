import { NavMenu } from '../components/navigation/nav-menu'

/** Sidebar 256px: identitas perusahaan dan menu utama. Disembunyikan di layar sempit. */
export function AppNav() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-white md:block">
      <div className="border-b border-line-faint px-6 pt-5 pb-5">
        <p className="text-[17px] leading-snug font-bold tracking-[-0.025em] text-ink">ERP Anaheim Nimbus</p>
        <p className="mt-1 text-xs text-ink-faint">PT Anaheim Nimbus Universal</p>
      </div>
      <NavMenu />
    </aside>
  )
}
