import type { ReactNode } from 'react'

export function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="min-h-screen text-zinc-900">{children}</div>
}
