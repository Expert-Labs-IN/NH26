import { Download, Eye, FileText, Sparkles } from 'lucide-react'
import { getReportDownloadUrl } from '../api/client'
import { docTypeLabel, riskBadge, trustScoreColor } from '../lib/utils'
import { StatusBadge } from './shared/StatusBadge'
import { Button, Tabs, TabsButton } from './ui'
import type { ActiveView, AnalysisResult, Document } from '../types'

interface SidebarProps {
  jobId: string
  result: AnalysisResult
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  onDocSelect: (doc: Document | null) => void
  selectedDoc: Document | null
}

export default function Sidebar({
  jobId,
  result,
  activeView,
  onViewChange,
  onDocSelect,
  selectedDoc,
}: SidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <section className="rounded-[28px] border border-zinc-200 bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Investigation Snapshot</p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">Current view</h2>
          </div>
          <StatusBadge type="info">{activeView}</StatusBadge>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Highest risk signal</p>
            <p className="mt-2 text-sm font-medium text-zinc-900">
              {result.summary.high_risk_documents > 0
                ? `${result.summary.high_risk_documents} high-risk document${result.summary.high_risk_documents === 1 ? '' : 's'}`
                : 'No high-risk documents'}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Evidence linked</p>
            <p className="mt-2 text-sm font-medium text-zinc-900">
              {Object.keys(result.doc_graph?.po_groups || {}).length} PO groups · {Object.keys(result.doc_graph?.vendor_groups || {}).length} vendor groups
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">View Switcher</p>
          <Tabs className="w-full">
            {(['findings', 'timeline', 'documents'] as ActiveView[]).map((view) => (
              <TabsButton
                key={view}
                active={activeView === view}
                className="flex-1"
                onClick={() => onViewChange(view)}
              >
                {view}
              </TabsButton>
            ))}
          </Tabs>
        </div>

        <a href={getReportDownloadUrl(jobId)} download className="mt-5 block">
          <Button className="w-full" variant="outline">
            <Download className="h-4 w-4" />
            Export report
          </Button>
        </a>
      </section>

      <section className="rounded-[28px] border border-zinc-200 bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Documents</p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">Evidence inventory</h2>
          </div>
          <StatusBadge type="neutral">{result.documents.length}</StatusBadge>
        </div>

        <div className="mt-5 space-y-3">
          {result.documents.map((document) => {
            const risk = riskBadge(document.risk_level)
            const isSelected = selectedDoc?.id === document.id
            return (
              <button
                key={document.id}
                type="button"
                onClick={() => {
                  onDocSelect(document)
                  onViewChange('documents')
                }}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                      <p className="truncate text-sm font-medium text-zinc-900">{document.filename}</p>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{docTypeLabel(document.doc_type)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${trustScoreColor(document.trust_score)}`}>{document.trust_score}</p>
                    <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${risk.classes}`}>
                      {risk.text}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>{document.trust_signals.length} risk signals</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    Open
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-zinc-200 bg-white/90 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-zinc-600" />
          <h2 className="text-lg font-semibold text-zinc-900">DocNerve focus</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          The UI now tracks the real backend contract: cross-document findings, missing procurement evidence, ghost entities,
          trust scoring, and report export from the active FastAPI job.
        </p>
      </section>
    </aside>
  )
}
