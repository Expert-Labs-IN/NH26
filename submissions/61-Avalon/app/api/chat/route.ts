import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { mockThreads } from '@/data/emails'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  const { message, threadId } = await request.json()
  const thread = mockThreads.find((t) => t.id === threadId)

  const emailContext = thread
    ? thread.emails.map((e) => `From: ${e.from.name}\n${e.body}`).join('\n---\n')
    : 'No email selected.'

  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are MailMate, an AI email assistant. You help users understand and respond to emails. Be concise and helpful. You have access to the current email thread context. Answer questions about the email, help draft responses, extract information, etc.`,
      prompt: `Email thread context:\nSubject: ${thread?.subject ?? 'None'}\n\n${emailContext}\n\nUser asks: ${message}`,
    })
    return NextResponse.json({ response: text.trim() })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ response: 'Sorry, I could not process that. Please check your API key.' }, { status: 200 })
  }
}
