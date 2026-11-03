import { Link } from 'react-router'
import { LinkButton } from '../../atoms/link-button'
import { IconPlus } from '../../atoms/icons'
import { Card } from '../../organisms/card'
import { formatRange } from '../../../lib/format-date'
import { LEAVE_TYPE_LABEL } from '../../../lib/leave-labels'
import { listLeaveRequests } from '../../../lib/leave-api'
import { useSession } from '../../../lib/session'
import { useAsync } from '../../../lib/use-async'

type DraftListProps = {
  activeId: string | null
  version: number
}

/** Daftar draf milik akun ini pada tahun berjalan; draf yang sedang dibuka ditandai. */
export function DraftList({ activeId, version }: DraftListProps) {
  const { today } = useSession()
  const drafts = useAsync(() => listLeaveRequests({ scope: 'mine', year: today.slice(0, 4), status: 'DRAFT' }), [version])
  const items = drafts.data ?? []

  return (
    <Card title="Draf saya">
      <div className="flex flex-col gap-2 px-6 pt-3 pb-6">
        {items.length === 0 && <p className="text-xs text-ink-muted">Belum ada draf.</p>}
        {items.map((d) => (
          <Link
            key={d.leaveRequestId}
            to={`/cuti/ajukan?draf=${d.leaveRequestId}`}
            aria-current={d.leaveRequestId === activeId ? 'page' : undefined}
            className={`rounded-lg border px-3 py-2 text-xs hover:bg-field ${
              d.leaveRequestId === activeId ? 'border-navy bg-field' : 'border-line'
            }`}
          >
            <span className="font-semibold">{LEAVE_TYPE_LABEL[d.leaveType]}</span> · {formatRange(d.startDate, d.endDate)}
          </Link>
        ))}
        <LinkButton to="/cuti/ajukan" size="sm" className="mt-1 w-full">
          <IconPlus size={14} /> Pengajuan baru
        </LinkButton>
      </div>
    </Card>
  )
}
