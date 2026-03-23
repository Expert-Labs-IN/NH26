import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Clock, AlertTriangle } from 'lucide-react';
import type { DecisionRecommendation, DecisionChoice } from '../types';
import { cn } from '../utils/helpers';

interface DecisionSimulatorProps {
  recommendation: DecisionRecommendation;
}

const CHOICE_CONFIG: Record<DecisionChoice, {
  icon: typeof ThumbsUp;
  label: string;
  badgeCls: string;
  cardCls: string;
  borderCls: string;
}> = {
  yes: {
    icon: ThumbsUp,
    label: 'Yes — Proceed',
    badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    cardCls: 'bg-emerald-50 dark:bg-emerald-900/10',
    borderCls: 'border-emerald-200 dark:border-emerald-800',
  },
  no: {
    icon: ThumbsDown,
    label: 'No — Decline',
    badgeCls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    cardCls: 'bg-red-50 dark:bg-red-900/10',
    borderCls: 'border-red-200 dark:border-red-800',
  },
  defer: {
    icon: Clock,
    label: 'Defer — Handle Later',
    badgeCls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    cardCls: 'bg-amber-50 dark:bg-amber-900/10',
    borderCls: 'border-amber-200 dark:border-amber-800',
  },
};

export default function DecisionSimulator({ recommendation }: DecisionSimulatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Guard: live AI results may not have this field; render nothing until populated
  if (!recommendation) return null;

  const cfg = CHOICE_CONFIG[recommendation.recommendation];
  const ChoiceIcon = cfg.icon;
  const confidencePct = Math.round(recommendation.confidence * 100);

  return (
    <section
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden animate-slide-up shadow-sm"
      aria-label="AI Decision Simulator"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI Decision Advisor</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">AI-powered yes/no recommendation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', cfg.badgeCls)}>
            {cfg.label}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* The question */}
          <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg px-4 py-3 border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Key Decision</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
              {recommendation.question}
            </p>
          </div>

          {/* AI Recommendation card */}
          <div className={cn('rounded-xl border p-4', cfg.cardCls, cfg.borderCls)}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', cfg.badgeCls)}>
                <ChoiceIcon className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">AI Recommendation</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{cfg.label}</p>
              </div>
              {/* Confidence */}
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500">Confidence</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{confidencePct}%</p>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${confidencePct}%` }}
              />
            </div>

            {/* Reasoning */}
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Why the AI recommends this:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {recommendation.reasoning}
                </p>
              </div>
            </div>
          </div>

          {/* Alternative risk */}
          <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">If you choose the opposite:</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {recommendation.alternativeRisk}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
