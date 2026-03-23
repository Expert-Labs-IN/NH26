import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function StatusBadge({
  type,
  children,
  className,
}: {
  type: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: ReactNode
  className?: string
}) {
  const colorMap = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    neutral: 'border-zinc-200 bg-white text-zinc-700',
  }

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', colorMap[type], className)}>
      {children}
    </span>
  )
}
