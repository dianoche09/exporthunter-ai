import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'lead_discovery' | 'campaign_sent' | 'login' | 'export' | 'search';
    description: string;
    metadata?: any;
    createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);

export interface ISearchHistory extends Document {
    userId: mongoose.Types.ObjectId;
    query: {
        product: string;
        industries?: string[];
        markets?: string[];
    };
    resultCount: number;
    createdAt: Date;
}

const searchHistorySchema = new Schema<ISearchHistory>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    query: {
        product: String,
        industries: [String],
        markets: [String]
    },
    resultCount: { type: Number, default: 0 }
}, { timestamps: true });

export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);
