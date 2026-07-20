import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';

/**
 * Connects to MongoDB. Kept separate from server.ts so tests can import
 * app.ts (and everything it wires up) without ever touching a real
 * database connection.
 */
export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 5000 });

  logger.info('Connected to MongoDB', { uri: redactUri(config.mongodbUri) });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', { message: error.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

/** Strips credentials from a connection string before logging it. */
function redactUri(uri: string): string {
  return uri.replace(/\/\/[^@]+@/, '//***:***@');
}
