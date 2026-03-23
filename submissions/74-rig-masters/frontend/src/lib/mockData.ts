export interface Email {
  id: string;
  sender: { name: string; avatar: string; email: string };
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  intent?: 'neutral' | 'urgent' | 'minimal';
  body: string;
}

export const emails: Email[] = [
  {
    id: '1',
    sender: { name: 'Sarah Drasner', email: 'sarah@example.com', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    subject: 'Q3 Product Roadmap Review',
    snippet: 'Here is the draft for the Q3 roadmap. Please review the highlighted sections before tomorrow\'s sync.',
    date: '10:42 AM',
    isRead: false,
    isStarred: true,
    intent: 'urgent',
    body: 'Hi Team,\n\nHere is the draft for the Q3 roadmap. Please review the highlighted sections before tomorrow\'s sync.\n\nKey areas of focus:\n1. Revamped Design System integration\n2. AI feature rollout phase 1\n3. Performance optimizations\n\nLooking forward to the feedback.',
  },
  {
    id: '2',
    sender: { name: 'Alex T.', email: 'alex@example.com', avatar: 'https://i.pravatar.cc/150?u=alex' },
    subject: 'Figma Library Updates',
    snippet: 'The transparent glass tokens have been updated in the library. Sync your files.',
    date: 'Yesterday',
    isRead: true,
    isStarred: false,
    intent: 'minimal',
    body: 'Hey,\n\nThe transparent glass tokens have been updated in the library. Sync your files when you get a chance. They look great on the dark theme.\n\nCheers,\nAlex',
  },
  {
    id: '3',
    sender: { name: 'GitHub', email: 'noreply@github.com', avatar: 'https://i.pravatar.cc/150?u=github' },
    subject: '[InferMail/core] Security vulnerability alert',
    snippet: 'We found a potential security vulnerability in one of your dependencies.',
    date: 'Yesterday',
    isRead: true,
    isStarred: false,
    intent: 'urgent',
    body: 'We found a potential security vulnerability in one of your dependencies. Please check the security tab for more details and upgrade the package versions.',
  },
  {
    id: '4',
    sender: { name: 'Vercel', email: 'noreply@vercel.com', avatar: 'https://i.pravatar.cc/150?u=vercel' },
    subject: 'Deployment successful',
    snippet: 'Your production deployment for infermail is ready.',
    date: 'Oct 12',
    isRead: true,
    isStarred: false,
    intent: 'neutral',
    body: 'Your production deployment for infermail is ready.\n\nVisit url: https://infermail.vercel.app',
  },
  {
    id: '5',
    sender: { name: 'Google Payments', email: 'payments-noreply@google.com', avatar: 'https://i.pravatar.cc/150?u=google' },
    subject: 'Your India tax info has been accepted',
    snippet: 'Google Your India tax information has been accepted and is now verified.',
    date: '1:39 PM',
    isRead: false,
    isStarred: true,
    intent: 'urgent',
    body: 'Your India tax information has been accepted.\n\nThank you for providing your information. No further action is required.',
  },
  {
    id: '6',
    sender: { name: 'Google Cloud', email: 'payments-noreply@google.com', avatar: 'https://i.pravatar.cc/150?u=google' },
    subject: 'We\'ve received your payment',
    snippet: 'Google Cloud Platform & APIs: We\'ve received your payment ...',
    date: '1:37 PM',
    isRead: true,
    isStarred: false,
    intent: 'neutral',
    body: 'We received your payment.\n\nThank you for using Google Cloud Platform.',
  },
  {
    id: '7',
    sender: { name: 'Google Cloud', email: 'payments-noreply@google.com', avatar: 'https://i.pravatar.cc/150?u=google' },
    subject: 'Your prepayment was successful',
    snippet: 'Google Cloud Platform & APIs: Your prepayment was successful ...',
    date: '1:36 PM',
    isRead: true,
    isStarred: false,
    intent: 'neutral',
    body: 'Your prepayment was successful.\n\nYour account balance has been updated.',
  },
  {
    id: '8',
    sender: { name: 'Team Snapchat', email: 'no-reply@snapchat.com', avatar: 'https://i.pravatar.cc/150?u=snap' },
    subject: 'You\'ve got a Memory to look back on',
    snippet: 'On March 21, 2022.... Take a look at your Memories.',
    date: 'Mar 21',
    isRead: false,
    isStarred: false,
    intent: 'minimal',
    body: 'You have a Memory to look back on!\n\nOpen Snapchat to see what you were up to on this day.',
  },
  {
    id: '9',
    sender: { name: 'GitHub', email: 'noreply@github.com', avatar: 'https://i.pravatar.cc/150?u=github2' },
    subject: '[GitHub] Vercel is requesting updated permissions',
    snippet: 'Updated Permissions Request The GitHub Application Vercel is requesting updated permissions...',
    date: 'Mar 20',
    isRead: true,
    isStarred: true,
    intent: 'urgent',
    body: 'The GitHub Application Vercel is requesting updated permissions.\n\nPlease review the requested permissions and approve them if appropriate.',
  },
  {
    id: '10',
    sender: { name: 'Firebase', email: 'firebase-noreply@google.com', avatar: 'https://i.pravatar.cc/150?u=firebase' },
    subject: '[Action Advised] Migrate Firebase Studio projects',
    snippet: 'Transfer your work to Google Cloud to ensure uninterrupted access.',
    date: 'Mar 19',
    isRead: true,
    isStarred: false,
    intent: 'urgent',
    body: 'Migrate Firebase Studio projects by Mar 22, 2027.\n\nTransfer your work to Google Cloud to ensure uninterrupted access after the deprecation date.',
  },
  {
    id: '11',
    sender: { name: 'YouTube Creators', email: 'no-reply@youtube.com', avatar: 'https://i.pravatar.cc/150?u=youtube' },
    subject: 'Your February month in review is here',
    snippet: 'Your latest YouTube updates and insights for the month of February.',
    date: 'Mar 19',
    isRead: true,
    isStarred: false,
    intent: 'minimal',
    body: 'Your February month in review is here.\n\nCheck out your latest YouTube updates and insights for the month of February.',
  },
  {
    id: '12',
    sender: { name: 'Google AI Studio', email: 'ai-studio@google.com', avatar: 'https://i.pravatar.cc/150?u=aistudio' },
    subject: '[Billing Update] Gemini API usage tier updates',
    snippet: 'Review your pricing tier as billing caps take effect starting Apr 2026.',
    date: 'Mar 19',
    isRead: false,
    isStarred: true,
    intent: 'neutral',
    body: 'Gemini API usage tier updates and billing caps starting Apr 2026.\n\nReview your pricing tier as billing caps take effect starting Apr 2026.',
  }
];

export const calendarEvents = [
  { id: 1, title: 'Design Sync', time: '10:00 AM - 11:00 AM', color: 'bg-[#42447b]', date: 'Oct 14' },
  { id: 2, title: 'Product Roadmap Review', time: '1:00 PM - 2:00 PM', color: 'bg-[#93000a]', date: 'Oct 14' },
  { id: 3, title: 'Weekly Standup', time: '4:00 PM - 4:30 PM', color: 'bg-[#171f33]', date: 'Oct 14' },
];
