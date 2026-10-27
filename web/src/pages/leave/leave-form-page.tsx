import { useSearchParams } from 'react-router'
import { LeaveFormView } from '../../components/leave/form/leave-form-view'

/** UI-K04-02 Form ajukan cuti. ?draf=<leaveRequestId> membuka draf; key memasang ulang formulir saat draf berganti. */
export default function LeaveFormPage() {
  const [params] = useSearchParams()
  const draftId = params.get('draf')
  return <LeaveFormView key={draftId ?? 'new'} draftId={draftId} />
}
