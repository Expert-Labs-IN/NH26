import { Router } from 'express';
import { checkOllamaHealth } from '../services/ollamaService';
import { checkGroqHealth } from '../services/groqService';
import { getCacheSize } from '../services/cache';

const router = Router();

/**
 * GET /api/health
 * Returns status of all connected services.
 * Used for debugging during the hackathon demo.
 */
router.get('/', async (_req, res) => {
  const startTime = process.uptime();

  // Run health checks in parallel
  const [ollamaStatus, groqStatus] = await Promise.all([
    checkOllamaHealth(),
    checkGroqHealth(),
  ]);

  res.json({
    status: 'ok',
    ollama: ollamaStatus,
    groq: groqStatus,
    cache: {
      size: getCacheSize(),
    },
    uptime: Math.round(startTime),
    timestamp: new Date().toISOString(),
  });
});

export default router;
