'use client'

import { useState } from 'react'
import { Mail, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { InboxList } from '@/components/inbox-list'
import { ThreadDetail } from '@/components/thread-detail'
import { ActionCards } from '@/components/action-cards'
import { mockThreads } from '@/data/emails'
import { AnalysisSummary, ReplyAction, CalendarAction, TaskAction } from '@/types'

export default function InboxPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(mockThreads[0]?.id ?? null)
  const [searchQuery, setSearchQuery] = useState('')

  const [analyses, setAnalyses] = useState<Record<string, { data: AnalysisSummary | null; loading: boolean; error: string | null }>>({})
  const [actionsMap, setActionsMap] = useState<Record<string, (ReplyAction | CalendarAction | TaskAction)[]>>({})
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({})
  const [regeneratingId, setRegeneratingId] = useState<string | undefined>()

  const selectedThread = mockThreads.find((t) => t.id === selectedThreadId) ?? null

  const handleAnalyze = async () => {
    if (!selectedThreadId) return

    setAnalyses((prev) => ({
      ...prev,
      [selectedThreadId]: { data: null, loading: true, error: null },
    }))
    setActionsLoading((prev) => ({ ...prev, [selectedThreadId]: true }))

    try {
      const [analysisRes, actionsRes] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId: selectedThreadId }),
        }),
        fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId: selectedThreadId }),
        }),
      ])

      if (!analysisRes.ok) {
        const err = await analysisRes.json()
        throw new Error(err.error ?? 'Analysis failed')
      }
      if (!actionsRes.ok) {
        const err = await actionsRes.json()
        throw new Error(err.error ?? 'Actions failed')
      }

      const analysis: AnalysisSummary = await analysisRes.json()
      const actions: (ReplyAction | CalendarAction | TaskAction)[] = await actionsRes.json()

      setAnalyses((prev) => ({
        ...prev,
        [selectedThreadId]: { data: analysis, loading: false, error: null },
      }))
      setActionsMap((prev) => ({ ...prev, [selectedThreadId]: actions }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setAnalyses((prev) => ({
        ...prev,
        [selectedThreadId]: { data: null, loading: false, error: message },
      }))
    } finally {
      setActionsLoading((prev) => ({ ...prev, [selectedThreadId]: false }))
    }
  }

  const handleApprove = (actionId: string) => {
    if (!selectedThreadId) return
    setActionsMap((prev) => ({
      ...prev,
      [selectedThreadId]: prev[selectedThreadId]?.map((a) =>
        a.id === actionId ? { ...a, status: 'approved' as const } : a
      ) ?? [],
    }))
  }

  const handleDiscard = (actionId: string) => {
    if (!selectedThreadId) return
    setActionsMap((prev) => ({
      ...prev,
      [selectedThreadId]: prev[selectedThreadId]?.map((a) =>
        a.id === actionId ? { ...a, status: 'discarded' as const } : a
      ) ?? [],
    }))
  }

  const handleRegenerate = async (actionId: string) => {
    if (!selectedThreadId) return
    const actions = actionsMap[selectedThreadId] ?? []
    const action = actions.find((a) => a.id === actionId)
    if (!action) return

    setRegeneratingId(actionId)
    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: selectedThreadId, actionType: action.type }),
      })

      if (!res.ok) throw new Error('Regeneration failed')
      const updated = await res.json()

      setActionsMap((prev) => ({
        ...prev,
        [selectedThreadId]: prev[selectedThreadId]?.map((a) =>
          a.id === actionId ? { ...updated, id: actionId } : a
        ) ?? [],
      }))
    } catch {
      // silently fail — keep existing action
    } finally {
      setRegeneratingId(undefined)
    }
  }

  const currentAnalysis = selectedThreadId ? (analyses[selectedThreadId] ?? null) : null
  const currentActions = selectedThreadId ? (actionsMap[selectedThreadId] ?? []) : []

  return (
    <main className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Triage</h1>
            <p className="text-sm text-muted-foreground">AI-powered inbox · Groq LLM</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex flex-col border-r border-border">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <InboxList
              threads={mockThreads}
              selectedId={selectedThreadId}
              onSelectThread={setSelectedThreadId}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              <div className="flex-1 overflow-y-auto">
                <ThreadDetail
                  thread={selectedThread}
                  analysis={currentAnalysis?.data ?? null}
                  loading={currentAnalysis?.loading ?? false}
                  error={currentAnalysis?.error ?? null}
                  onAnalyze={handleAnalyze}
                />
              </div>
              {currentActions.length > 0 && (
                <div className="border-t border-border overflow-y-auto max-h-96">
                  <ActionCards
                    actions={currentActions}
                    onApprove={handleApprove}
                    onDiscard={handleDiscard}
                    onRegenerate={handleRegenerate}
                    regeneratingId={regeneratingId}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Select an email to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
