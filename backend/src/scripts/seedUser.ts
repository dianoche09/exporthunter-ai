
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const seedUser = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'test@exporthunter.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('Test user already exists.');
            console.log('Email:', email);
            console.log('Password:', password);
            console.log('(If this password does not work, the user might have been created with a different one previously. In that case, we can delete and recreate it.)');

            // Optional: Update password just in case
            existingUser.password = hashedPassword;
            await existingUser.save();
            console.log('Password updated to ensure access.');
        } else {
            await User.create({
                email,
                name: 'Test Hunter',
                company: 'Demo Corp',
                password: hashedPassword,
                role: 'admin',
                subscription: 'pro',
                emailVerified: true
            });
            console.log('✅ Test user created successfully!');
            console.log('Email:', email);
            console.log('Password:', password);
        }

    } catch (error) {
        console.error('❌ Error seeding user:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedUser();
