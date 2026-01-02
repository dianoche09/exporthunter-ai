
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { Campaign } from '../models/Campaign';
import { EmailActivity } from '../models/EmailActivity';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: 'test@exporthunter.com' });
        if (!user) {
            console.log('❌ Test user not found!');
            return;
        }

        console.log('User ID:', user._id);

        const leadCount = await Lead.countDocuments({ userId: user._id });
        const campaignCount = await Campaign.countDocuments({ userId: user._id });
        const activityCount = await EmailActivity.countDocuments({ userId: user._id });

        console.log('--------------------------------');
        console.log(`Leads for user: ${leadCount}`);
        console.log(`Campaigns for user: ${campaignCount}`);
        console.log(`Activities for user: ${activityCount}`);
        console.log('--------------------------------');

        if (leadCount > 0) {
            console.log('✅ Data verification PASSED. Data exists in DB for this user.');
        } else {
            console.log('❌ Data verification FAILED. No data found for this user.');
        }

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyData();
