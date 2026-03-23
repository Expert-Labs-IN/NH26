import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Progress } from '../ui'
import { cn, formatStepLabel } from '../../lib/utils'

const PIPELINE_STEPS = [
  { label: 'Preprocess and parse', ids: ['initializing', 'preprocessing', 'parsing_documents', 'parsing_complete'], threshold: 25 },
  { label: 'Classify and extract', ids: ['classifying_documents', 'classification_complete', 'extracting_fields', 'extraction_complete'], threshold: 50 },
  { label: 'Link graph and detect findings', ids: ['building_graph', 'graph_complete', 'detecting_contradictions', 'contradictions_complete', 'detecting_missing_chains', 'chains_complete', 'detecting_ghost_entities', 'ghosts_complete'], threshold: 78 },
  { label: 'Trust scoring and reasoning', ids: ['scoring_trust', 'scoring_complete', 'generating_reasoning', 'reasoning_complete'], threshold: 93 },
  { label: 'Prepare report', ids: ['generating_report', 'report_complete', 'complete'], threshold: 100 },
]

export function ProcessingScreen({
  progress,
  currentStep,
  fileCount,
}: {
  progress: number
  currentStep?: string | null
  fileCount?: number | null
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-4 py-10 sm:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Investigation Running</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            DocNerve is reading what your documents hide from each other.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
            The backend is live, the pipeline is active, and the result page will update automatically as each stage finishes.
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Current Stage</p>
                <p className="mt-2 text-xl font-semibold text-zinc-900">{formatStepLabel(currentStep)}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Progress</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{progress}%</p>
              </div>
            </div>

            <Progress className="mt-6 h-2.5" value={progress} />

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-500">
              <span>{fileCount ? `${fileCount} documents in queue` : 'Preparing files'}</span>
              <span>Real-time backend polling enabled</span>
            </div>
          </div>
        </section>

        <aside className="rounded-[32px] border border-zinc-200 bg-white/90 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Pipeline Stages</p>
          <div className="mt-6 space-y-4">
            {PIPELINE_STEPS.map((step, index) => {
              const isComplete = progress >= step.threshold
              const isActive = !isComplete && (step.ids.includes(currentStep || '') || index === 0)

              return (
                <div key={step.label} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-900" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-300" />
                    )}
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', isActive || isComplete ? 'text-zinc-900' : 'text-zinc-500')}>
                      {step.label}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {isComplete ? 'Completed' : isActive ? 'In progress' : 'Waiting'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
