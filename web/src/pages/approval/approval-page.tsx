import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ApprovalPanel } from '../../components/approval/approval-panel'
import { ApprovalQueue } from '../../components/approval/approval-queue'
import { Card } from '../../components/organisms/card'
import { PageHeading } from '../../components/organisms/page-heading'
import { StatePanel } from '../../components/organisms/state-panel'
import { errorMessage } from '../../lib/api'
import { getLeaveRequest, listLeaveRequests } from '../../lib/leave-api'
import { useSession } from '../../lib/session'
import { useAsync } from '../../lib/use-async'

/** UI-K04-03 Persetujuan cuti: antrean COO atau CEO dan rincian pengajuan yang dipilih. */
export default function ApprovalPage() {
  const { account, today } = useSession()
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [chosenId, setChosenId] = useState<string | null>(null)

  const queue = useAsync(() => listLeaveRequests({ scope: 'approval', year: today.slice(0, 4) }), [version])
  const items = queue.data ?? []
  const selectedId = items.some((r) => r.leaveRequestId === chosenId) ? chosenId : (items[0]?.leaveRequestId ?? null)
  const detail = useAsync(() => (selectedId ? getLeaveRequest(selectedId) : Promise.resolve(null)), [selectedId, version])

  function onDecided() {
    setChosenId(null)
    setVersion((n) => n + 1)
    // Lokasi baru membuat jumlah antrean di sidebar dihitung ulang.
    navigate('/persetujuan', { replace: true })
  }

  return (
    <>
      <PageHeading
        title="Persetujuan cuti"
        subtitle={`Antrean ${account.role} · ${items.length} pengajuan menunggu keputusan Anda · urut tanggal mulai terdekat`}
      />
      {queue.error ? (
        <StatePanel title={errorMessage(queue.error, 'Antrean belum dapat dimuat.')} />
      ) : queue.data && items.length === 0 ? (
        <StatePanel
          title="Tidak ada pengajuan yang menunggu keputusan Anda."
          description="Pengajuan baru akan tampil di sini, diurutkan dari tanggal mulai terdekat."
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ApprovalQueue items={items} selectedId={selectedId} onSelect={setChosenId} />
          {detail.data && detail.data.leaveRequestId === selectedId ? (
            <ApprovalPanel key={selectedId} request={detail.data} onDecided={onDecided} />
          ) : (
            <Card className="p-6">
              <p className="text-sm text-ink-muted">{selectedId ? 'Memuat...' : 'Pilih pengajuan dari antrean.'}</p>
            </Card>
          )}
        </div>
      )}
    </>
  )
}
