import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function SectionHeader({
  title,
  description,
  icon,
  count,
  countTone,
}: {
  title: string
  description?: string
  icon?: ReactNode
  count?: number
  countTone?: string
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>
        </div>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {typeof count === 'number' ? (
        <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', countTone || 'border-zinc-200 bg-white text-zinc-700')}>
          {count}
        </span>
      ) : null}
    </div>
  )
}
