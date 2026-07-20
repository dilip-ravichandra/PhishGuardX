import { createApp } from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

async function start(): Promise<void> {
  try {
    await connectDB();
  } catch (error) {
    logger.error('Failed to connect to MongoDB - server will not start', {
      message: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  }

  const app = createApp();

  app.listen(config.port, () => {
    logger.info(`Backend server listening on port ${config.port}`, {
      env: config.nodeEnv
    });
  });
}

start();
