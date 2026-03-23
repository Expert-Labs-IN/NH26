import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

export function Navbar({
  subtitle,
  actions,
}: {
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-800">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">DocNerve</p>
            <p className="text-sm text-zinc-600">{subtitle || 'Forensic document auditor'}</p>
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
