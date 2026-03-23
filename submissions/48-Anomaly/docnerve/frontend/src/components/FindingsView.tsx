import { Ghost, Link2, ShieldAlert, Sparkles } from 'lucide-react'
import type { Contradiction, Document, GhostEntity, MissingChain } from '../types'
import {
  docTypeLabel,
  formatCurrency,
  formatPercent,
  formatSignalLabel,
  formatFieldLabel,
  severityBadgeType,
  severityColor,
  trustScoreColor,
} from '../lib/utils'
import { EmptyState } from './shared/EmptyState'
import { SectionHeader } from './shared/SectionHeader'
import { StatusBadge } from './shared/StatusBadge'

interface Props {
  contradictions: Contradiction[]
  missingChains: MissingChain[]
  ghostEntities: GhostEntity[]
  documents: Document[]
}

export default function FindingsView({
  contradictions,
  missingChains,
  ghostEntities,
  documents,
}: Props) {
  const riskyDocuments = documents
    .filter((document) => document.risk_level !== 'CLEAN' || document.trust_signals.length > 0)
    .sort((left, right) => left.trust_score - right.trust_score)

  if (contradictions.length + missingChains.length + ghostEntities.length === 0 && riskyDocuments.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" />}
        title="No major findings surfaced"
        description="This run did not return contradictions, broken chains, ghost entities, or suspicious trust signals."
      />
    )
  }

  return (
    <div className="space-y-6">
      {contradictions.length > 0 ? (
        <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <SectionHeader
            title="Contradictions"
            description="Cross-document conflicts detected by rules or NLI checks."
            icon={<Sparkles className="h-5 w-5 text-zinc-600" />}
            count={contradictions.length}
            countTone="border-red-200 bg-red-50 text-red-700"
          />
          <div className="space-y-4">
            {contradictions.map((contradiction) => (
              <article key={contradiction.id} className={`rounded-[28px] border p-5 ${severityColor(contradiction.severity)}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge type={severityBadgeType(contradiction.severity)}>{contradiction.severity}</StatusBadge>
                    <StatusBadge type="neutral">{formatFieldLabel(contradiction.type)}</StatusBadge>
                    {contradiction.layer ? <StatusBadge type="info">{contradiction.layer}</StatusBadge> : null}
                  </div>
                  <span className="text-xs font-medium tracking-[0.18em] text-zinc-400">{contradiction.id}</span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <ValuePanel
                    title={contradiction.doc_a.filename}
                    subtitle={docTypeLabel(contradiction.doc_a.type)}
                    field={contradiction.field}
                    value={contradiction.doc_a_value || contradiction.value_1}
                  />
                  <ValuePanel
                    title={contradiction.doc_b.filename}
                    subtitle={docTypeLabel(contradiction.doc_b.type)}
                    field={contradiction.field}
                    value={contradiction.doc_b_value || contradiction.value_2}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
                  {typeof contradiction.difference === 'number' ? (
                    <span>Difference: {formatCurrency(contradiction.difference)}</span>
                  ) : null}
                  {typeof contradiction.difference_pct === 'number' ? (
                    <span>Delta: {formatPercent(contradiction.difference_pct, 1)}</span>
                  ) : null}
                  {contradiction.po_number ? <span>PO: {contradiction.po_number}</span> : null}
                </div>

                {contradiction.explanation ? (
                  <p className="mt-4 text-sm leading-7 text-zinc-700">{contradiction.explanation}</p>
                ) : null}
                {contradiction.recommended_action ? (
                  <div className="mt-4 rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-800">Recommended action:</span> {contradiction.recommended_action}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {missingChains.length > 0 ? (
        <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <SectionHeader
            title="Missing Chains"
            description="Workflow gaps across procurement evidence."
            icon={<Link2 className="h-5 w-5 text-zinc-600" />}
            count={missingChains.length}
            countTone="border-amber-200 bg-amber-50 text-amber-700"
          />
          <div className="space-y-4">
            {missingChains.map((chain) => (
              <article key={chain.id} className={`rounded-[28px] border p-5 ${severityColor(chain.severity)}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge type={severityBadgeType(chain.severity)}>{chain.severity}</StatusBadge>
                    <StatusBadge type="neutral">{formatFieldLabel(chain.type)}</StatusBadge>
                  </div>
                  <span className="text-xs font-medium tracking-[0.18em] text-zinc-400">{chain.id}</span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{chain.explanation || 'Missing chain detected.'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {chain.present_nodes.map((node) => (
                        <span key={node} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          {formatFieldLabel(node)} present
                        </span>
                      ))}
                      {chain.missing_nodes.map((node) => (
                        <span key={node} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          {formatFieldLabel(node)} missing
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white/75 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Amount at risk</p>
                    <p className="mt-2 text-xl font-semibold text-zinc-900">
                      {chain.amount_display || formatCurrency(chain.amount_at_risk)}
                    </p>
                    {chain.trigger_doc_filename ? (
                      <p className="mt-2 text-xs text-zinc-500">Triggered by {chain.trigger_doc_filename}</p>
                    ) : null}
                    {chain.po_number ? <p className="mt-1 text-xs text-zinc-500">PO: {chain.po_number}</p> : null}
                  </div>
                </div>

                {chain.recommended_action ? (
                  <div className="mt-4 rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-800">Recommended action:</span> {chain.recommended_action}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {ghostEntities.length > 0 ? (
        <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <SectionHeader
            title="Ghost Entities"
            description="People or organizations missing from a series where they should likely appear."
            icon={<Ghost className="h-5 w-5 text-zinc-600" />}
            count={ghostEntities.length}
            countTone="border-blue-200 bg-blue-50 text-blue-700"
          />
          <div className="space-y-4">
            {ghostEntities.map((ghost) => (
              <article key={ghost.id} className={`rounded-[28px] border p-5 ${severityColor(ghost.severity)}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge type={severityBadgeType(ghost.severity)}>{ghost.severity}</StatusBadge>
                    {ghost.role ? <StatusBadge type="neutral">{ghost.role}</StatusBadge> : null}
                  </div>
                  <span className="text-xs font-medium tracking-[0.18em] text-zinc-400">
                    {(ghost.suspicion_score * 100).toFixed(0)}% suspicion
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-zinc-900">{ghost.entity}</h3>
                <p className="mt-1 text-sm text-zinc-500">{ghost.series}</p>
                {ghost.explanation ? <p className="mt-4 text-sm leading-7 text-zinc-700">{ghost.explanation}</p> : null}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white/75 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Present in</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ghost.present_filenames.map((filename) => (
                        <span key={filename} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          {filename}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white/75 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Absent from</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ghost.absent_filenames.map((filename) => (
                        <span key={filename} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          {filename}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {riskyDocuments.length > 0 ? (
        <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <SectionHeader
            title="Document Trust Analysis"
            description="Explainable document-level signals that lowered trust."
            icon={<ShieldAlert className="h-5 w-5 text-zinc-600" />}
            count={riskyDocuments.length}
          />
          <div className="space-y-4">
            {riskyDocuments.map((document) => (
              <article key={document.id} className="rounded-[28px] border border-zinc-200 bg-zinc-50/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">{document.filename}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{docTypeLabel(document.doc_type)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-semibold ${trustScoreColor(document.trust_score)}`}>{document.trust_score}/100</p>
                    <p className="text-xs text-zinc-500">{document.risk_level.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {document.trust_signals.map((signal, index) => (
                    <div key={`${document.id}-${index}`} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge type={severityBadgeType(signal.severity || 'MEDIUM')}>
                          {signal.severity || 'Signal'}
                        </StatusBadge>
                        <span className="text-sm font-medium text-zinc-900">{formatSignalLabel(signal)}</span>
                        {typeof signal.impact === 'number' ? (
                          <span className="text-xs text-zinc-500">{signal.impact} pts</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">{signal.detail}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function ValuePanel({
  title,
  subtitle,
  field,
  value,
}: {
  title: string
  subtitle: string
  field: string
  value: unknown
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/75 p-4">
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-400">{formatFieldLabel(field)}</p>
      <p className="mt-2 text-sm font-medium text-zinc-800">{String(value ?? 'Not available')}</p>
    </div>
  )
}
