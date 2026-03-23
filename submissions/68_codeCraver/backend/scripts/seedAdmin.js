import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const ADMIN = {
    name: 'Admin',
    email: 'admin@shopscribe.com',
    password: 'admin123',
    role: 'admin',
};

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const existing = await User.findOne({ email: ADMIN.email });
        if (existing) {
            console.log(`⚠️  Admin user already exists: ${ADMIN.email}`);
            if (existing.role !== 'admin') {
                existing.role = 'admin';
                await existing.save();
                console.log('✅ Updated existing user role to admin');
            }
        } else {
            const admin = new User(ADMIN);
            await admin.save();
            console.log(`✅ Admin user created: ${ADMIN.email} / ${ADMIN.password}`);
        }
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seedAdmin();
