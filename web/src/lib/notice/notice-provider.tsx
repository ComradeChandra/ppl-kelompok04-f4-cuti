import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Notice } from '../../types/ui'
import { NoticeContext, type Notify } from './notice-context'

type Held = Notice & { carried: boolean }

/** Satu pesan halaman pada satu waktu. Pesan baru menggantikan yang lama. */
export function NoticeProvider({ children }: { children: ReactNode }) {
  const [held, setHeld] = useState<Held | null>(null)
  const nextId = useRef(0)

  const notify = useCallback<Notify>((kind, text, options = {}) => {
    nextId.current += 1
    setHeld({ id: nextId.current, kind, text, code: options.code, action: options.action, carried: false })
  }, [])

  const dismiss = useCallback(() => setHeld(null), [])

  const onNavigate = useCallback(() => {
    setHeld((n) => (n && !n.carried ? { ...n, carried: true } : null))
  }, [])

  const value = useMemo(() => ({ notice: held, notify, dismiss, onNavigate }), [held, notify, dismiss, onNavigate])
  return <NoticeContext.Provider value={value}>{children}</NoticeContext.Provider>
}
