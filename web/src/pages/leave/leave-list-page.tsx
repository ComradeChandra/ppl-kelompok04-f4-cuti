import { useState } from 'react'
import { LinkButton } from '../../components/atoms/link-button'
import { IconPlus } from '../../components/atoms/icons'
import { BalanceSummary } from '../../components/leave/list/balance-summary'
import { LeaveRequestTable } from '../../components/leave/list/leave-request-table'
import { RequestFilters } from '../../components/leave/list/request-filters'
import { Card } from '../../components/organisms/card'
import { PageHeading } from '../../components/organisms/page-heading'
import { errorMessage } from '../../lib/api'
import { getLeaveBalance, listLeaveRequests } from '../../lib/leave-api'
import { useSession } from '../../lib/session'
import { useAsync } from '../../lib/use-async'
import type { LeaveStatus } from '../../types/leave'

/** UI-K04-01 Daftar cuti dan saldo milik akun yang masuk. */
export default function LeaveListPage() {
  const { account, today } = useSession()
  const thisYear = Number(today.slice(0, 4))
  const [year, setYear] = useState(String(thisYear))
  const [status, setStatus] = useState('')

  const balance = useAsync(() => getLeaveBalance(account.employeeId, year), [year])
  const requests = useAsync(
    () => listLeaveRequests({ scope: 'mine', year, status: status as LeaveStatus | '' }),
    [year, status],
  )

  return (
    <>
      <PageHeading
        title="Cuti"
        subtitle="Daftar cuti dan saldo"
        action={
          <LinkButton to="/cuti/ajukan" variant="primary">
            <IconPlus size={14} /> Ajukan cuti
          </LinkButton>
        }
      />
      <BalanceSummary
        balance={balance.data}
        failure={balance.error ? errorMessage(balance.error, 'Saldo belum dapat dimuat.') : null}
        year={year}
      />
      <Card
        title="Pengajuan saya"
        action={
          <RequestFilters
            years={[thisYear - 1, thisYear, thisYear + 1]}
            year={year}
            status={status}
            onYear={setYear}
            onStatus={setStatus}
          />
        }
      >
        <div className="mt-5">
          <LeaveRequestTable
            items={requests.data}
            failure={requests.error ? errorMessage(requests.error, 'Daftar pengajuan belum dapat dimuat.') : null}
            filtered={status !== ''}
          />
        </div>
      </Card>
    </>
  )
}
