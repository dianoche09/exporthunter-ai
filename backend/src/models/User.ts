import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  company: string;
  password: string;
  role: 'user' | 'admin';
  subscription: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  credits: number;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  apiKeys?: {
    gemini?: string;
    resend?: string;
  };
  productGroups?: Array<{
    name: string;
    hsCode: string;
    certificates?: string[];
    keywords?: string[];
    capacity?: string;
  }>;
  targetMarkets?: string[];
  country?: string;
  industry?: string;
  phone?: string;
  website?: string;
  jobTitle?: string;
  companyType?: 'manufacturer' | 'trader' | 'service_provider';
  logo?: string;
  onboardingCompleted?: boolean;
  targetCustomerProfile?: string[];
  preferredLanguage?: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  company: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscription: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripePriceId: { type: String },
  stripeCurrentPeriodEnd: { type: Date },
  credits: { type: Number, default: 50 },
  emailVerified: { type: Boolean, default: false },
  apiKeys: {
    gemini: { type: String },
    resend: { type: String }
  },
  productGroups: [{
    name: { type: String },
    hsCode: { type: String },
    certificates: [{ type: String }],
    keywords: [{ type: String }],
    capacity: { type: String }
  }],
  targetMarkets: [{ type: String }],
  country: { type: String },
  industry: { type: String },
  phone: { type: String },
  website: { type: String },
  jobTitle: { type: String },
  companyType: { type: String, enum: ['manufacturer', 'trader', 'service_provider'] },
  logo: { type: String },
  onboardingCompleted: { type: Boolean, default: false },
  targetCustomerProfile: [{ type: String }],
  preferredLanguage: { type: String, default: 'English' }
}, { timestamps: true });

// Email index is already created by unique: true option above

export const User = mongoose.model<IUser>('User', userSchema);
