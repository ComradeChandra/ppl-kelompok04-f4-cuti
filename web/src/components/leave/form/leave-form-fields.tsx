import { DateField } from '../../atoms/date-field'
import { FieldError } from '../../atoms/field-error'
import { FieldLabel } from '../../atoms/field-label'
import { ReadOnlyField } from '../../atoms/read-only-field'
import { TextAreaField } from '../../atoms/text-area-field'
import { SegmentedControl } from '../../molecules/segmented-control'
import { LEAVE_TYPE_LABEL, LEAVE_TYPES } from '../../../lib/leave-labels'
import { useSession } from '../../../lib/session'
import type { LeaveType } from '../../../types/leave'
import { AttachmentField } from './attachment-field'
import { BalanceField } from './balance-field'
import { DaysField } from './days-field'
import { REASON_MAX, type FieldKey } from './form-check'
import { LEAVE_TYPE_RULES } from './leave-type-rules'
import type { LeaveForm } from './use-leave-form'

const TYPE_OPTIONS = LEAVE_TYPES.map((t) => ({ value: t, label: LEAVE_TYPE_LABEL[t] }))

/** Isian formulir UI-K04-02. Terkunci saat draf tersimpan belum dibuka untuk diubah atau saat mengirim. */
export function LeaveFormFields({ form, locked }: { form: LeaveForm; locked: boolean }) {
  const { account } = useSession()
  const { values, update, errors, draft } = form
  const has = (field: FieldKey) => field in errors
  const describedBy = (field: FieldKey) => (errors[field] ? `${field}-error` : undefined)
  const attachmentLabel = LEAVE_TYPE_RULES[values.leaveType].attachmentLabel

  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel id="requester-label">Pemohon</FieldLabel>
        <ReadOnlyField hint="Hanya baca" labelledBy="requester-label">
          {account.name} · ID karyawan {account.employeeId}
        </ReadOnlyField>
      </div>

      <div>
        <FieldLabel id="type-label" required>
          Jenis cuti
        </FieldLabel>
        <SegmentedControl
          options={TYPE_OPTIONS}
          value={values.leaveType}
          onChange={(v) => update('leaveType', v as LeaveType)}
          labelledBy="type-label"
          disabled={locked}
          error={has('leaveType')}
        />
        <FieldError id="leaveType-error" message={errors.leaveType} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="start-date" required>
            Tanggal mulai
          </FieldLabel>
          <DateField id="start-date" value={values.startDate} onChange={(v) => update('startDate', v)} disabled={locked} error={has('startDate')} aria-describedby={describedBy('startDate')} />
          <FieldError id="startDate-error" message={errors.startDate} />
        </div>
        <div>
          <FieldLabel htmlFor="end-date" required>
            Tanggal akhir
          </FieldLabel>
          <DateField id="end-date" value={values.endDate} onChange={(v) => update('endDate', v)} disabled={locked} error={has('endDate')} aria-describedby={describedBy('endDate')} />
          <FieldError id="endDate-error" message={errors.endDate} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DaysField values={values} draft={draft} />
        <div>
          <BalanceField leaveType={values.leaveType} startDate={values.startDate} error={has('balance')} />
          <FieldError id="balance-error" message={errors.balance} />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="reason" required>
          Alasan
        </FieldLabel>
        <TextAreaField
          id="reason"
          value={values.reason}
          onChange={(v) => update('reason', v)}
          maxLength={REASON_MAX}
          disabled={locked}
          error={has('reason')}
          aria-describedby={describedBy('reason')}
          footer={<FieldError id="reason-error" message={errors.reason} />}
        />
      </div>

      {attachmentLabel && (
        <div>
          <AttachmentField
            label={attachmentLabel}
            attachments={values.attachments}
            onChange={(next) => update('attachments', next)}
            onReject={(message) => form.setErrors((e) => ({ ...e, attachment: message }))}
            disabled={locked}
            error={has('attachment')}
          />
          <FieldError id="attachment-error" message={errors.attachment} />
        </div>
      )}
    </div>
  )
}
