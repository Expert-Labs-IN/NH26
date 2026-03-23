import { Router } from 'express';
import { z } from 'zod';
import type { ActionRecord } from '../types';
import { isAuthenticated } from '../services/tokenStore';
import { isGoogleAuthenticated } from '../services/googleTokenStore';
import { sendReply, createCalendarEvent, createTasks } from '../services/graphService';
import {
  sendGmailReply,
  createGoogleCalendarEvent,
  createGoogleTasks,
} from '../services/gmailService';
import { getGoogleTokens } from '../services/googleTokenStore';

const router = Router();
const actionLog: ActionRecord[] = [];

const ApproveSchema = z.object({
  actionId: z.string().min(1),
  emailId: z.string().min(1),
  type: z.enum(['reply', 'calendar', 'task']),
  payload: z.record(z.unknown()),
  fromAddress: z.string().optional(),
  emailSubject: z.string().optional(),
  threadId: z.string().optional(),
  messageId: z.string().optional(),
  timeZone: z.string().optional(),
});

/**
 * POST /api/actions/approve
 * Executes via Gmail → Outlook → demo mode (in that priority order).
 */
router.post('/approve', async (req, res) => {
  const parsed = ApproveSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'INVALID_REQUEST', details: parsed.error.flatten() });
  }

  const { actionId, emailId, type, payload, fromAddress, emailSubject, threadId, messageId, timeZone } = parsed.data;
  const executedAt = new Date().toISOString();

  // ── Execute via Gmail ──────────────────────────────────────────────────────
  if (isGoogleAuthenticated()) {
    try {
      const googleTokens = getGoogleTokens();
      const senderEmail = googleTokens?.userEmail ?? '';

      if (type === 'reply' && fromAddress) {
        await sendGmailReply({
          toAddress: fromAddress,
          subject: emailSubject ?? 'Re: Your email',
          body: String(payload.body ?? ''),
          fromEmail: senderEmail,
          threadId,
          inReplyToMessageId: messageId,
        });
        console.log(`[actions] ✉️  Gmail reply sent to ${fromAddress}`);
      } else if (type === 'calendar') {
        const p = payload as { title: string; date: string; time: string; attendees: string[]; location: string | null };
        if (p.title && p.date && p.time) {
          await createGoogleCalendarEvent({ title: p.title, date: p.date, time: p.time, attendees: p.attendees ?? [], location: p.location, timeZone });
          console.log(`[actions] 📅 Google Calendar event created: ${p.title}`);
        }
      } else if (type === 'task') {
        const tasks = payload.tasks as string[] | undefined;
        if (tasks?.length) {
          await createGoogleTasks(tasks);
          console.log(`[actions] ✅ ${tasks.length} Google Tasks created`);
        }
      }

      actionLog.push({ actionId, emailId, type, payload, executedAt });
      return res.json({
        success: true, actionId, status: 'executed', executedAt,
        message: getSuccessMessage(type, 'gmail'), mode: 'gmail',
      });
    } catch (err) {
      console.error(`[actions] Gmail execution failed for ${type}:`, (err as Error).message);
      return res.status(500).json({
        error: 'EXECUTION_FAILED',
        message: `Gmail ${type} failed: ${(err as Error).message}`,
      });
    }
  }

  // ── Execute via Outlook ────────────────────────────────────────────────────
  if (isAuthenticated()) {
    try {
      if (type === 'reply' && fromAddress) {
        await sendReply({ toAddress: fromAddress, subject: emailSubject ?? 'Re: Your email', body: String(payload.body ?? '') });
        console.log(`[actions] ✉️  Outlook reply sent to ${fromAddress}`);
      } else if (type === 'calendar') {
        const p = payload as { title: string; date: string; time: string; attendees: string[]; location: string | null };
        if (p.title && p.date && p.time) {
          await createCalendarEvent({ title: p.title, date: p.date, time: p.time, attendees: p.attendees ?? [], location: p.location, timeZone });
          console.log(`[actions] 📅 Outlook Calendar event created: ${p.title}`);
        }
      } else if (type === 'task') {
        const tasks = payload.tasks as string[] | undefined;
        if (tasks?.length) {
          await createTasks(tasks);
          console.log(`[actions] ✅ ${tasks.length} Outlook Tasks created`);
        }
      }

      actionLog.push({ actionId, emailId, type, payload, executedAt });
      return res.json({
        success: true, actionId, status: 'executed', executedAt,
        message: getSuccessMessage(type, 'outlook'), mode: 'outlook',
      });
    } catch (err) {
      console.error(`[actions] Outlook execution failed for ${type}:`, (err as Error).message);
      return res.status(500).json({
        error: 'EXECUTION_FAILED',
        message: `Outlook ${type} failed: ${(err as Error).message}`,
      });
    }
  }

  // ── Demo mode ──────────────────────────────────────────────────────────────
  actionLog.push({ actionId, emailId, type, payload, executedAt });
  console.log(`[actions] 📝 Demo: ${type} logged for ${emailId}`);
  return res.json({
    success: true, actionId, status: 'executed', executedAt,
    message: `${type} approved and logged (connect Gmail or Outlook to execute for real).`,
    mode: 'demo',
  });
});

function getSuccessMessage(type: string, provider: string): string {
  const app = provider === 'gmail' ? 'Gmail' : 'Outlook';
  if (type === 'reply') return `Reply sent from your ${app} account.`;
  if (type === 'calendar') return `Event added to your ${app === 'Gmail' ? 'Google' : 'Outlook'} Calendar.`;
  if (type === 'task') return `Tasks created in your ${app === 'Gmail' ? 'Google Tasks' : 'Microsoft To-Do'}.`;
  return 'Action executed.';
}

router.get('/', (_req, res) => {
  res.json({ actions: actionLog, total: actionLog.length });
});

export default router;


