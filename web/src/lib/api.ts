// Inti HTTP ke layanan F-4. Semua panggilan lewat callApi; path selalu relatif agar UI dan API satu origin.

let bearerToken: string | null = null

// Mock login Kelompok 1: token uji dipasang sesi. Diganti token dari layanan Kelompok 1 setelah tersedia.
export function setBearerToken(token: string | null) {
  bearerToken = token
}

let onUnauthorized: (() => void) | null = null

// Sesi memasang penangan ini agar balasan 401 di mana pun menampilkan layar "Sesi berakhir".
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

type CallOptions = {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
}

const NETWORK_MESSAGE = 'Permintaan gagal dikirim. Periksa koneksi lalu coba lagi.'
const UNAVAILABLE_MESSAGE = 'Layanan cuti sedang tidak dapat dihubungi. Coba lagi beberapa saat lagi.'

export async function callApi<T>(path: string, { method = 'GET', body, headers }: CallOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      method,
      headers: {
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE)
  }
  // Galat layanan F-4 berbentuk { code, message }; balasan proxy saat layanan mati tidak berbadan JSON.
  const data: unknown = await res.json().catch(() => null)
  if (res.ok) return data as T
  const err = (data ?? {}) as { code?: string; message?: string }
  if (res.status === 401) onUnauthorized?.()
  if (!err.code) throw new ApiError(res.status, 'API_UNAVAILABLE', UNAVAILABLE_MESSAGE)
  throw new ApiError(res.status, err.code, err.message ?? UNAVAILABLE_MESSAGE)
}

export function errorMessage(err: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') {
  return err instanceof ApiError ? err.message : fallback
}

// Gagal karena jaringan atau layanan tidak terjangkau: pengguna bisa mencoba lagi dengan isian yang sama.
export function isConnectionError(err: unknown) {
  return err instanceof ApiError && (err.code === 'NETWORK_ERROR' || err.code === 'API_UNAVAILABLE')
}

export const errorCode = (err: unknown) => (err instanceof ApiError ? err.code : undefined)
