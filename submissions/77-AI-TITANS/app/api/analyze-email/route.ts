import { NextRequest, NextResponse } from 'next/server';
import type { Email, AIAnalysis } from '@/types';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const ANALYSIS_PROMPT = `You are an intelligent email assistant that analyzes emails and suggests automated actions. Your job is to:

1. Summarize the email thread into 3 concise bullet points
2. Identify key topics and themes
3. Suggest appropriate automated actions (reply drafts, calendar events, task lists)
4. Assess priority and sentiment
5. Determine if the email requires action

For each email, you should suggest 1-3 appropriate actions from these types:
- **reply**: Draft a professional response
- **calendar**: Create a calendar event if meeting/deadline is mentioned
- **task**: Extract actionable items as a task list
- **forward**: Suggest forwarding if delegation is appropriate
- **archive**: Suggest archiving if it's just FYI

Respond ONLY with valid JSON in this exact format:
{
  "summary": {
    "points": ["point 1", "point 2", "point 3"],
    "keyTopics": ["topic1", "topic2"]
  },
  "suggestedActions": [
    {
      "type": "reply",
      "data": {
        "subject": "Re: Original Subject",
        "body": "Professional response here...",
        "tone": "professional"
      },
      "confidence": 0.9,
      "reasoning": "Why this action is suggested"
    }
  ],
  "priority": "urgent",
  "sentiment": "neutral",
  "requiresAction": true
}

For calendar events use this format in data:
{
  "title": "Meeting Title",
  "date": "2026-03-28",
  "time": "14:00",
  "duration": 90,
  "location": "Conference Room A",
  "attendees": ["email1@example.com"],
  "description": "Meeting description"
}

For tasks use this format in data (array of tasks):
[
  {
    "title": "Task title",
    "description": "Task description",
    "priority": "high",
    "dueDate": "2026-03-27",
    "category": "Review"
  }
]`;

export async function POST(request: NextRequest) {
  try {
    const { email }: { email: Email } = await request.json();

    if (!email || !email.body) {
      return NextResponse.json(
        { error: 'Invalid email data' },
        { status: 400 }
      );
    }

    // Build context from email thread
    let emailContext = `Subject: ${email.subject}\n`;
    emailContext += `From: ${email.from.name} <${email.from.email}>${email.from.isVIP ? ' [VIP]' : ''}\n`;
    emailContext += `Priority: ${email.priority}\n`;
    emailContext += `Has Attachments: ${email.hasAttachments}\n\n`;

    if (email.thread.length > 0) {
      emailContext += `Previous Thread:\n`;
      email.thread.forEach((msg, idx) => {
        emailContext += `\n[${idx + 1}] ${msg.subject}\n${msg.body.substring(0, 200)}...\n`;
      });
      emailContext += `\n---\n\n`;
    }

    emailContext += `Current Email:\n${email.body}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // fast + cheap (perfect for hackathon)
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze this email:\n\n${emailContext}`,
        },
      ],
    });

    // Extract the text content
    const responseText = completion.choices[0]?.message?.content || '';

    // Parse JSON response
    let analysisData;
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysisData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    const analysis: AIAnalysis = {
      emailId: email.id,
      ...analysisData,
    };

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Email analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze email',
        details: error.message
      },
      { status: 500 }
    );
  }
}
