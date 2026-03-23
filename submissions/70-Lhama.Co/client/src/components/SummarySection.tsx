import { Sparkles } from 'lucide-react';
import { cn } from '../utils/helpers';

interface SummarySectionProps {
  summary: string[];
  confidence: number;
  source: 'ollama' | 'groq' | 'cache';
}

const SOURCE_LABEL: Record<string, string> = {
  ollama: 'Local AI',
  groq: 'Groq Cloud',
  cache: 'Cached',
};

const CONFIDENCE_COLOR = (pct: number) => {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

export default function SummarySection({ summary, confidence, source }: SummarySectionProps) {
  const confidencePct = Math.round(confidence * 100);

  return (
    <section
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 animate-slide-up"
      aria-label="AI-generated summary"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h3 className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
            AI Summary
          </h3>
        </div>
        <span className="text-xs text-blue-400 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
          {SOURCE_LABEL[source] ?? source}
        </span>
      </div>

      {/* Bullets */}
      <ul className="space-y-2 mb-4" role="list">
        {summary.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="flex-shrink-0 w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold mt-0.5"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{point}</p>
          </li>
        ))}
      </ul>

      {/* Confidence bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            AI Confidence
          </span>
          <span className={cn(
            'text-xs font-bold',
            confidencePct >= 80 ? 'text-green-600 dark:text-green-400' :
            confidencePct >= 60 ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
          )}>
            {confidencePct}%
          </span>
        </div>
        <div
          className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={confidencePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence: ${confidencePct}%`}
        >
          <div
            className={cn('h-full rounded-full transition-all duration-700', CONFIDENCE_COLOR(confidencePct))}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>
    </section>
  );
}
