import { useContext } from 'react'
import { NoticeContext } from './notice-context'

function useNoticeState() {
  const state = useContext(NoticeContext)
  if (!state) throw new Error('useNotice harus dipakai di dalam NoticeProvider.')
  return state
}

/** Fungsi untuk menampilkan pesan halaman (berhasil, gagal, peringatan). */
export function useNotice() {
  return useNoticeState().notify
}

/** Pesan yang sedang tampil beserta pengendalinya, dipakai cangkang halaman. */
export function useNoticeSlot() {
  return useNoticeState()
}
