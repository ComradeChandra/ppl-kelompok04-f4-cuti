import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NoticeSlot } from '../../layouts/notice-slot'
import { NoticeProvider } from '../../lib/notice'
import { SessionProvider } from '../../lib/session'
import LeaveFormPage from './leave-form-page'

type Reply = { status: number; body: unknown } | 'offline'

// Tiruan layanan F-4: jawaban per "METHOD path" (path tanpa query).
function serve(routes: Record<string, Reply>) {
  const calls: { key: string; body: unknown }[] = []
  vi.stubGlobal('fetch', async (input: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${input.split('?')[0]}`
    calls.push({ key, body: init?.body ? JSON.parse(String(init.body)) : undefined })
    const reply = routes[key] ?? { status: 404, body: { code: 'NOT_FOUND', message: 'Tidak ada.' } }
    if (reply === 'offline') throw new TypeError('Failed to fetch')
    return new Response(JSON.stringify(reply.body), { status: reply.status })
  })
  return calls
}

const BASE: Record<string, Reply> = {
  'GET /health': { status: 200, body: { today: '2026-10-27' } },
  'GET /api/v1/leave-balances/EMP-001': {
    status: 200,
    body: { eligible: true, eligibleFrom: '2025-03-01', availableDays: 6, remainingDays: 9, pendingDays: 3, entitlementDays: 12, usedDays: 3, year: 2026, employeeId: 'EMP-001', expiresOn: '2026-12-31' },
  },
  'GET /api/v1/leave-requests': { status: 200, body: { items: [] } },
}

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/cuti/ajukan']}>
      <SessionProvider>
        <NoticeProvider>
          <NoticeSlot />
          <Routes>
            <Route path="/cuti/ajukan" element={<LeaveFormPage />} />
          </Routes>
        </NoticeProvider>
      </SessionProvider>
    </MemoryRouter>,
  )
}

async function fillValid() {
  await userEvent.type(await screen.findByLabelText(/Tanggal mulai/), '2026-11-09')
  await userEvent.type(screen.getByLabelText(/Tanggal akhir/), '2026-11-11')
  await userEvent.type(screen.getByLabelText(/Alasan/), 'Menghadiri pernikahan saudara')
}

describe('LeaveFormPage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('menandai kolom kosong dengan tepi merah dan pesan di bawah kolom (board "Input salah")', async () => {
    serve(BASE)
    renderForm()
    await userEvent.click(await screen.findByRole('button', { name: 'Simpan draf' }))

    expect(screen.getByLabelText(/Tanggal mulai/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Tanggal mulai wajib diisi.')).toBeInTheDocument()
    expect(screen.getByText('Alasan cuti wajib diisi.')).toBeInTheDocument()
  })

  it('menampilkan penolakan DATE_OVERLAP dari layanan di bawah kolom tanggal', async () => {
    const message = 'Tanggal cuti bertumpuk dengan pengajuan lain milik Anda (termasuk draf).'
    const calls = serve({ ...BASE, 'POST /api/v1/leave-requests': { status: 409, body: { code: 'DATE_OVERLAP', message } } })
    renderForm()
    await fillValid()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan draf' }))

    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tanggal mulai/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/Tanggal akhir/)).toHaveAttribute('aria-invalid', 'true')
    const post = calls.find((c) => c.key === 'POST /api/v1/leave-requests')
    expect(post?.body).toMatchObject({ leaveType: 'ANNUAL', startDate: '2026-11-09', submit: false })
  })

  it('menawarkan Coba lagi saat jaringan gagal dan mempertahankan isian (board "Gagal (jaringan)")', async () => {
    serve({ ...BASE, 'POST /api/v1/leave-requests': 'offline' })
    renderForm()
    await fillValid()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan draf' }))

    const banner = await screen.findByRole('alert')
    expect(banner).toHaveTextContent('Pengajuan gagal dikirim. Periksa koneksi lalu coba lagi.')
    expect(banner).toHaveAttribute('data-error-code', 'NETWORK_ERROR')
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Alasan/)).toHaveValue('Menghadiri pernikahan saudara')
  })
})
