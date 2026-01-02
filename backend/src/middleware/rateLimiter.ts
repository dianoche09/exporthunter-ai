/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { AuthRequest } from './auth';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful requests (optional)
  skipSuccessfulRequests: false,
});

/**
 * Stricter rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many login attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * AI endpoint rate limiter
 * Dynamic limit based on user subscription
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req: Request) => {
    // Dynamic limit based on subscription
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return 5; // Unauthenticated users get 5 requests
    }

    const limits: Record<string, number> = {
      free: 10,
      pro: 100,
      enterprise: 1000
    };

    return limits[authReq.user.subscription] || limits.free;
  },
  message: {
    success: false,
    error: {
      message: 'AI request limit exceeded for your subscription plan.',
      code: 'AI_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID as key instead of IP for authenticated requests
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest;
    return authReq.user?._id?.toString() || req.ip;
  }
});

/**
 * Email sending rate limiter
 * Prevents email spam
 */
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req: Request) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return 10;
    }

    const limits: Record<string, number> = {
      free: 50,
      pro: 500,
      enterprise: 5000
    };

    return limits[authReq.user.subscription] || limits.free;
  },
  message: {
    success: false,
    error: {
      message: 'Email sending limit exceeded for your subscription plan.',
      code: 'EMAIL_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest;
    return authReq.user?._id?.toString() || req.ip;
  }
});

