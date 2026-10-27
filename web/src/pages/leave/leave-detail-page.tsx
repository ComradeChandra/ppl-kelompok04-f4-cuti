import { useParams } from 'react-router'
import { Badge } from '../../components/atoms/badge'
import { AccessDenied } from '../../components/error/access-denied'
import { DetailActions } from '../../components/leave/detail/detail-actions'
import { LeaveSummaryCard } from '../../components/leave/detail/leave-summary-card'
import { StatusCard } from '../../components/leave/detail/status-card'
import { PageHeading } from '../../components/organisms/page-heading'
import { StatePanel } from '../../components/organisms/state-panel'
import { LinkButton } from '../../components/atoms/link-button'
import { ApiError, errorMessage } from '../../lib/api'
import { getLeaveRequest } from '../../lib/leave-api'
import { STATUS_LABEL, STATUS_TONE } from '../../lib/leave-labels'
import { useAsync } from '../../lib/use-async'

/** UI-K04-04 Detail pengajuan cuti: ringkasan dan linimasa persetujuan COO lalu CEO. */
export default function LeaveDetailPage() {
  const { leaveRequestId = '' } = useParams()
  const request = useAsync(() => getLeaveRequest(leaveRequestId), [leaveRequestId])
  const r = request.data
  const denied = request.error instanceof ApiError && request.error.status === 403

  return (
    <>
      <PageHeading
        title="Detail pengajuan cuti"
        crumbs={[{ label: 'Cuti', to: '/cuti' }, { label: 'Detail pengajuan' }]}
        action={r && <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>}
      />
      {denied && <AccessDenied />}
      {request.error && !denied ? (
        <StatePanel
          title={errorMessage(request.error, 'Pengajuan belum dapat dimuat.')}
          action={<LinkButton to="/cuti">‹ Kembali ke Cuti</LinkButton>}
        />
      ) : null}
      {r && (
        <>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <LeaveSummaryCard request={r} />
            <StatusCard request={r} />
          </div>
          <DetailActions request={r} onChanged={request.reload} />
        </>
      )}
    </>
  )
}
