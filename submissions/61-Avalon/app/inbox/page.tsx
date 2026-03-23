'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Mail, Search, ArrowLeft, PenSquare, Loader2, X, Inbox, MessageSquare,
  FileText, Bot, Send, Paperclip, Calendar, CheckSquare, Copy, Check,
  ChevronDown, RefreshCw, Clock, AlertCircle, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ActionCards } from '@/components/action-cards'
import { mockThreads as initialThreads } from '@/data/emails'
import {
  AnalysisSummary, ReplyAction, CalendarAction, TaskAction, Thread,
  EmailCategory, AIChatMessage
} from '@/types'

type PriorityFilter = 'all' | 'urgent' | 'action' | 'fyi'
type CategoryFilter = 'all' | EmailCategory

const LS_ANALYSES_KEY = 'mailmate-analyses'
const LS_ACTIONS_KEY = 'mailmate-actions'

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota errors
  }
}

function PriorityBadge({ priority, small }: { priority: string; small?: boolean }) {
  const config: Record<string, { label: string; bg: string }> = {
    urgent: { label: 'Urgent', bg: 'bg-red-100 text-red-700 border-red-200' },
    action: { label: 'Action', bg: 'bg-amber-100 text-amber-700 border-amber-200' },
    fyi: { label: 'FYI', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
  }
  const c = config[priority] ?? config.fyi
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${c.bg} ${small ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}>
      {c.label}
    </span>
  )
}

function NavIcon({ icon: Icon, label, active }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <button title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
        active ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-800'
      }`}>
      <Icon className="w-5 h-5" />
    </button>
  )
}

function ThreadListItem({ thread, selected, analysis, onClick }: {
  thread: Thread
  selected: boolean
  analysis?: AnalysisSummary | null
  onClick: () => void
}) {
  const priorityDotColor: Record<string, string> = {
    urgent: 'bg-red-500',
    action: 'bg-amber-500',
    fyi: 'bg-blue-500',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
        selected ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
          {thread.from.avatar || thread.from.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm truncate ${thread.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
              {thread.from.name}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {analysis && <span className={`w-2 h-2 rounded-full ${priorityDotColor[analysis.priority] ?? ''}`} />}
              {thread.unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              <span className="text-xs text-gray-400">
                {new Date(thread.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-900 truncate">{thread.subject}</p>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{thread.preview}</p>
        </div>
      </div>
    </button>
  )
}

const categoryTabs: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'primary', label: 'Primary' },
  { key: 'company', label: 'Company' },
  { key: 'promotion', label: 'Promotion' },
  { key: 'social', label: 'Social' },
]

const priorityTabs: { key: PriorityFilter; label: string; dot?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'Urgent', dot: 'bg-red-500' },
  { key: 'action', label: 'Action', dot: 'bg-amber-500' },
  { key: 'fyi', label: 'FYI', dot: 'bg-blue-500' },
]

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const [analyses, setAnalyses] = useState<
    Record<string, { data: AnalysisSummary | null; loading: boolean; error: string | null }>
  >({})
  const [actionsMap, setActionsMap] = useState<
    Record<string, (ReplyAction | CalendarAction | TaskAction)[]>
  >({})
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({})
  const [regeneratingId, setRegeneratingId] = useState<string | undefined>()

  // AI panel state
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Compose modal state
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeSuggestLoading, setComposeSuggestLoading] = useState(false)

  // Load persisted data on mount
  useEffect(() => {
    const savedAnalyses = loadFromStorage<
      Record<string, { data: AnalysisSummary | null; loading: boolean; error: string | null }>
    >(LS_ANALYSES_KEY, {})
    const savedActions = loadFromStorage<
      Record<string, (ReplyAction | CalendarAction | TaskAction)[]>
    >(LS_ACTIONS_KEY, {})
    const restoredAnalyses = Object.fromEntries(
      Object.entries(savedAnalyses).map(([k, v]) => [
        k,
        { ...v, loading: false, error: v.error ?? null },
      ])
    )
    setAnalyses(restoredAnalyses)
    setActionsMap(savedActions)
  }, [])

  // Persist analyses and actions whenever they change
  useEffect(() => {
    if (Object.keys(analyses).length > 0) {
      saveToStorage(LS_ANALYSES_KEY, analyses)
    }
  }, [analyses])

  useEffect(() => {
    if (Object.keys(actionsMap).length > 0) {
      saveToStorage(LS_ACTIONS_KEY, actionsMap)
    }
  }, [actionsMap])

  const selectedThread = threads.find((t) => t.id === selectedThreadId) ?? null

  const handleAnalyze = useCallback(
    async (threadId: string) => {
      if (analyses[threadId]?.data) return

      setAnalyses((prev) => ({
        ...prev,
        [threadId]: { data: null, loading: true, error: null },
      }))
      setActionsLoading((prev) => ({ ...prev, [threadId]: true }))

      try {
        const [analysisRes, actionsRes] = await Promise.all([
          fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId }),
          }),
          fetch('/api/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId }),
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
          [threadId]: { data: analysis, loading: false, error: null },
        }))
        setActionsMap((prev) => ({ ...prev, [threadId]: actions }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setAnalyses((prev) => ({
          ...prev,
          [threadId]: { data: null, loading: false, error: message },
        }))
      } finally {
        setActionsLoading((prev) => ({ ...prev, [threadId]: false }))
      }
    },
    [analyses]
  )

  const handleSelectThread = useCallback(
    (threadId: string) => {
      setSelectedThreadId(threadId)
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
      )
      setChatMessages([])
      handleAnalyze(threadId)
    },
    [handleAnalyze]
  )

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
      // silently fail
    } finally {
      setRegeneratingId(undefined)
    }
  }

  // Stats counts
  const analysisCounts = useMemo(() => {
    let urgent = 0
    let action = 0
    let fyi = 0
    for (const state of Object.values(analyses)) {
      if (!state.data) continue
      if (state.data.priority === 'urgent') urgent++
      else if (state.data.priority === 'action') action++
      else if (state.data.priority === 'fyi') fyi++
    }
    return { urgent, action, fyi }
  }, [analyses])

  // Sorted + filtered thread list
  const displayedThreads = useMemo(() => {
    const priorityOrder: Record<string, number> = { urgent: 0, action: 1, fyi: 2 }

    let filtered = threads.filter((t) => {
      const q = searchQuery.toLowerCase()
      if (q && !t.subject.toLowerCase().includes(q) && !t.from.name.toLowerCase().includes(q)) {
        return false
      }
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
      if (priorityFilter === 'all') return true
      const analysis = analyses[t.id]?.data
      if (!analysis) return false
      return analysis.priority === priorityFilter
    })

    filtered = [...filtered].sort((a, b) => {
      const aPriority = analyses[a.id]?.data?.priority
      const bPriority = analyses[b.id]?.data?.priority
      const aOrder = aPriority !== undefined ? priorityOrder[aPriority] ?? 3 : 3
      const bOrder = bPriority !== undefined ? priorityOrder[bPriority] ?? 3 : 3
      if (aOrder !== bOrder) return aOrder - bOrder
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    return filtered
  }, [threads, searchQuery, priorityFilter, categoryFilter, analyses])

  const currentAnalysis = selectedThreadId ? (analyses[selectedThreadId] ?? null) : null
  const currentActions = selectedThreadId ? (actionsMap[selectedThreadId] ?? []) : []

  // Compose AI suggest
  const handleAISuggest = async () => {
    if (!composeSubject.trim()) return
    setComposeSuggestLoading(true)
    try {
      const res = await fetch('/api/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: composeSubject, context: composeTo ? `To: ${composeTo}` : undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setComposeBody(data.body ?? '')
      }
    } catch {
      // ignore
    } finally {
      setComposeSuggestLoading(false)
    }
  }

  // AI Chat
  const handleSendChat = async (overrideMsg?: string) => {
    const msg = overrideMsg ?? chatInput
    if (!msg.trim()) return

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msg.trim(),
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.trim(), threadId: selectedThreadId })
      })
      const data = await res.json()

      const assistantMsg: AIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response ?? 'No response',
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, assistantMsg])
    } catch {
      const errMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong.',
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errMsg])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <main className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Icon Sidebar - 64px, dark */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-4 gap-1">
        {/* Logo at top */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
          <Mail className="w-5 h-5 text-white" />
        </div>

        {/* Nav icons */}
        <NavIcon icon={Inbox} label="Inbox" active />
        <NavIcon icon={MessageSquare} label="Chat" />
        <NavIcon icon={FileText} label="Files" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* AI toggle button at bottom */}
        <button onClick={() => setAiPanelOpen(!aiPanelOpen)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${aiPanelOpen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="AI Assistant">
          <Bot className="w-5 h-5" />
        </button>

        {/* User avatar */}
        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mt-2 text-sm">
          <span role="img" aria-label="user">&#128100;</span>
        </div>
      </div>

      {/* Email List Panel - 320px */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header with title + compose button */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">MailMate</h1>
            <Button size="sm" variant="outline" onClick={() => setComposeOpen(true)} className="h-8 gap-1">
              <PenSquare className="w-3.5 h-3.5" /> Compose
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 mb-2">
            {categoryTabs.map(tab => (
              <button key={tab.key} onClick={() => setCategoryFilter(tab.key)}
                className={`text-xs py-1 px-2.5 rounded-full font-medium transition-colors ${
                  categoryFilter === tab.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Priority filter row */}
          <div className="flex gap-1">
            {priorityTabs.map(tab => (
              <button key={tab.key} onClick={() => setPriorityFilter(tab.key)}
                className={`text-xs py-1 px-2 rounded font-medium transition-colors flex items-center gap-1 ${
                  priorityFilter === tab.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3 text-xs text-gray-500">
          {analysisCounts.urgent > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> {analysisCounts.urgent} Urgent</span>}
          {analysisCounts.action > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {analysisCounts.action} Action</span>}
          {analysisCounts.fyi > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> {analysisCounts.fyi} FYI</span>}
          {analysisCounts.urgent === 0 && analysisCounts.action === 0 && analysisCounts.fyi === 0 && <span>Select emails to analyze</span>}
        </div>

        {/* Thread list - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {displayedThreads.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">No threads found</p>
            </div>
          ) : (
            displayedThreads.map(thread => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                selected={selectedThreadId === thread.id}
                analysis={analyses[thread.id]?.data}
                onClick={() => handleSelectThread(thread.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selectedThread ? (
          <>
            {/* Email header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedThread.subject}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedThread.from.name} &lt;{selectedThread.from.email}&gt;</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentAnalysis?.data && <PriorityBadge priority={currentAnalysis.data.priority} />}
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* AI Summary Card - loading */}
              {currentAnalysis?.loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-700">Analyzing email thread...</span>
                </div>
              )}

              {/* AI Summary Card - error */}
              {currentAnalysis?.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700">{currentAnalysis.error}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => {
                    // Reset analysis so it can be retried
                    setAnalyses((prev) => {
                      const next = { ...prev }
                      delete next[selectedThread.id]
                      return next
                    })
                    handleAnalyze(selectedThread.id)
                  }}>Retry</Button>
                </div>
              )}

              {/* AI Summary Card - data */}
              {currentAnalysis?.data && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">AI Summary</span>
                    <PriorityBadge priority={currentAnalysis.data.priority} small />
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {currentAnalysis.data.bullets.map((bullet, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-400 mt-0.5">&bull;</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {/* Quick action chips */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200/50">
                    <button className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" /> Create Task
                    </button>
                    <button className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Schedule Meeting
                    </button>
                    <button onClick={() => setAiPanelOpen(true)} className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> Ask AI
                    </button>
                  </div>
                </div>
              )}

              {/* Email messages */}
              {selectedThread.emails.map((email) => (
                <div key={email.id} className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                        {email.from.name === 'You' ? '\u{1F464}' : (selectedThread.from.avatar || email.from.name[0])}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{email.from.name}</p>
                        <p className="text-xs text-gray-500">{email.from.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(email.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-12">
                    {email.body}
                  </div>
                  {/* Attachments */}
                  {email.attachments && email.attachments.length > 0 && (
                    <div className="mt-3 pl-12 flex flex-wrap gap-2">
                      {email.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs">
                          <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700 font-medium">{att.name}</span>
                          <span className="text-gray-400">{att.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Cards at bottom */}
            {currentActions.length > 0 && (
              <div className="border-t border-gray-200 max-h-80 overflow-y-auto">
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
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Select an email to get started</p>
              <p className="text-sm text-gray-400 mt-1">AI analysis will begin automatically</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Panel - slides in from right */}
      {aiPanelOpen && (
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          {/* AI Panel header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">AI Assistant</span>
            </div>
            <button onClick={() => setAiPanelOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick action buttons */}
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-1.5">
            {[
              { label: 'Summarize', msg: 'Summarize this email thread concisely' },
              { label: 'Draft Reply', msg: 'Draft a professional reply to this email' },
              { label: 'Extract Tasks', msg: 'What are the action items and deadlines in this thread?' },
              { label: 'Key Dates', msg: 'What are the important dates and deadlines mentioned?' },
            ].map(action => (
              <button key={action.label}
                onClick={() => { handleSendChat(action.msg) }}
                className="text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                {action.label}
              </button>
            ))}
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" id="chat-messages">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Ask me anything about this email</p>
              </div>
            )}
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about this email..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat() } }}
                className="flex-1 h-9 bg-gray-50"
              />
              <Button size="sm" onClick={() => handleSendChat()} disabled={chatLoading || !chatInput.trim()} className="h-9 bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">New Message</h2>
              <button
                onClick={() => setComposeOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                <Input
                  placeholder="recipient@example.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                <Input
                  placeholder="Email subject..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-500">Body</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAISuggest}
                    disabled={composeSuggestLoading || !composeSubject.trim()}
                    className="h-6 text-xs gap-1 text-blue-600 hover:text-blue-700"
                  >
                    {composeSuggestLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Drafting...
                      </>
                    ) : (
                      <>AI Suggest</>
                    )}
                  </Button>
                </div>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
                  rows={8}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200">
              <Button variant="outline" size="sm" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setComposeOpen(false)
                  setComposeTo('')
                  setComposeSubject('')
                  setComposeBody('')
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
