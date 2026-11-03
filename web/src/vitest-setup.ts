import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Node 25 memasang localStorage global sendiri (tanpa berkas: tidak berfungsi) yang menutupi milik jsdom.
// Uji memakai penyimpanan di memori agar perilakunya sama dengan peramban.
function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true })

afterEach(() => {
  cleanup()
  localStorage.clear()
})
