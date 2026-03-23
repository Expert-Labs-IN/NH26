import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { Thread, AnalysisSummary, Priority } from '@/types'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function analyzeThread(thread: Thread): Promise<AnalysisSummary> {
  const emailContent = thread.emails
    .map((email) => `From: ${email.from.name}\nTo: ${email.to.map((t) => t.name).join(', ')}\n\n${email.body}`)
    .join('\n\n---\n\n')

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are an email triage assistant. Analyze the email thread and respond with ONLY a valid JSON object in this format:
{
  "bullets": ["bullet 1", "bullet 2", "bullet 3"],
  "priority": "urgent" | "action" | "fyi"
}

Priority guidelines:
- "urgent": Requires immediate action or time-sensitive decisions
- "action": Requires response or action but not immediately time-critical
- "fyi": For information only, no action required`,
    prompt: `Analyze this email thread and provide a 3-bullet summary and priority level.\n\nThread subject: ${thread.subject}\n\nEmails:\n${emailContent}`,
  })

  try {
    const result = JSON.parse(text)
    return {
      bullets: Array.isArray(result.bullets) ? result.bullets : ['Unable to parse analysis'],
      priority: (['urgent', 'action', 'fyi'].includes(result.priority) ? result.priority : 'action') as Priority,
    }
  } catch {
    return {
      bullets: ['Unable to analyze this thread'],
      priority: 'fyi',
    }
  }
}

export async function generateReply(thread: Thread): Promise<string> {
  const emailContent = thread.emails
    .map((email) => `From: ${email.from.name}: ${email.body}`)
    .join('\n\n')

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are a professional email assistant. Generate a concise, professional email reply based on the thread context. 
Return ONLY the email body text, no subject line or salutation.`,
    prompt: `Based on this email thread, draft a professional reply:\n\nThread subject: ${thread.subject}\n\nEmails:\n${emailContent}`,
  })

  return text.trim()
}

export async function extractCalendarEvent(thread: Thread): Promise<{
  title: string
  date: string
  time: string
  description: string
  attendees: string[]
}> {
  const emailContent = thread.emails.map((email) => email.body).join('\n\n')

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are an email analysis assistant. Extract calendar event details from the email thread.
Respond with ONLY a valid JSON object in this format:
{
  "title": "Event title",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "description": "Event description",
  "attendees": ["email@example.com"]
}

If no specific date/time is mentioned, use reasonable defaults based on context.`,
    prompt: `Extract calendar event details from this email thread:\n\nSubject: ${thread.subject}\n\nEmails:\n${emailContent}`,
  })

  try {
    const result = JSON.parse(text)
    return {
      title: result.title || 'Meeting',
      date: result.date || new Date().toISOString().split('T')[0],
      time: result.time || '14:00',
      description: result.description || '',
      attendees: Array.isArray(result.attendees) ? result.attendees : [],
    }
  } catch {
    return {
      title: 'Meeting from ' + thread.from.name,
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      description: thread.subject,
      attendees: [thread.from.email],
    }
  }
}

export async function extractTasks(thread: Thread): Promise<Array<{
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}>> {
  const emailContent = thread.emails.map((email) => email.body).join('\n\n')

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are an email analysis assistant. Extract action items/tasks from the email thread.
Respond with ONLY a valid JSON array of task objects in this format:
[
  {
    "title": "Task title",
    "description": "Task description",
    "dueDate": "YYYY-MM-DD",
    "priority": "low" | "medium" | "high"
  }
]

If no specific due date is mentioned, use a reasonable default (e.g., 3-5 days from now for high priority, 1-2 weeks for others).`,
    prompt: `Extract action items/tasks from this email thread:\n\nSubject: ${thread.subject}\n\nEmails:\n${emailContent}`,
  })

  try {
    const result = JSON.parse(text)
    return Array.isArray(result)
      ? result.map((task) => ({
          title: task.title || 'Action item',
          description: task.description || '',
          dueDate: task.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
        }))
      : []
  } catch {
    return []
  }
}
