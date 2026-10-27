import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './layouts/app-layout'
import { ApprovalRoutes } from './routes/approval-routes'
import { ErrorRoutes } from './routes/error-routes'
import { LeaveRoutes } from './routes/leave-routes'

const NotFoundPage = lazy(() => import('./pages/error/not-found/not-found-page'))

/** Merangkai peta rute. Modul F-4 berdiri sendiri, jadi / langsung membuka menu Cuti. */
export function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/cuti" replace />} />
          {LeaveRoutes}
          {ApprovalRoutes}
          {ErrorRoutes}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
