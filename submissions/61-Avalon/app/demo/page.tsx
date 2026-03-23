'use client'

import { useState, useMemo } from 'react'
import { Mail, Search, Check, X, RefreshCw, AlertCircle, Calendar, CheckSquare, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Mock data for demonstration
const mockThreads = [
  {
    id: 'thread-1',
    from: { name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com' },
    subject: 'Q2 Budget Review Meeting - Urgent',
    preview: 'We need to finalize the Q2 budget allocations before the board meeting next Tuesday...',
    timestamp: '2024-03-21T09:15:00Z',
    unreadCount: 3,
    emails: [
      {
        id: 'email-1',
        from: { name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com' },
        body: `Hi,\n\nI hope this message finds you well. We need to finalize the Q2 budget allocations before the board meeting next Tuesday.\n\nThe Finance team has prepared preliminary numbers, but we need departmental leads to review and approve their respective allocations.\n\nKey deadlines:\n- Q2 Budget draft: Friday EOD\n- Final review: Monday morning\n- Board presentation: Tuesday 10am\n\nCould you please review the attached spreadsheet and confirm your team's numbers by Friday?\n\nBest regards,\nSarah`,
        timestamp: '2024-03-21T09:15:00Z',
      },
    ],
  },
  {
    id: 'thread-2',
    from: { name: 'John Smith', email: 'john.smith@acmecorp.com' },
    subject: 'Project Timeline Update',
    preview: 'Here is the updated project timeline for the new mobile app launch...',
    timestamp: '2024-03-20T14:30:00Z',
    unreadCount: 0,
    emails: [
      {
        id: 'email-2',
        from: { name: 'John Smith', email: 'john.smith@acmecorp.com' },
        body: 'Hi team,\n\nI wanted to share the updated project timeline for our new mobile app launch.\n\nKey milestones:\n- Design phase: March 25-30\n- Development phase: April 1-15\n- Testing phase: April 16-20\n- Launch: April 25\n\nPlease let me know if you have any concerns.\n\nJohn',
        timestamp: '2024-03-20T14:30:00Z',
      },
    ],
  },
  {
    id: 'thread-3',
    from: { name: 'Lisa Johnson', email: 'lisa.johnson@acmecorp.com' },
    subject: 'Conference Attendance Request',
    preview: 'I would like to attend the Annual Tech Conference next month. The event is scheduled for April 15-17...',
    timestamp: '2024-03-19T10:00:00Z',
    unreadCount: 0,
    emails: [
      {
        id: 'email-3',
        from: { name: 'Lisa Johnson', email: 'lisa.johnson@acmecorp.com' },
        body: 'Hi,\n\nI would like to attend the Annual Tech Conference next month. The event is scheduled for April 15-17 in San Francisco.\n\nEstimated costs:\n- Registration: $800\n- Hotel (3 nights): $1,200\n- Travel: $600\n- Meals: $400\n\nTotal: $3,000\n\nPlease approve this request.\n\nLisa',
        timestamp: '2024-03-19T10:00:00Z',
      },
    ],
  },
]

const mockAnalysis = {
  priority: 'urgent' as const,
  bullets: [
    'Board meeting deadline is next Tuesday requiring finalized Q2 budget',
    'Department leads must review and confirm budget numbers by Friday EOD',
    'Final review meeting scheduled for Monday morning before presentation',
  ],
}

const mockActions = [
  {
    id: 'action-1',
    type: 'reply' as const,
    title: 'Draft Reply',
    description: 'Generate response confirming receipt and commitment to deadline',
    content: 'Hi Sarah,\n\nThank you for sending over the budget allocations. I\'ve reviewed the numbers and everything looks accurate. I\'ll have my team\'s confirmed allocations to you by Friday EOD as requested.\n\nLooking forward to the board presentation on Tuesday.\n\nBest regards',
    status: 'pending' as const,
  },
  {
    id: 'action-2',
    type: 'calendar' as const,
    title: 'Board Presentation',
    description: 'Schedule calendar event for budget review meeting',
    date: '2024-03-26',
    time: '10:00 AM',
    attendees: ['sarah.chen@acmecorp.com'],
    status: 'pending' as const,
  },
  {
    id: 'action-3',
    type: 'task' as const,
    title: 'Review Budget Numbers',
    description: 'Review department allocations and confirm by Friday',
    dueDate: '2024-03-22',
    priority: 'high' as const,
    status: 'pending' as const,
  },
]

const priorityConfig = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200', dotColor: 'bg-red-500' },
  action: { label: 'Action Required', color: 'bg-amber-100 text-amber-800 border-amber-200', dotColor: 'bg-amber-500' },
  fyi: { label: 'For Your Info', color: 'bg-blue-100 text-blue-800 border-blue-200', dotColor: 'bg-blue-500' },
}

export default function DemoPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string>('thread-1')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({})
  const [expandedActions, setExpandedActions] = useState<Record<string, boolean>>({})
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null)

  const selectedThread = mockThreads.find((t) => t.id === selectedThreadId)

  const filteredThreads = useMemo(() => {
    if (!searchQuery) return mockThreads
    return mockThreads.filter((t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.from.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleApprove = (actionId: string) => {
    setActionStatuses((prev) => ({ ...prev, [actionId]: 'approved' }))
    showNotification('success', 'Action approved!')
  }

  const handleDiscard = (actionId: string) => {
    setActionStatuses((prev) => ({ ...prev, [actionId]: 'discarded' }))
    showNotification('info', 'Action discarded')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'discarded':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <main className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Triage - Demo</h1>
            <p className="text-sm text-muted-foreground">Interactive preview (no AI required)</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 flex flex-col border-r border-border bg-muted/20">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors border-l-4 ${
                  selectedThreadId === thread.id
                    ? 'bg-background border-l-blue-500 shadow-sm'
                    : 'border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`font-medium text-sm flex-1 ${thread.unreadCount > 0 ? 'font-bold' : ''}`}>
                    {thread.from.name}
                  </p>
                  {thread.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground truncate">{thread.subject}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{thread.preview}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(thread.timestamp).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="border-b border-border p-6 bg-background">
                <h1 className="text-2xl font-bold text-foreground mb-2">{selectedThread.subject}</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedThread.from.name} ({selectedThread.from.email})
                </p>

                {/* Analysis Summary */}
                <div className={`p-4 border rounded-lg ${priorityConfig[mockAnalysis.priority as keyof typeof priorityConfig].color}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        priorityConfig[mockAnalysis.priority as keyof typeof priorityConfig].dotColor
                      }`}
                    />
                    <span className="font-semibold">
                      {priorityConfig[mockAnalysis.priority as keyof typeof priorityConfig].label}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {mockAnalysis.bullets.map((bullet, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="font-medium">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Email Thread */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {selectedThread.emails.map((email) => (
                    <div key={email.id} className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground">{email.from.name}</p>
                          <p className="text-sm text-muted-foreground">{email.from.email}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(email.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {email.body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Cards */}
              <div className="border-t border-border p-6 bg-background">
                <h2 className="text-lg font-bold text-foreground mb-4">Suggested Actions</h2>
                <div className="space-y-4">
                  {mockActions.map((action) => {
                    const status = actionStatuses[action.id] || 'pending'
                    const isExpanded = expandedActions[action.id] || false

                    return (
                      <div
                        key={action.id}
                        className={`border rounded-lg overflow-hidden ${getStatusColor(status)}`}
                      >
                        <button
                          onClick={() => setExpandedActions((prev) => ({ ...prev, [action.id]: !isExpanded }))}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {action.type === 'reply' && <Mail className="w-5 h-5 text-blue-600" />}
                            {action.type === 'calendar' && <Calendar className="w-5 h-5 text-purple-600" />}
                            {action.type === 'task' && <CheckSquare className="w-5 h-5 text-green-600" />}
                            <span className="font-semibold text-foreground">{action.title}</span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              isExpanded ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="border-t border-current/20 p-4 space-y-3">
                            <p className="text-sm text-foreground">{action.description}</p>

                            {action.type === 'reply' && (
                              <textarea
                                defaultValue={action.content}
                                className="w-full px-3 py-2 border border-current/20 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                              />
                            )}

                            {action.type === 'calendar' && (
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Date:</span> {action.date}
                                </p>
                                <p>
                                  <span className="font-medium">Time:</span> {action.time}
                                </p>
                                <p>
                                  <span className="font-medium">Attendees:</span> {action.attendees?.join(', ')}
                                </p>
                              </div>
                            )}

                            {action.type === 'task' && (
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Due:</span> {action.dueDate}
                                </p>
                                <p>
                                  <span className="font-medium">Priority:</span>{' '}
                                  <span className="capitalize">{action.priority}</span>
                                </p>
                              </div>
                            )}

                            {status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleApprove(action.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleDiscard(action.id)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Discard
                                </Button>
                              </div>
                            )}

                            {status === 'approved' && (
                              <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                                <Check className="w-4 h-4" />
                                Approved
                              </div>
                            )}

                            {status === 'discarded' && (
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <X className="w-4 h-4" />
                                Discarded
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/50">
              <div className="text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an email to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500'
              : notification.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
          }`}
        >
          {notification.message}
        </div>
      )}
    </main>
  )
}
