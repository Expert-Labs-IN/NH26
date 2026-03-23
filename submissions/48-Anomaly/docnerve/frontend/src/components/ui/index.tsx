import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Button({
  className,
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost'
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'default' && 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800',
        variant === 'outline' && 'border-zinc-200 bg-white/90 text-zinc-700 hover:bg-zinc-50',
        variant === 'ghost' && 'border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100',
        className,
      )}
      {...props}
    />
  )
}

export function Progress({
  className,
  value = 0,
}: HTMLAttributes<HTMLDivElement> & {
  value?: number
}) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-zinc-200/80', className)}>
      <div
        className="h-full rounded-full bg-zinc-900 transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function Tabs({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('inline-flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white/80 p-2', className)}>
      {children}
    </div>
  )
}

export function TabsButton({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}) {
  return (
    <button
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
        active ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        className,
      )}
      {...props}
    />
  )
}

export function MetricCard({
  label,
  value,
  helper,
  tone = 'neutral',
  icon,
}: {
  label: string
  value: ReactNode
  helper?: string
  tone?: 'neutral' | 'danger' | 'warning' | 'success' | 'info'
  icon?: ReactNode
}) {
  const toneMap: Record<string, string> = {
    neutral: 'border-zinc-200 bg-white/85',
    danger: 'border-red-200 bg-red-50/85',
    warning: 'border-amber-200 bg-amber-50/85',
    success: 'border-emerald-200 bg-emerald-50/85',
    info: 'border-blue-200 bg-blue-50/85',
  }

  return (
    <div className={cn('rounded-2xl border p-4 shadow-sm', toneMap[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
          {helper ? <p className="mt-1 text-xs text-zinc-500">{helper}</p> : null}
        </div>
        {icon ? <div className="rounded-xl bg-white/80 p-2 text-zinc-700">{icon}</div> : null}
      </div>
    </div>
  )
}
