import { CalendarRange } from 'lucide-react'
import type { Document, TimelineEvent } from '../types'
import { docTypeLabel, formatFieldLabel, riskBadge } from '../lib/utils'
import { EmptyState } from './shared/EmptyState'
import { SectionHeader } from './shared/SectionHeader'
import { StatusBadge } from './shared/StatusBadge'

interface Props {
  events: TimelineEvent[]
  documents: Document[]
}

const DOC_TYPE_COLORS: Record<string, string> = {
  CONTRACT: 'bg-blue-500',
  PURCHASE_ORDER: 'bg-indigo-500',
  INVOICE: 'bg-amber-500',
  GOODS_RECEIPT_NOTE: 'bg-emerald-500',
  APPROVAL_NOTE: 'bg-cyan-500',
  PAYMENT_CONFIRMATION: 'bg-red-500',
  PURCHASE_REQUISITION: 'bg-purple-500',
  QUARTERLY_REPORT: 'bg-slate-500',
  OTHER: 'bg-zinc-400',
}

export default function TimelineView({ events, documents }: Props) {
  const docsById = Object.fromEntries(documents.map((document) => [document.id, document]))

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarRange className="h-6 w-6" />}
        title="No datable events were extracted"
        description="Timeline reconstruction needs parsed date fields from the uploaded documents."
      />
    )
  }

  return (
    <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8">
      <SectionHeader
        title="Timeline"
        description="Chronological event view reconstructed from extracted date fields."
        icon={<CalendarRange className="h-5 w-5 text-zinc-600" />}
        count={events.length}
      />

      <div className="relative mt-8">
        <div className="absolute left-3 top-0 h-full w-px bg-zinc-200" />
        <div className="space-y-6 pl-10">
          {events.map((event, index) => {
            const document = docsById[event.doc_id]
            const risk = document ? riskBadge(document.risk_level) : null
            const dotColor = DOC_TYPE_COLORS[event.doc_type] || DOC_TYPE_COLORS.OTHER

            return (
              <article key={`${event.doc_id}-${event.field}-${index}`} className="relative">
                <div className={`absolute -left-9 top-3 h-4 w-4 rounded-full border-4 border-white ${dotColor}`} />
                <div className="rounded-[28px] border border-zinc-200 bg-zinc-50/80 p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge type="info">{event.date}</StatusBadge>
                        <StatusBadge type="neutral">{docTypeLabel(event.doc_type)}</StatusBadge>
                        {risk ? <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${risk.classes}`}>{risk.text}</span> : null}
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-zinc-900">{event.event_type}</h3>
                      <p className="mt-2 text-sm text-zinc-600">
                        {event.filename} · source field {formatFieldLabel(event.field)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
