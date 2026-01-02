/**
 * Database Configuration
 * Centralized MongoDB connection management with optimized settings
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  const options = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain at least 2 connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    bufferCommands: false, // Disable mongoose buffering
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI!, options);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export { connectDB };

