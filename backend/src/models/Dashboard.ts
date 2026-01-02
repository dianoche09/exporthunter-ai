import mongoose from 'mongoose';

const BriefingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    greeting: String,
    summary: String,
    highlight: {
        metric: String,
        label: String
    },
    actions: [{
        label: String,
        icon: String,
        primary: Boolean,
        href: String
    }],
    createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['hot', 'opportunity', 'warning', 'insight'] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    confidenceScore: Number,
    action: {
        label: String,
        endpoint: String,
        payload: mongoose.Schema.Types.Mixed
    },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const Briefing = mongoose.model('Briefing', BriefingSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
