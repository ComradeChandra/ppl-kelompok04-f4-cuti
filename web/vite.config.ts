import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// /api dan /health diteruskan ke layanan F-4: UI dan API berbagi satu origin, dan layanan belum mengirim header CORS.
const API_URL = process.env.API_URL ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': API_URL,
      '/health': API_URL,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest-setup.ts'],
    // .spec, bukan .test: node --test di akar repo (uji layanan F-4) otomatis memungut *.test.ts.
    include: ['src/**/*.spec.{ts,tsx}'],
    css: false,
  },
})
