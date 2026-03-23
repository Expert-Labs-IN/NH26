USE inboxai;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE email_threads;
TRUNCATE TABLE triage_results;
TRUNCATE TABLE approved_actions;
TRUNCATE TABLE spam_reports;
TRUNCATE TABLE emails;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Insert all 20 emails ─────────────────────────────────────

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e001', 'rajesh.mehta@bigclient.com', 'Rajesh Mehta', 'you@company.com',
 'URGENT: Contract renewal deadline — final extension',
 'Hi,\n\nThis is a final reminder that our enterprise contract (#ENT-2024-8821) expires on March 28, 2026. We\'ve been waiting for your team\'s sign-off for two weeks now. If we do not receive a signed copy by EOD Friday, we will be forced to suspend services and escalate to legal.\n\nPlease treat this as the highest priority. I need a confirmed meeting with your legal and finance team before Thursday to go over the revised terms.\n\nRajesh Mehta\nVP Partnerships, BigClient Inc.',
 '2026-03-23 08:14:00', 1, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e002', 'noreply@calendly.com', 'Calendly', 'you@company.com',
 'New meeting scheduled: Product sync with Priya Sharma — Tuesday 25 Mar, 3:00 PM',
 'Priya Sharma has scheduled a meeting with you.\n\nEvent: Q2 Product Roadmap Sync\nDate: Tuesday, March 25, 2026\nTime: 3:00 PM – 4:00 PM IST\nLocation: Google Meet — meet.google.com/abc-defg-hij\n\nAdded to your Google Calendar automatically. Reply to this email if you need to reschedule.',
 '2026-03-23 09:02:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e003', 'hr@company.com', 'HR Team', 'all@company.com',
 'Action required: Submit your Q1 self-assessment by March 31',
 'Hi team,\n\nThis is a reminder that Q1 performance self-assessments are due by March 31, 2026.\n\nPlease complete the following:\n1. Fill out the self-assessment form on Workday\n2. List your top 3 achievements for Q1\n3. Identify 2 areas of improvement\n4. Nominate a peer reviewer\n5. Schedule a 1:1 with your manager before April 5\n\nLog in at workday.company.com to get started.',
 '2026-03-22 14:30:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e004', 'ananya.iyer@partner.org', 'Ananya Iyer', 'you@company.com',
 'Re: Re: Re: Integration API keys — still broken',
 'Hey,\n\nFollowing up again on this. It\'s been 6 days since I first reported the issue and our integration is still down. Our dev team has checked on their end and confirmed it is definitely an API key/permission issue on your side.\n\nWe\'re losing data every hour this is not resolved. Can someone PLEASE escalate this to your engineering team today?\n\n— Ananya',
 '2026-03-23 10:55:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e005', 'newsletter@productdigest.io', 'Product Digest', 'you@company.com',
 'This week in product: AI agents, Figma updates & the death of the PRD',
 'Good morning!\n\nHere\'s your weekly digest:\n\n• OpenAI launches GPT-5 with native tool use\n• Figma rolls out AI-powered layout suggestions\n• Is the traditional PRD dead? 3 PMs weigh in\n• Notion vs Linear: Which wins for eng teams?\n\nRead the full stories at productdigest.io/this-week\n\nUnsubscribe | Manage preferences',
 '2026-03-23 07:00:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e006', 'cfo@company.com', 'Deepak Rao (CFO)', 'you@company.com',
 'Budget approval needed — Q2 marketing spend ($48,000)',
 'Hi,\n\nWe need your sign-off on the Q2 marketing budget before we can release funds. Key line items:\n\n- Digital ads (Google/Meta): $22,000\n- Conference sponsorship (SaaSConf 2026): $15,000\n- Content production: $11,000\n\nTotal: $48,000 — within the approved annual envelope.\n\nPlease approve or send back with comments by Wednesday EOD.\n\nThanks,\nDeeepak',
 '2026-03-23 11:20:00', 1, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e007', 'support-bot@aws.amazon.com', 'AWS Billing', 'you@company.com',
 'Your AWS bill for February 2026: $3,847.22',
 'Your AWS statement for February 2026 is ready.\n\nTotal charges: $3,847.22\nDue date: March 30, 2026\nPayment method: Visa ending 4242\n\nTop services by cost:\n- EC2: $1,920.00\n- RDS: $890.00\n- S3: $412.00\n- Data Transfer: $325.22\n- CloudFront: $300.00\n\nView full invoice at aws.amazon.com/billing',
 '2026-03-22 06:00:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e008', 'vikram.nair@startup.io', 'Vikram Nair', 'you@company.com',
 'Quick intro + potential partnership opportunity',
 'Hi,\n\nI\'m Vikram, co-founder at Startup.io — we build AI-powered customer analytics tools for B2B SaaS companies.\n\nI came across your product at SaaSConf last month and think there\'s a strong integration opportunity between our platforms. We already integrate with 12 tools in your space.\n\nWould you be open to a 20-minute intro call next week?\n\nBest,\nVikram',
 '2026-03-23 13:10:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e009', 'legal@compliancehq.com', 'ComplianceHQ Legal', 'you@company.com',
 'GDPR audit notice — response required within 14 days',
 'Dear Data Controller,\n\nThis notice is to inform you that ComplianceHQ has initiated a routine GDPR audit of your data processing activities.\n\nYou are required to provide the following within 14 days:\n1. A copy of your current data processing register\n2. Evidence of consent mechanisms for EU users\n3. Your Data Protection Officer contact details\n4. Records of any data breaches in the past 12 months\n\nFailure to respond may result in escalation to the relevant supervisory authority.\n\nComplianceHQ Legal Team',
 '2026-03-22 09:15:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e010', 'sara.chen@investor.vc', 'Sara Chen', 'you@company.com',
 'Re: Series B — term sheet ready for review',
 'Hi,\n\nGreat news — the partnership has approved the term sheet.\n\nKey terms:\n- Valuation: $42M pre-money\n- Investment: $8M\n- Lead: Horizon Ventures\n- Board seat: Yes (1 observer)\n- Pro-rata rights: Yes\n\nOur legal team will reach out to yours directly to schedule a call this week. Please review and flag any questions by Thursday.\n\nExcited to move forward!\n\nSara Chen\nPrincipal, Horizon Ventures',
 '2026-03-23 08:45:00', 1, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e011', 'noreply@github.com', 'GitHub', 'you@company.com',
 'Security alert: vulnerable dependency found in email-triage',
 'GitHub has detected a vulnerability in a dependency used by your repository email-triage.\n\nSeverity: HIGH\nPackage: express (4.18.3)\nVulnerability: Prototype pollution via query string parsing\nRecommended fix: Upgrade to express@4.19.0 or later\n\nThis vulnerability could allow an attacker to modify object prototypes. We recommend updating as soon as possible.',
 '2026-03-23 06:30:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e012', 'meera.pillai@enterprise.co', 'Meera Pillai', 'you@company.com',
 'Onboarding call — can we move to Thursday 10AM?',
 'Hi there,\n\nHope you\'re well! I wanted to check if we could reschedule our onboarding call from Wednesday 2PM to Thursday March 26 at 10:00 AM IST?\n\nOur CTO just flagged a conflict on Wednesday and Thursday works better for the whole team.\n\nZoom link stays the same: zoom.us/j/987654321\n\nPlease confirm and I\'ll update the calendar invite.\n\nThanks!\nMeera',
 '2026-03-23 12:00:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e013', 'digest@hackernews.com', 'Hacker News Digest', 'you@company.com',
 'Top stories: LLMs in production, Rust 2.0, and why startups fail',
 'Today\'s top stories on Hacker News:\n\n1. The hidden costs of running LLMs in production (1.2k points)\n2. Rust 2.0 RFC: What\'s changing and why (987 points)\n3. Why 90% of well-funded startups still fail — a post-mortem (876 points)\n4. I built a $10k/month SaaS in 3 months (754 points)\n5. Google\'s new TPU v5 benchmarks are wild (621 points)\n\nRead at news.ycombinator.com',
 '2026-03-23 06:00:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e014', 'arjun.sharma@clientco.com', 'Arjun Sharma', 'you@company.com',
 'Invoice #2026-034 overdue — payment reminder',
 'Dear Team,\n\nThis is a friendly reminder that invoice #2026-034 for $12,500 was due on March 15, 2026 and remains unpaid.\n\nInvoice details:\n- Services: Platform integration (February 2026)\n- Amount: $12,500.00\n- Due date: March 15, 2026\n- Days overdue: 8\n\nPlease process the payment at your earliest convenience.\n\nArjun Sharma\nFinance, ClientCo',
 '2026-03-23 10:00:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e015', 'team@figma.com', 'Figma', 'you@company.com',
 'Your Figma subscription renews in 7 days — update billing',
 'Hi,\n\nYour Figma Professional plan renews on March 30, 2026.\n\nPlan: Professional (5 editors)\nAmount: $225.00/month\nPayment method: Visa ending 4242\n\nIf you\'d like to make any changes to your plan or billing information before renewal, visit figma.com/billing.\n\nThank you for using Figma!',
 '2026-03-22 11:00:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e016', 'nisha.kapoor@techrecruit.io', 'Nisha Kapoor', 'you@company.com',
 'Exciting opportunity: VP Engineering at a Series B AI startup',
 'Hi,\n\nI came across your profile and wanted to reach out about an exciting leadership opportunity.\n\nOur client is a well-funded AI startup (Series B, $40M raised) looking for a VP of Engineering to lead a 30-person team.\n\nKey details:\n- Role: VP Engineering\n- Location: Remote-first (India/Singapore)\n- Comp: ₹1.2–1.8 Cr + equity\n- Stage: Series B, growing fast\n\nWould you be open to a confidential 15-minute conversation?\n\nBest,\nNisha Kapoor\nTechRecruit.io',
 '2026-03-22 15:30:00', 0, 0);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e017', 'no-reply@winner-notify2026.net', 'Prize Notification Center', 'you@company.com',
 'CONGRATULATIONS! You have been selected — claim your $50,000 prize NOW',
 'CONGRATULATIONS!!!\n\nYour email has been randomly selected as our GRAND PRIZE WINNER for March 2026!\n\nYou have WON: $50,000 USD cash prize + Apple MacBook Pro + iPhone 16 Pro Max\n\nTo claim your prize, you MUST respond within 48 hours with your full name, home address, phone number, and bank account details.\n\nClick here to claim: winner-notify2026.net/claim?id=xj291\n\nDo NOT miss this opportunity! Act NOW!',
 '2026-03-23 04:00:00', 0, 1);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e018', 'security@paypa1-verify.com', 'PayPal Security Team', 'you@company.com',
 'Your PayPal account has been LIMITED — verify immediately',
 'Dear Valued Customer,\n\nWe have detected unusual activity on your PayPal account. Your account has been LIMITED until you verify your identity.\n\nTo restore full access, click the link below and verify your information within 24 hours:\n\nVERIFY NOW: paypa1-verify.com/secure/login\n\nFailure to verify will result in permanent account suspension and loss of funds.',
 '2026-03-23 02:30:00', 0, 1);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e019', 'dr.james.wilson@inheritance-law.uk', 'Dr. James Wilson', 'you@company.com',
 'Confidential: Unclaimed inheritance of $4.7 Million — requires your assistance',
 'Dear Friend,\n\nI am Dr. James Wilson, a legal practitioner in London, UK. I am contacting you regarding the unclaimed estate of a deceased client who shares your surname.\n\nAs the deceased passed without a will, the sum of $4,700,000 USD is currently held in escrow. I require a trusted foreign partner to assist in the legal transfer of these funds.\n\nYou will receive 40% ($1,880,000) for your assistance. This transaction is 100% legal and risk-free.',
 '2026-03-22 23:00:00', 0, 1);

INSERT INTO emails (id, from_email, from_name, to_email, subject, body, received_at, is_vip, is_spam) VALUES
('e020', 'rohan.verma@designstudio.in', 'Rohan Verma', 'you@company.com',
 'Design proposal for your brand refresh — portfolio attached',
 'Hi,\n\nI\'m Rohan, a UI/UX designer with 6 years of experience working with B2B SaaS companies. I came across your product and noticed some areas where a design refresh could significantly improve conversion and user retention.\n\nMy recent work includes:\n- Dashboard redesign for FinTech startup (40% improvement in task completion)\n- Onboarding flow for HR SaaS (reduced drop-off by 28%)\n- Design system for 50-person product team\n\nWould you be open to a 20-minute call to explore this?\n\nBest,\nRohan Verma\ndesignstudio.in',
 '2026-03-23 14:00:00', 0, 0);

-- ── Thread messages ──────────────────────────────────────────
INSERT INTO email_threads (email_id, from_email, thread_date, snippet) VALUES
('e004', 'ananya.iyer@partner.org', '2026-03-20', 'Hi, any update on this?'),
('e004', 'ananya.iyer@partner.org', '2026-03-18', 'The API keys you sent aren''t working. Getting 403 Forbidden.');

SELECT CONCAT('Seeded ', COUNT(*), ' emails') AS status FROM emails;
