import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Global rate limiter: caps requests per IP within a sliding window.
 * Returns 429 Too Many Requests with a Retry-After header when exceeded.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // default: 60 seconds
  max: env.RATE_LIMIT_MAX,            // default: 60 requests per window
  standardHeaders: true,              // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,               // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please try again later.',
    },
  },
  handler: (req, res, _next, options) => {
    console.warn(`[RateLimit] IP ${req.ip} exceeded limit`);
    res.status(options.statusCode).json(options.message);
  },
});
