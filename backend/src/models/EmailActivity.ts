import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailActivity extends Document {
  campaignId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  followUp1SentAt?: Date;
  followUp2SentAt?: Date;
  messageId?: string;
  errorMessage?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const emailActivitySchema = new Schema<IEmailActivity>({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['sent', 'opened', 'clicked', 'replied', 'bounced', 'failed'],
    default: 'sent'
  },
  sentAt: { type: Date },
  openedAt: { type: Date },
  clickedAt: { type: Date },
  repliedAt: { type: Date },
  followUp1SentAt: { type: Date },
  followUp2SentAt: { type: Date },
  messageId: { type: String },
  errorMessage: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

emailActivitySchema.index({ campaignId: 1, leadId: 1 });
emailActivitySchema.index({ status: 1 });

export const EmailActivity = mongoose.model<IEmailActivity>('EmailActivity', emailActivitySchema);
