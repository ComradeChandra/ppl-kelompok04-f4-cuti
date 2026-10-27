import { Card } from '../../organisms/card'
import { LEAVE_TYPE_LABEL } from '../../../lib/leave-labels'
import type { LeaveType } from '../../../types/leave'
import { LEAVE_TYPE_RULES } from './leave-type-rules'

/** Panel kanan: ketentuan jenis cuti yang sedang dipilih. */
export function RulesCard({ leaveType }: { leaveType: LeaveType }) {
  const rule = LEAVE_TYPE_RULES[leaveType]
  return (
    <Card title={`Ketentuan cuti ${LEAVE_TYPE_LABEL[leaveType].toLowerCase()}`}>
      <ul className="flex list-disc flex-col gap-2 px-6 pt-3 pb-6 pl-10 text-[13px] leading-relaxed text-ink-soft">
        {rule.rules.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      {rule.note && (
        <p className="mx-6 mb-6 rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-[11px] text-ink-muted">
          {rule.note}
        </p>
      )}
    </Card>
  )
}
