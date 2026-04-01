import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runCoordinator } from '@/lib/coordinator'
import { runEmailAssistant } from '@/lib/agents'
import { Thread } from '@/types'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const { message, thread, threadId, history } = await request.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Build thread context
  let threadData: Thread | null = null
  if (thread && thread.id && thread.emails) {
    threadData = thread as Thread
  } else if (threadId) {
    const { mockThreads } = await import('@/data/emails')
    threadData = mockThreads.find((t) => t.id === threadId) ?? null
  }

  try {
    // Authenticated users get the full coordinator with memory + multi-agent delegation
    if (session?.accessToken && session?.user?.email) {
      const userId = session.user.email
      const result = await runCoordinator(
        message,
        threadData,
        session.accessToken,
        userId,
        history ?? []
      )
      return NextResponse.json(result)
    }

    // Unauthenticated / demo mode: fall back to direct email assistant (no memory, no delegation)
    const result = await runEmailAssistant(message, threadData, null, history ?? [])
    return NextResponse.json({
      ...result,
      delegations: [],
      memoriesUsed: [],
      memoriesStored: [],
    })
  } catch (error) {
    console.error('Orchestrate error:', error)
    return NextResponse.json({
      reply: 'Sorry, something went wrong. Please try again.',
      steps: [],
      delegations: [],
      memoriesUsed: [],
      memoriesStored: [],
    })
  }
}
