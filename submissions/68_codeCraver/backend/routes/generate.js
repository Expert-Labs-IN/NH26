import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { generateCopy } from '../controllers/generateController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.single('image'), generateCopy);

export default router;
