import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import triageRouter from './routes/triage';
import emailsRouter from './routes/emails';
import actionsRouter from './routes/actions';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import authGoogleRouter from './routes/authGoogle';
import { triageLimiter, generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// ─── Config ───────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Only allows requests from the frontend origin.
// In development, also allows localhost:5173 by default.

const allowedOrigins = NODE_ENV === 'production'
  ? [ALLOWED_ORIGIN]
  : [ALLOWED_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[cors] Blocked request from origin: ${origin}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── General rate limiter (all routes) ───────────────────────────────────────

app.use('/api', generalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check — no rate limiting applied
app.use('/api/health', healthRouter);

// Auth — Microsoft OAuth
app.use('/api/auth', authRouter);

// Auth — Google OAuth
app.use('/api/auth/google', authGoogleRouter);

// Emails list
app.use('/api/emails', emailsRouter);

// Triage — stricter rate limit (30 per 15 min)
app.use('/api/triage', triageLimiter, triageRouter);

// Action approval
app.use('/api/actions', actionsRouter);

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║       TriageAI Backend — Running       ║
╠════════════════════════════════════════╣
║  Port    : ${PORT}                        ║
║  Env     : ${NODE_ENV.padEnd(10)}               ║
║  Origin  : ${ALLOWED_ORIGIN.slice(0, 22).padEnd(22)}  ║
╠════════════════════════════════════════╣
║  GET  /api/health                      ║
║  GET  /api/emails                      ║
║  POST /api/triage                      ║
║  POST /api/actions/approve             ║
╚════════════════════════════════════════╝
  `);
  console.log(`[server] Ollama model: ${process.env.OLLAMA_MODEL ?? 'qwen2.5:7b'}`);
  console.log(`[server] Groq key set: ${!!process.env.GROQ_API_KEY}`);
  console.log(`[server] Microsoft OAuth: ${process.env.MICROSOFT_CLIENT_ID ? '✅ configured' : '⚠️  not configured'}`);
  console.log(`[server] Google OAuth:    ${process.env.GOOGLE_CLIENT_ID ? '✅ configured' : '⚠️  not configured'}`);
});

export default app;
