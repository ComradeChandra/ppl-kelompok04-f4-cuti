import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { AlertBanner } from '../components/molecules/alert-banner'
import { useNoticeSlot } from '../lib/notice'

const SUCCESS_MS = 6000

/** Tempat pesan halaman di atas isi; pesan berhasil hilang sendiri, pesan gagal menunggu ditutup. */
export function NoticeSlot() {
  const { notice, dismiss, onNavigate } = useNoticeSlot()
  const { key } = useLocation()
  const firstKey = useRef(key)

  useEffect(() => {
    if (key !== firstKey.current) onNavigate()
    firstKey.current = key
  }, [key, onNavigate])

  useEffect(() => {
    if (notice?.kind !== 'success') return
    const timer = window.setTimeout(dismiss, SUCCESS_MS)
    return () => window.clearTimeout(timer)
  }, [notice, dismiss])

  if (!notice) return null
  return <AlertBanner key={notice.id} notice={notice} onClose={dismiss} />
}
