import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runSchedulingAgent } from '@/lib/agents'
import { Thread } from '@/types'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: 'Sign in with Google to use the scheduling agent.' },
      { status: 401 }
    )
  }

  const { thread } = await request.json()
  if (!thread?.id || !thread?.emails) {
    return NextResponse.json(
      { error: 'Thread data is required.' },
      { status: 400 }
    )
  }

  try {
    const result = await runSchedulingAgent(thread as Thread, session.accessToken)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Scheduling agent error:', error)
    return NextResponse.json(
      { error: 'Scheduling failed. Please try again.' },
      { status: 500 }
    )
  }
}
