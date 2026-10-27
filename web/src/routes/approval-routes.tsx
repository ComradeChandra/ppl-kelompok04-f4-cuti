import { lazy } from 'react'
import { Route } from 'react-router'
import { ApproverRoute } from '../components/approver-route'

const ApprovalPage = lazy(() => import('../pages/approval/approval-page'))

// Fragmen <Route> menu Persetujuan cuti, digerbang ApproverRoute (COO dan CEO).
export const ApprovalRoutes = (
  <Route element={<ApproverRoute />}>
    <Route path="/persetujuan" element={<ApprovalPage />} />
  </Route>
)
