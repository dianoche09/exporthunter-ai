
import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        const user = await User.findOne({ email: 'test@exporthunter.com' });
        console.log('User:', user?.email);
        console.log('API Keys:', user?.apiKeys);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
