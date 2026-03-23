import type { ErrorRequestHandler } from 'express';

/**
 * Global error handler — catches any unhandled errors from routes.
 * Must be registered AFTER all routes with app.use(errorHandler).
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[error]', err);

  const status = (err as { status?: number }).status ?? 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err as Error).message ?? 'Unknown error';

  res.status(status).json({
    error: 'INTERNAL_ERROR',
    message,
  });
};
