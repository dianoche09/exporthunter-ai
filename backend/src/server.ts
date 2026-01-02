import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { authRouter } from './routes/auth';
import { leadsRouter } from './routes/leads';
import { campaignsRouter } from './routes/campaigns';
import { aiRouter } from './routes/ai';
import { trackingRouter } from './routes/tracking';
import { statsRouter } from './routes/stats';
import { importRouter } from './routes/import';
import { uploadRouter } from './routes/upload';
import dashboardRouter from './routes/dashboard';

import followUpRouter from './routes/followUpRoutes';
import paymentRouter from './routes/payment';
import { autoFollowUpService } from './services/campaign/autoFollowUp';
import { followUpService } from './services/email/followUpService';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter, aiLimiter, emailLimiter } from './middleware/rateLimiter';
import { connectDB } from './config/database';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Compression (removed duplicate)
app.use(compression());

// Handle raw body for Stripe webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// API Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/campaigns', emailLimiter, campaignsRouter); // Email sending routes
app.use('/api/ai', aiLimiter, aiRouter);
app.use('/api/track', trackingRouter); // No rate limit for tracking pixels
app.use('/api/stats', statsRouter);
app.use('/api/import', importRouter);
app.use('/api/dashboard', dashboardRouter);

app.use('/api/followup', emailLimiter, followUpRouter);
app.use('/api/payment', paymentRouter); // Stripe webhook needs no rate limit
app.use('/api/upload', uploadRouter);

// Serve static files (logos, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    },
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection is handled in config/database.ts

// Start server
const startServer = async () => {
  await connectDB();

  // Start auto follow-up schedulers
  autoFollowUpService.startScheduler();
  followUpService.start();
  console.log('📧 Auto follow-up schedulers started');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  });
};

startServer();

export { app };
