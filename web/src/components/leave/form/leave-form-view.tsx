import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../atoms/button'
import { PageHeading } from '../../organisms/page-heading'
import { DraftList } from './draft-list'
import { DraftStatus } from './draft-status'
import { LeaveFormFields } from './leave-form-fields'
import { LEAVE_TYPE_RULES } from './leave-type-rules'
import { RulesCard } from './rules-card'
import { SubmitConfirmModal } from './submit-confirm-modal'
import { useLeaveForm } from './use-leave-form'
import { useLeaveFormActions } from './use-leave-form-actions'

/** Kerangka UI-K04-02: judul dan status draf, kartu formulir, ketentuan, dan daftar draf. */
export function LeaveFormView({ draftId }: { draftId: string | null }) {
  const navigate = useNavigate()
  const form = useLeaveForm(draftId)
  const actions = useLeaveFormActions(form)
  const [confirming, setConfirming] = useState(false)
  const { mode, values } = form
  // Isian terkunci selama draf belum dibuka untuk diubah, dan selama menunggu respons (board "Sedang mengirim").
  const locked = mode === 'view' || mode === 'loading' || actions.busy
  const variant = LEAVE_TYPE_RULES[values.leaveType].variant

  function onSend() {
    // Draf terkunci sudah lolos pemeriksaan saat disimpan; layanan tetap memeriksa ulang saat dikirim.
    if (mode !== 'view' && !actions.validate()) return
    setConfirming(true)
  }

  function onConfirm() {
    setConfirming(false)
    actions.submit()
  }

  function onCancel() {
    if (mode === 'edit') form.cancelEdit()
    else navigate('/cuti')
  }

  return (
    <>
      <PageHeading
        title="Ajukan cuti"
        crumbs={[{ label: 'Cuti', to: '/cuti' }, { label: variant ? `Ajukan cuti · varian: ${variant}` : 'Ajukan cuti' }]}
        action={<DraftStatus mode={mode} onEdit={form.startEdit} />}
      />
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-card border border-line bg-white p-6 shadow-card sm:p-8 lg:col-span-8">
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <LeaveFormFields form={form} locked={locked} />
            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-line-faint pt-5">
              <Button variant="tertiary" onClick={onCancel} disabled={actions.busy}>
                Batal
              </Button>
              <Button
                onClick={actions.saveDraft}
                disabled={mode === 'view' || mode === 'loading'}
                loading={actions.pending === 'save'}
                loadingLabel="Menyimpan..."
              >
                Simpan draf
              </Button>
              <Button
                variant="primary"
                onClick={onSend}
                disabled={mode === 'loading' || actions.pending === 'save'}
                loading={actions.pending === 'submit'}
                loadingLabel="Mengirim..."
                className="px-7"
              >
                Kirim
              </Button>
            </div>
          </form>
        </section>
        <aside className="flex flex-col gap-6 lg:col-span-4">
          <RulesCard leaveType={values.leaveType} />
          <DraftList activeId={form.draft?.leaveRequestId ?? null} version={form.version} />
        </aside>
      </div>
      {confirming && <SubmitConfirmModal values={values} onConfirm={onConfirm} onCancel={() => setConfirming(false)} />}
    </>
  )
}
