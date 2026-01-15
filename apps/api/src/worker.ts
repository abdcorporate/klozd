import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

/**
 * Worker process entrypoint for Render
 * 
 * This worker:
 * - Initializes the NestJS application context (without HTTP server)
 * - Starts BullMQ processors for background jobs
 * - Enables scheduled cron jobs (when RUN_SCHEDULER=true)
 * 
 * Run with: RUN_SCHEDULER=true node dist/worker.js
 */
async function bootstrapWorker() {
  // Ensure worker and scheduler are enabled
  process.env.RUN_WORKER = 'true';
  process.env.RUN_SCHEDULER = 'true';

  const logger = new Logger('Worker');

  try {
    logger.log('🚀 Starting KLOZD Worker process...');
    logger.log(`👷 Worker: ${process.env.RUN_WORKER === 'true' ? 'ENABLED' : 'DISABLED'}`);
    logger.log(`⏰ Scheduler: ${process.env.RUN_SCHEDULER === 'true' ? 'ENABLED' : 'DISABLED'}`);

    // Create application context (no HTTP server)
    const appContext = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    logger.log('✅ Application context initialized');
    logger.log('✅ BullMQ processors should auto-start via OnModuleInit hooks');
    logger.log('✅ Cron jobs enabled and ready to run');

    // Keep the process alive
    // The application context will stay alive and process:
    // - BullMQ jobs via NotificationsProcessor
    // - Scheduled cron jobs via @nestjs/schedule

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      logger.log(`Received ${signal}, shutting down gracefully...`);
      await appContext.close();
      logger.log('Worker shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    logger.log('✅ Worker is running and ready to process background jobs');
  } catch (error) {
    logger.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

bootstrapWorker().catch((error) => {
  console.error('❌ Fatal error in worker:', error);
  process.exit(1);
});
