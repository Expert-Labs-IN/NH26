import { NextRequest, NextResponse } from 'next/server'
import { generateReply, extractCalendarEvent, extractTasks } from '@/lib/groq'
import { mockThreads } from '@/data/emails'

export async function POST(request: NextRequest) {
  const { threadId } = await request.json()
  const thread = mockThreads.find((t) => t.id === threadId)
  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }

  try {
    const [reply, calendar, tasks] = await Promise.all([
      generateReply(thread),
      extractCalendarEvent(thread),
      extractTasks(thread),
    ])

    const now = new Date().toISOString()
    const lastEmail = thread.emails[thread.emails.length - 1]

    const actions = [
      {
        id: `action-reply-${threadId}`,
        type: 'reply',
        threadId,
        emailId: lastEmail.id,
        status: 'pending',
        createdAt: now,
        draftBody: reply,
      },
      {
        id: `action-calendar-${threadId}`,
        type: 'calendar',
        threadId,
        emailId: lastEmail.id,
        status: 'pending',
        createdAt: now,
        title: calendar.title,
        date: calendar.date,
        time: calendar.time,
        description: calendar.description,
        attendees: calendar.attendees,
      },
      ...tasks.map((task, i) => ({
        id: `action-task-${threadId}-${i}`,
        type: 'task',
        threadId,
        emailId: lastEmail.id,
        status: 'pending',
        createdAt: now,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
      })),
    ]

    return NextResponse.json(actions)
  } catch (error) {
    console.error('Actions generation error:', error)
    return NextResponse.json({ error: 'Action generation failed. Check your GROQ_API_KEY.' }, { status: 500 })
  }
}
