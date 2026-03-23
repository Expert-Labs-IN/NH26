export interface EmailContact {
  name: string;
  email: string;
  isVIP?: boolean;
}

export interface EmailThread {
  from: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface Email {
  id: string;
  from: EmailContact;
  to: EmailContact;
  subject: string;
  body: string;
  timestamp: string;
  thread: EmailThread[];
  priority: 'urgent' | 'action_required' | 'fyi';
  hasAttachments: boolean;
}

export interface ThreadSummary {
  points: string[];
  keyTopics: string[];
}

export interface DraftedReply {
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'formal';
}

export interface CalendarEvent {
  title: string;
  date: string;
  time: string;
  duration: number;
  location?: string;
  attendees: string[];
  description: string;
}

export interface TaskItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  category: string;
}

export interface AIAnalysis {
  emailId: string;
  summary: ThreadSummary;
  suggestedActions: {
    type: 'reply' | 'calendar' | 'task' | 'forward' | 'archive';
    data: DraftedReply | CalendarEvent | TaskItem[] | any;
    confidence: number;
    reasoning: string;
  }[];
  priority: 'urgent' | 'action_required' | 'fyi';
  sentiment: 'positive' | 'neutral' | 'negative';
  requiresAction: boolean;
}

export interface ActionApproval {
  actionId: string;
  type: string;
  data: any;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  timestamp: string;
}
