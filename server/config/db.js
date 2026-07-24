import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import mongoose from 'mongoose';
import { seedDefaultUsers } from './seed.js';

let isSeeded = false;

export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    const mongoURI = process.env.MONGO_URI;

    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');

        if (!isSeeded) {
            await seedDefaultUsers();
            isSeeded = true;
        }
    } catch (error) {
        throw error;
    }
};