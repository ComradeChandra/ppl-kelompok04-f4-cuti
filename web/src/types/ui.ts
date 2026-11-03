// Tipe milik primitif lapisan atomic, bebas domain.

export type SelectOption = {
  value: string
  label: string
}

export type BadgeTone = 'neutral' | 'warning' | 'success' | 'danger'

export type NoticeKind = 'success' | 'error' | 'warning' | 'info'

export type NoticeAction = {
  label: string
  onClick: () => void
}

export type Notice = {
  id: number
  kind: NoticeKind
  text: string
  code?: string
  action?: NoticeAction
}

export type TimelineStep = {
  key: string
  title: string
  note?: string
  state: 'done' | 'current' | 'failed' | 'todo'
}
