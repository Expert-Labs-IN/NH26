import Email from '../models/Email.js';
import { processEmailTriage } from '../services/aiService.js';

export const getEmails = async (req, res) => {
  try {
    const emails = await Email.find().sort({ received_at: -1, timestamp: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

export const getEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await Email.findOne({ id }) || await Email.findById(id).catch(() => null);
    if (!email) return res.status(404).json({ error: 'Email not found' });
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email' });
  }
};

export const triageEmail = async (req, res) => {
  try {
    const { id } = req.params;
    
    let email = await Email.findOne({ id }) || await Email.findById(id).catch(() => null);
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const start = Date.now();
    const aiSuggestedActions = await processEmailTriage(email);
    const latency_ms = Date.now() - start;

    // Update email record with triage data
    email.triage = {
      summary: aiSuggestedActions.summary,
      priority: aiSuggestedActions.priority,
      status: 'pending',
      suggestedAction: aiSuggestedActions.suggestedAction,
      reasoning: aiSuggestedActions.reasoning,
      latency_ms
    };

    await email.save();
    
    res.json({ message: 'Triage completed successfully', data: email });
  } catch (error) {
    console.error('Triage Error:', error);
    res.status(500).json({ error: 'Failed to triage email', details: error.message });
  }
};

export const approveAction = async (req, res) => {
  try {
    const { actionId } = req.body;
    if (!actionId) return res.status(400).json({ error: 'actionId is required' });

    let email = await Email.findOne({ id: actionId }) || await Email.findById(actionId).catch(() => null);

    if (!email) return res.status(404).json({ error: 'Email/Action not found' });

    if (!email.triage || !email.triage.status) {
      return res.status(400).json({ error: 'Email has not been triaged yet' });
    }

    email.triage.status = 'approved';
    await email.save();

    res.json({ message: 'Action approved successfully', data: email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve action' });
  }
};

export const ignoreAction = async (req, res) => {
  try {
    const { id } = req.params;

    let email = await Email.findOne({ id }) || await Email.findById(id).catch(() => null);

    if (!email) return res.status(404).json({ error: 'Email not found' });

    if (!email.triage) email.triage = {};
    email.triage.status = 'ignored';
    await email.save();

    res.json({ message: 'Email ignored', data: email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ignore email' });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await Email.countDocuments();
    const urgent = await Email.countDocuments({ 'triage.priority': 'Urgent' });
    const actionRequired = await Email.countDocuments({ 'triage.priority': 'Action Required' });
    const fyi = await Email.countDocuments({ 'triage.priority': 'FYI' });
    const triaged = await Email.countDocuments({ 'triage.summary': { $exists: true, $ne: [] } });
    const approved = await Email.countDocuments({ 'triage.status': 'approved' });
    const ignored = await Email.countDocuments({ 'triage.status': 'ignored' });

    // Average latency
    const latencyResult = await Email.aggregate([
      { $match: { 'triage.latency_ms': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$triage.latency_ms' } } }
    ]);

    res.json({
      total,
      triaged,
      pending: triaged - approved - ignored,
      approved,
      ignored,
      byPriority: { urgent, actionRequired, fyi },
      avgLatencyMs: latencyResult[0]?.avg?.toFixed(0) || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
