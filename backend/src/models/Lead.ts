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
  aiReasoning?: string;
  potentialProducts?: string[];
  emailSource?: 'website' | 'predicted' | 'database';
  validationStatus?: 'valid' | 'invalid' | 'unknown';
  analysis?: {
    matchSummary?: string;
    buyingSignals?: string[];
    potentialUseCases?: string[];
    supplyChainIntel?: {
      competitorName?: string;
      competitorWeaknesses?: string[];
      ourAdvantages?: string[];
      pitch?: string;
    };
  };
  nextStep?: string;
  nextStepDate?: Date;
  lastInteractionAt?: Date;
  lastInteractionType?: 'email' | 'call' | 'meeting' | 'linkedin';
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
  aiScore: { type: Number, default: 0, min: 0, max: 100 },
  aiReasoning: { type: String },
  potentialProducts: [{ type: String }],
  emailSource: { type: String, enum: ['website', 'predicted', 'database'], default: 'website' },
  validationStatus: { type: String, enum: ['valid', 'invalid', 'unknown'], default: 'unknown' },
  analysis: {
    matchSummary: String,
    buyingSignals: [String],
    potentialUseCases: [String],
    supplyChainIntel: {
      competitorName: String,
      competitorWeaknesses: [String],
      ourAdvantages: [String],
      pitch: String
    }
  },
  // Sales Cockpit Fields
  nextStep: { type: String },
  nextStepDate: { type: Date },
  lastInteractionAt: { type: Date },
  lastInteractionType: { type: String, enum: ['email', 'call', 'meeting', 'linkedin'] }
}, { timestamps: true });

leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ email: 1 });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
