import { lazy } from 'react'
import { Route } from 'react-router'

const LeaveListPage = lazy(() => import('../pages/leave/leave-list-page'))
const LeaveFormPage = lazy(() => import('../pages/leave/leave-form-page'))
const LeaveDetailPage = lazy(() => import('../pages/leave/leave-detail-page'))

// Fragmen <Route> menu Cuti (bukan komponen): disisipkan ke <Routes> lewat {LeaveRoutes}.
export const LeaveRoutes = (
  <>
    <Route path="/cuti" element={<LeaveListPage />} />
    <Route path="/cuti/ajukan" element={<LeaveFormPage />} />
    <Route path="/cuti/:leaveRequestId" element={<LeaveDetailPage />} />
  </>
)
