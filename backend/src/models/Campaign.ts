import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  emailSubject?: string;
  body: string;
  status: 'draft' | 'scheduled' | 'active' | 'sending' | 'completed' | 'paused';
  scheduledAt?: Date;
  leads: mongoose.Types.ObjectId[];
  stats: {
    totalRecipients: number;
    sentCount: number;
    openedCount: number;
    clickedCount: number;
    repliedCount: number;
    sent?: number;
    opened?: number;
    clicked?: number;
    replied?: number;
    failed?: number;
    openRate?: number;
    clickRate?: number;
    replyRate?: number;
  };
  settings?: {
    followUpEnabled?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  emailSubject: { type: String },
  body: { type: String, required: true },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'sending', 'completed', 'paused'],
    default: 'draft'
  },
  scheduledAt: { type: Date },
  leads: [{ type: Schema.Types.ObjectId, ref: 'Lead' }],
  stats: {
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    clickedCount: { type: Number, default: 0 },
    repliedCount: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    replyRate: { type: Number, default: 0 }
  },
  settings: {
    followUpEnabled: { type: Boolean, default: false }
  }
}, { timestamps: true });

campaignSchema.index({ userId: 1, status: 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
