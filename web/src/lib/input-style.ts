// Untaian kelas isian formulir. Galat membuat tepi merah; pesannya tampil di bawah kolom (FieldError).
export function inputClass(error?: boolean, multiline = false) {
  return [
    'w-full rounded-lg border bg-white px-3.5 text-sm text-ink placeholder:text-ink-faint',
    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus',
    'disabled:bg-field disabled:text-ink-soft',
    multiline ? 'h-24 resize-none py-2.5 leading-[1.6]' : 'h-control',
    error ? 'border-danger' : 'border-line-strong',
  ].join(' ')
}

export function readOnlyBoxClass(error?: boolean) {
  const border = error ? 'border-danger' : 'border-line'
  return `flex min-h-control items-center justify-between gap-2 rounded-lg border bg-field px-4 text-sm text-ink ${border}`
}
