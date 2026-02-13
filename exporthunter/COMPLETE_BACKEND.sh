#!/bin/bash

echo "🔧 Backend Models, Routes, Controllers oluşturuluyor..."

cd exporthunter-ai/backend

# ===========================================
# MODELS - MongoDB Schemas
# ===========================================

cat > src/models/User.ts << 'USERMODEL'
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  company: string;
  password: string;
  role: 'user' | 'admin';
  subscription: 'free' | 'starter' | 'professional' | 'enterprise';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  company: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscription: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
USERMODEL

cat > src/models/Lead.ts << 'LEADMODEL'
import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  country: string;
  city: string;
  email: string;
  phone?: string;
  website?: string;
  industry: string;
  status: 'new' | 'contacted' | 'interested' | 'qualified' | 'customer' | 'rejected';
  source: 'ai-discovery' | 'manual' | 'import';
  tags: string[];
  notes: string;
  aiScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  industry: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'interested', 'qualified', 'customer', 'rejected'],
    default: 'new'
  },
  source: { type: String, enum: ['ai-discovery', 'manual', 'import'], default: 'manual' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  aiScore: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ email: 1 });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
LEADMODEL

cat > src/models/Campaign.ts << 'CAMPAIGNMODEL'
import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  scheduledAt?: Date;
  leads: mongoose.Types.ObjectId[];
  stats: {
    totalRecipients: number;
    sentCount: number;
    openedCount: number;
    clickedCount: number;
    repliedCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sending', 'completed', 'paused'],
    default: 'draft'
  },
  scheduledAt: { type: Date },
  leads: [{ type: Schema.Types.ObjectId, ref: 'Lead' }],
  stats: {
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    clickedCount: { type: Number, default: 0 },
    repliedCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

campaignSchema.index({ userId: 1, status: 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
CAMPAIGNMODEL

# ===========================================
# MIDDLEWARE
# ===========================================

cat > src/middleware/auth.ts << 'AUTHMIDDLEWARE'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};
AUTHMIDDLEWARE

cat > src/middleware/errorHandler.ts << 'ERRORHANDLER'
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
ERRORHANDLER

# ===========================================
# CONTROLLERS
# ===========================================

cat > src/controllers/authController.ts << 'AUTHCONTROLLER'
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, company, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      name,
      company,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          subscription: user.subscription
        },
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          subscription: user.subscription
        },
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          subscription: user.subscription
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
AUTHCONTROLLER

cat > src/controllers/leadsController.ts << 'LEADSCONTROLLER'
import { Response } from 'express';
import { Lead } from '../models/Lead';
import { AuthRequest } from '../middleware/auth';

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user._id;

    const query: any = { userId };
    if (status) query.status = status;

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const leadData = { ...req.body, userId };

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      data: { lead }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: { lead }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findOneAndDelete({ _id: id, userId });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
LEADSCONTROLLER

# ===========================================
# ROUTES
# ===========================================

cat > src/routes/auth.ts << 'AUTHROUTE'
import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

export { router as authRouter };
AUTHROUTE

cat > src/routes/leads.ts << 'LEADSROUTE'
import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead } from '../controllers/leadsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export { router as leadsRouter };
LEADSROUTE

cat > src/routes/campaigns.ts << 'CAMPAIGNSROUTE'
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ success: true, data: { campaigns: [] } });
});

export { router as campaignsRouter };
CAMPAIGNSROUTE

cat > src/routes/ai.ts << 'AIROUTE'
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Placeholder routes
router.post('/generate-email', (req, res) => {
  res.json({ success: true, data: { email: 'Generated email content...' } });
});

export { router as aiRouter };
AIROUTE

# ===========================================
# UPDATE SERVER.TS
# ===========================================

cat > src/server.ts << 'SERVERFILE'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth';
import { leadsRouter } from './routes/leads';
import { campaignsRouter } from './routes/campaigns';
import { aiRouter } from './routes/ai';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

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
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  });
};

startServer();

export { app };
SERVERFILE

echo ""
echo "✅ Backend Models, Routes, Controllers oluşturuldu!"
echo ""
echo "📦 Yapı:"
echo "  - Models: User, Lead, Campaign"
echo "  - Routes: Auth, Leads, Campaigns, AI"
echo "  - Controllers: Auth, Leads"
echo "  - Middleware: Auth, ErrorHandler"
echo ""
