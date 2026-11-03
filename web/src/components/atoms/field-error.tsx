/** Pesan galat merah di bawah kolom; tidak merender apa pun bila pesannya kosong. */
export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-[11px] leading-snug text-danger">
      {message}
    </p>
  )
}
