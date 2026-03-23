import express from 'express';
import { getEmails, getEmailById, triageEmail, approveAction, ignoreAction, getStats } from '../controllers/emailController.js';

const router = express.Router();

router.get('/emails', getEmails);
router.get('/emails/:id', getEmailById);
router.post('/triage/:id', triageEmail);
router.patch('/actions/approve', approveAction);
router.patch('/emails/:id/ignore', ignoreAction);
router.get('/stats', getStats);

export default router;
