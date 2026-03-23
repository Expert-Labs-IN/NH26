// Email and Thread Types
export interface EmailSender {
  name: string
  email: string
  avatar?: string
}

export interface Attachment {
  name: string
  size: string
  type: string
}

export interface Email {
  id: string
  threadId: string
  from: EmailSender
  to: EmailSender[]
  subject: string
  body: string
  timestamp: string
  isRead: boolean
  attachments?: Attachment[]
}

export type EmailCategory = 'primary' | 'company' | 'promotion' | 'social'

export interface Thread {
  id: string
  from: EmailSender
  subject: string
  preview: string
  timestamp: string
  unreadCount: number
  emails: Email[]
  category: EmailCategory
}

// Priority and Status Types
export type Priority = 'urgent' | 'action' | 'fyi'

export interface AnalysisSummary {
  bullets: string[]
  priority: Priority
  keyPhrases?: string[]
  actionItems?: string[]
}

// Action Types
export type ActionType = 'reply' | 'calendar' | 'task'

export interface ActionCard {
  id: string
  type: ActionType
  threadId: string
  emailId: string
  status: 'pending' | 'approved' | 'discarded'
  createdAt: string
}

export interface ReplyAction extends ActionCard {
  type: 'reply'
  draftBody: string
}

export interface CalendarAction extends ActionCard {
  type: 'calendar'
  title: string
  date: string
  time: string
  description: string
  attendees: string[]
}

export interface TaskAction extends ActionCard {
  type: 'task'
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}

// Analysis State
export interface ThreadAnalysis {
  threadId: string
  summary: AnalysisSummary
  actions: (ReplyAction | CalendarAction | TaskAction)[]
  loading: boolean
  error: string | null
  regeneratingActionId?: string
}

export interface AppState {
  threads: Thread[]
  selectedThreadId: string | null
  analyses: Record<string, ThreadAnalysis>
  toastMessage?: {
    type: 'success' | 'error' | 'info'
    message: string
  }
}

// AI Chat message type
export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
