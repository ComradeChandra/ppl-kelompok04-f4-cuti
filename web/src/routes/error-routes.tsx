import { lazy } from 'react'
import { Route } from 'react-router'

const WipPage = lazy(() => import('../pages/error/wip/wip-page'))
const ForbiddenPage = lazy(() => import('../pages/error/forbidden/forbidden-page'))

// Menu milik kelompok lain (Beranda, Kehadiran F-3, Payroll F-5) belum terhubung ke modul ini.
export const ErrorRoutes = (
  <>
    <Route path="/beranda" element={<WipPage />} />
    <Route path="/kehadiran" element={<WipPage />} />
    <Route path="/payroll" element={<WipPage />} />
    <Route path="/403" element={<ForbiddenPage />} />
  </>
)
