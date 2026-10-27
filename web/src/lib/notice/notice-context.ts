import { createContext } from 'react'
import type { Notice, NoticeAction, NoticeKind } from '../../types/ui'

export type NotifyOptions = {
  code?: string
  action?: NoticeAction
}

export type Notify = (kind: NoticeKind, text: string, options?: NotifyOptions) => void

export type NoticeState = {
  notice: Notice | null
  notify: Notify
  dismiss: () => void
  // Dipanggil setiap pindah halaman: pesan bertahan satu kali pindah (misalnya "terkirim" lalu ke detail).
  onNavigate: () => void
}

export const NoticeContext = createContext<NoticeState | null>(null)
