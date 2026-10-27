import type { TimelineStep } from '../../types/ui'
import { IconCheck, IconClose } from '../atoms/icons'

const DOT: Record<TimelineStep['state'], string> = {
  done: 'border-success-ink bg-success-ink text-white',
  failed: 'border-danger bg-danger text-white',
  current: 'border-warning-ink bg-white',
  todo: 'border-line-strong bg-white',
}

/** Linimasa vertikal; tiap langkah bertitik hijau (selesai), merah (gagal), cokelat (berjalan), atau abu. */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && <span aria-hidden className="absolute top-6 bottom-1 left-[9px] w-0.5 bg-line" />}
          <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 ${DOT[step.state]}`}>
            {step.state === 'done' && <IconCheck size={12} strokeWidth={3} />}
            {step.state === 'failed' && <IconClose size={12} strokeWidth={3} />}
          </span>
          <div className={step.state === 'todo' ? 'text-ink-faint' : ''}>
            <p className="text-sm font-semibold">{step.title}</p>
            {step.note && <p className="mt-0.5 text-xs text-ink-muted">{step.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
