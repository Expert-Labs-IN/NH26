import { NextRequest, NextResponse } from 'next/server'
import { generateReply, extractCalendarEvent, extractTasks } from '@/lib/groq'
import { mockThreads } from '@/data/emails'

export async function POST(request: NextRequest) {
  const { threadId, actionType } = await request.json()
  const thread = mockThreads.find((t) => t.id === threadId)
  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }

  const lastEmail = thread.emails[thread.emails.length - 1]
  const now = new Date().toISOString()

  try {
    if (actionType === 'reply') {
      const reply = await generateReply(thread)
      return NextResponse.json({
        id: `action-reply-${threadId}`,
        type: 'reply',
        threadId,
        emailId: lastEmail.id,
        status: 'pending',
        createdAt: now,
        draftBody: reply,
      })
    }

    if (actionType === 'calendar') {
      const calendar = await extractCalendarEvent(thread)
      return NextResponse.json({
        id: `action-calendar-${threadId}`,
        type: 'calendar',
        threadId,
        emailId: lastEmail.id,
        status: 'pending',
        createdAt: now,
        ...calendar,
      })
    }

    if (actionType === 'task') {
      const tasks = await extractTasks(thread)
      const task = tasks[0]
      return NextResponse.json({
        id: `action-task-${threadId}-0`,
        type: 'task',
        threadId,
        emailId: lastEmail.id,
        status: 'pending',
        createdAt: now,
        title: task?.title ?? 'Action item',
        description: task?.description ?? '',
        dueDate: task?.dueDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: task?.priority ?? 'medium',
      })
    }

    return NextResponse.json({ error: 'Unknown action type' }, { status: 400 })
  } catch (error) {
    console.error('Regenerate error:', error)
    return NextResponse.json({ error: 'Regeneration failed. Check your GROQ_API_KEY.' }, { status: 500 })
  }
}
