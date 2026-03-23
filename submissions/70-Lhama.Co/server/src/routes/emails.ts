import { Router } from 'express';
import { z } from 'zod';
import mockEmails from '../data/mockEmails.json';
import type { Email } from '../types';
import { isAuthenticated } from '../services/tokenStore';
import { isGoogleAuthenticated } from '../services/googleTokenStore';
import { fetchOutlookEmails } from '../services/graphService';
import { fetchGmailEmails } from '../services/gmailService';

const router = Router();

const QuerySchema = z.object({
  priority: z.enum(['urgent', 'action', 'fyi', 'all']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const PRIORITY_MAP: Record<string, string> = {
  urgent: 'Urgent',
  action: 'Requires Action',
  fyi: 'FYI',
};

/**
 * GET /api/emails
 * Priority: Gmail (if connected) → Outlook (if connected) → Mock data
 */
router.get('/', async (req, res) => {
  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'INVALID_QUERY', details: parsed.error.flatten() });
  }

  const { priority, limit, offset } = parsed.data;

  // ── Gmail (highest priority if connected) ─────────────────────────────────
  if (isGoogleAuthenticated()) {
    try {
      console.log('[emails] Fetching real Gmail inbox...');
      const emails = await fetchGmailEmails(limit);
      const filtered = priority !== 'all'
        ? emails.filter((e) => e.priority === PRIORITY_MAP[priority])
        : emails;
      return res.json({
        emails: filtered.slice(offset, offset + limit),
        total: filtered.length,
        hasMore: offset + limit < filtered.length,
        source: 'gmail',
      });
    } catch (err) {
      console.error('[emails] Gmail API error — trying Outlook:', (err as Error).message);
    }
  }

  // ── Outlook (if connected) ─────────────────────────────────────────────────
  if (isAuthenticated()) {
    try {
      console.log('[emails] Fetching real Outlook inbox...');
      const emails = await fetchOutlookEmails(limit);
      const filtered = priority !== 'all'
        ? emails.filter((e) => e.priority === PRIORITY_MAP[priority])
        : emails;
      return res.json({
        emails: filtered.slice(offset, offset + limit),
        total: filtered.length,
        hasMore: offset + limit < filtered.length,
        source: 'outlook',
      });
    } catch (err) {
      console.error('[emails] Outlook API error — falling back to mock:', (err as Error).message);
    }
  }

  // ── Mock fallback ──────────────────────────────────────────────────────────
  let emails = mockEmails as Email[];
  if (priority !== 'all') {
    emails = emails.filter((e) => e.priority === PRIORITY_MAP[priority]);
  }
  const total = emails.length;
  return res.json({
    emails: emails.slice(offset, offset + limit),
    total,
    hasMore: offset + limit < total,
    source: 'mock',
  });
});

export default router;


