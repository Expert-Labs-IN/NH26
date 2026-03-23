import express from 'express';
import multer from 'multer';
import { generateCampaign, getCampaignHistory, getCampaignById, analyzeImage, parseVoice, refineContentSection, getPersonas } from '../controllers/campaign.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/generate', protect, generateCampaign);
router.post('/analyze-image', protect, upload.single('image'), analyzeImage);
router.post('/parse-voice', protect, parseVoice);
router.post('/refine', protect, refineContentSection);
router.post('/personas', protect, getPersonas);
router.get('/history', protect, getCampaignHistory);
router.get('/:id', protect, getCampaignById);

export default router;
