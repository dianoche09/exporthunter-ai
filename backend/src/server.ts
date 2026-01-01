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
import followUpRouter from './routes/followUpRoutes';
import { autoFollowUpService } from './services/campaign/autoFollowUp';
import { followUpService } from './services/email/followUpService';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/track', trackingRouter);
app.use('/api/stats', statsRouter);
app.use('/api/import', importRouter);
app.use('/api/followup', followUpRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

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
