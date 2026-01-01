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
