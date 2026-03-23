import type { TriageResult } from '../types';

/**
 * Pre-built triage results for all 10 mock emails.
 * Used as the final fallback when both Ollama and Groq are unavailable.
 */
export const MOCK_TRIAGE: Record<string, TriageResult> = {
  email_001: {
    emailId: 'email_001',
    priority: 'Urgent',
    summary: [
      'CEO requests immediate contract review — Henderson deal closes tonight worth $2.4M',
      'Legal has flagged three clauses requiring your sign-off before proceeding',
      'Hard deadline is 5pm today — missing it risks losing the entire deal',
    ],
    replyDraft: 'Hi Alex,\n\nThank you for flagging this urgently. I am reviewing the Henderson contract immediately and will liaise with Sarah from Legal on the three flagged clauses.\n\nI will ensure everything is signed off before 5pm today and will keep you updated on progress.\n\nBest regards',
    calendarEvent: {
      title: 'Henderson Contract Review — EOD Deadline',
      date: '2026-03-23',
      time: '14:00',
      attendees: ['ceo@corp.com', 'legal@lawfirm.com'],
      location: 'Conference Room A',
    },
    taskList: [
      'Review all three flagged clauses in the Henderson contract immediately',
      'Co-ordinate with Sarah from Legal for sign-off approval',
      'Return signed contract before the 5pm deadline today',
    ],
    confidence: 0.97,
    source: 'cache',
  },
  email_002: {
    emailId: 'email_002',
    priority: 'Requires Action',
    summary: [
      'CTO of TechClient Inc. requesting product demo for a team of 50 engineers',
      'Interest focused on workflow automation and API integration features',
      'Prefers Tuesday or Wednesday afternoon next week for scheduling',
    ],
    replyDraft: 'Hi James,\n\nThank you for reaching out — it\'s great to hear you\'ve been evaluating our platform for your engineering team.\n\nI have availability on Tuesday 28th March at 2pm or Wednesday 29th March at 3pm. Please let me know which works best and I\'ll send over a calendar invite.\n\nLooking forward to connecting!',
    calendarEvent: {
      title: 'Product Demo — TechClient Inc.',
      date: '2026-03-28',
      time: '14:00',
      attendees: ['james.liu@techclient.com'],
      location: 'Zoom (link to follow)',
    },
    taskList: [
      'Confirm demo slot with James Liu at TechClient Inc.',
      'Prepare workflow automation and API integration walkthrough',
      'Send calendar invite with Zoom link once time is confirmed',
    ],
    confidence: 0.92,
    source: 'cache',
  },
  email_003: {
    emailId: 'email_003',
    priority: 'Urgent',
    summary: [
      'Invoice #INV-2026-0087 for $8,750 is 13 days overdue — final notice issued',
      'Service suspension and 1.5% late fee risk if not paid within 48 hours',
      'Payment accepted via wire transfer, ACH, or credit card portal',
    ],
    replyDraft: 'Dear Vendor Billing Team,\n\nThank you for the reminder regarding invoice #INV-2026-0087. I apologise for the delay in payment.\n\nI am arranging payment immediately and will ensure it is processed within 24 hours. I will send you the payment confirmation reference as soon as the transfer is complete.',
    calendarEvent: { title: null, date: null, time: null, attendees: [], location: null },
    taskList: [
      'Process payment of $8,750 for invoice #INV-2026-0087 within 24 hours',
      'Send payment confirmation reference to billing@vendor.com',
      'Review accounts payable to prevent future overdue invoices',
    ],
    confidence: 0.95,
    source: 'cache',
  },
  email_004: {
    emailId: 'email_004',
    priority: 'Requires Action',
    summary: [
      'Priya requests all-hands agenda for next Wednesday covering Q1 review and roadmap',
      'You are expected to present the metrics dashboard for approximately 30 minutes',
      'Agenda must be sent to Priya by Monday EOD for advance distribution',
    ],
    replyDraft: 'Hi Priya,\n\nThank you for the heads-up. I will put together the all-hands agenda covering the Q1 performance review, new product roadmap, and team restructuring update.\n\nI will also have the metrics dashboard presentation prepared. I\'ll send you the full agenda by Monday EOD as requested.',
    calendarEvent: {
      title: 'All-Hands Team Meeting',
      date: '2026-03-25',
      time: '10:00',
      attendees: ['priya.sharma@company.com'],
      location: 'Main Conference Room',
    },
    taskList: [
      'Draft all-hands agenda covering Q1 review, roadmap, and restructuring',
      'Prepare metrics dashboard presentation slides',
      'Send finalised agenda to Priya by Monday EOD',
    ],
    confidence: 0.91,
    source: 'cache',
  },
  email_005: {
    emailId: 'email_005',
    priority: 'FYI',
    summary: [
      'Weekly AI newsletter covering GPT-5, Gemini 2.5, Claude 4, and Mistral updates',
      'No meetings requested and no deadlines mentioned',
      'Informational reading only — no reply required',
    ],
    replyDraft: 'Thank you for the weekly roundup — always a great read.',
    calendarEvent: { title: null, date: null, time: null, attendees: [], location: null },
    taskList: [
      'Read full article on enterprise LLM adoption trends at techdigest.io',
      'Note Claude 4 200K context window — evaluate for internal use cases',
      'Share relevant AI updates with the engineering team this week',
    ],
    confidence: 0.88,
    source: 'cache',
  },
  email_006: {
    emailId: 'email_006',
    priority: 'Requires Action',
    summary: [
      'Critical BUG-4821: OAuth login fails on Safari 17.x with 403 on callback URL',
      'Affects approximately 18% of user base and is blocking the v2.4 release',
      'Likely CORS headers issue on OAuth callback endpoint — needs dev attention today',
    ],
    replyDraft: 'Hi Rohan,\n\nThank you for the detailed bug report. I have flagged BUG-4821 as high priority and am assigning it to the dev team for immediate investigation.\n\nWe will investigate the CORS headers on the OAuth callback endpoint and aim to have a fix deployed to staging within the day. I\'ll keep you updated.',
    calendarEvent: { title: null, date: null, time: null, attendees: [], location: null },
    taskList: [
      'Assign BUG-4821 to backend dev — investigate CORS on OAuth callback endpoint',
      'Reproduce Safari 17.x OAuth failure in local development environment',
      'Deploy fix to staging and notify QA team once resolved',
    ],
    confidence: 0.94,
    source: 'cache',
  },
  email_007: {
    emailId: 'email_007',
    priority: 'Urgent',
    summary: [
      'VIP enterprise client demanding urgent resolution after 4-hour platform outage',
      'Client estimates $50,000 in lost productivity and two client escalations',
      'Requires incident report within 24 hours, credit, and VP Engineering call this week',
    ],
    replyDraft: 'Dear Diana,\n\nI sincerely apologise for the disruption caused by last Thursday\'s platform outage. I fully understand the impact this has had on your team and your clients.\n\nI am personally escalating this to our VP of Engineering today. You can expect a full incident report within 24 hours, and I will arrange a call with our VP this week. A service credit will also be applied to your account.',
    calendarEvent: {
      title: 'Escalation Call — Diana Chen, Enterprise Client Corp',
      date: '2026-03-25',
      time: '10:00',
      attendees: ['diana.chen@enterprise-client.com'],
      location: 'Video call',
    },
    taskList: [
      'Escalate to VP of Engineering — schedule call with Diana Chen this week',
      'Prepare and send full incident report within 24 hours',
      'Process service credit for downtime and confirm with billing team',
    ],
    confidence: 0.96,
    source: 'cache',
  },
  email_008: {
    emailId: 'email_008',
    priority: 'Requires Action',
    summary: [
      'Candidate Yusuf Al-Rashid following up after Senior Frontend Engineer interview',
      'Reaffirms strong interest — 6 years React, TypeScript, and performance optimisation',
      'Waiting for an update on the hiring process or next steps',
    ],
    replyDraft: 'Dear Yusuf,\n\nThank you for following up and for your continued interest in the Senior Frontend Engineer position.\n\nWe genuinely enjoyed our technical discussion with you and are currently in the final stages of our review. We expect to have an update for you by the end of this week.',
    calendarEvent: { title: null, date: null, time: null, attendees: [], location: null },
    taskList: [
      'Review hiring decision status for Senior Frontend Engineer role',
      'Reply to Yusuf Al-Rashid with a timeline for decision by end of week',
      'Coordinate with hiring manager on final candidate comparison',
    ],
    confidence: 0.89,
    source: 'cache',
  },
  email_009: {
    emailId: 'email_009',
    priority: 'FYI',
    summary: [
      'Incident #4521 fully resolved — all services operational as of 06:00 UTC today',
      'Root cause was database connection pool exhaustion during scheduled maintenance',
      'No further action required — informational update only',
    ],
    replyDraft: 'Thank you for the status update — glad to hear all systems are fully operational again.',
    calendarEvent: { title: null, date: null, time: null, attendees: [], location: null },
    taskList: [
      'Review full incident report when available for post-mortem log',
      'Confirm engineering team has adjusted connection pool limits',
      'File incident #4521 in quarterly review log',
    ],
    confidence: 0.93,
    source: 'cache',
  },
  email_010: {
    emailId: 'email_010',
    priority: 'Urgent',
    summary: [
      'Legal counsel requires signature on three documents — NDA expires March 25',
      'Missing NDA deadline risks voiding the Henderson deal entirely',
      'All three documents require DocuSign e-signature — link sent separately',
    ],
    replyDraft: 'Dear Sarah,\n\nThank you for the reminder. I am reviewing all three documents now and will complete the DocuSign signatures immediately.\n\nI understand the urgency around the NDA deadline on March 25th and the GDPR compliance requirement. I will ensure all three are signed and returned to you today.',
    calendarEvent: {
      title: 'DocuSign Deadline — NDA and DPA Signatures Due',
      date: '2026-03-24',
      time: '09:00',
      attendees: ['legal@lawfirm.com'],
      location: null,
    },
    taskList: [
      'Sign NDA Amendment for Henderson Partnership via DocuSign — expires March 25',
      'Sign Data Processing Agreement for EU GDPR compliance — deadline March 28',
      'Sign IP Assignment Agreement for Q2 contractor onboarding',
    ],
    confidence: 0.98,
    source: 'cache',
  },
};
