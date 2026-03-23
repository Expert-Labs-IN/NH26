import type { PriorityTag } from '../types';
import { cn } from '../utils/helpers';

interface PriorityBadgeProps {
  priority: PriorityTag;
  size?: 'sm' | 'md';
  className?: string;
}

const CONFIG: Record<PriorityTag, { label: string; classes: string; dot: string }> = {
  'Urgent': {
    label: 'Urgent',
    classes: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
  'Requires Action': {
    label: 'Action',
    classes: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  'FYI': {
    label: 'FYI',
    classes: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
};

export default function PriorityBadge({ priority, size = 'sm', className }: PriorityBadgeProps) {
  const { label, classes, dot } = CONFIG[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        classes,
        className
      )}
      aria-label={`Priority: ${priority}`}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      {label}
    </span>
  );
}
