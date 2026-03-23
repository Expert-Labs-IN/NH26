import rateLimit from 'express-rate-limit';

/**
 * Rate limiter: max 30 requests per 15 minutes per IP.
 * Applied to /api/triage only — as per the API spec.
 */
export const triageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests from this IP. Maximum 30 per 15 minutes.',
  },
  handler: (req, res, _next, options) => {
    console.warn(`[rate-limit] IP ${req.ip} exceeded triage limit`);
    res.status(429).json(options.message);
  },
});

/**
 * General API rate limiter — more permissive, for all other endpoints.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests. Please slow down.',
  },
});
