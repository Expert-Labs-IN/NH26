import type { DetectedTaskType } from '../types';
import { Calendar, Clock, CreditCard, CornerDownRight, Minus } from 'lucide-react';
import { cn } from '../utils/helpers';

interface TaskDetectionBadgeProps {
  detectedTaskType: DetectedTaskType;
}

const TASK_CONFIG = {
  meeting: {
    icon: Calendar,
    label: 'Meeting Detected',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  },
  deadline: {
    icon: Clock,
    label: 'Deadline Detected',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800',
  },
  payment: {
    icon: CreditCard,
    label: 'Payment / Invoice',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  },
  'follow-up': {
    icon: CornerDownRight,
    label: 'Follow-Up Request',
    cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  },
  none: {
    icon: Minus,
    label: 'No Task Detected',
    cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  },
} as const;

export default function TaskDetectionBadge({ detectedTaskType }: TaskDetectionBadgeProps) {
  const cfg = TASK_CONFIG[detectedTaskType];
  const IconComponent = cfg.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold animate-slide-up',
        cfg.cls,
      )}
      aria-label={`Auto-detected task type: ${cfg.label}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {cfg.label}
    </div>
  );
}
