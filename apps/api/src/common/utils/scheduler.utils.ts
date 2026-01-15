/**
 * Utility functions for scheduler management
 * Used to control whether cron jobs should execute based on RUN_SCHEDULER env var
 */

/**
 * Checks if the scheduler is enabled based on RUN_SCHEDULER environment variable
 * @returns true if RUN_SCHEDULER is explicitly set to 'true', false otherwise
 */
export function isSchedulerEnabled(): boolean {
  return process.env.RUN_SCHEDULER === 'true';
}

/**
 * Guards a function to only execute if the scheduler is enabled
 * Logs a debug message if scheduler is disabled
 * @param fn Function to execute if scheduler is enabled
 * @param logger Logger instance to use for logging
 * @param jobName Name of the job (for logging purposes)
 * @returns Promise that resolves to the result of fn() or undefined if scheduler is disabled
 */
export async function guardScheduler<T>(
  fn: () => Promise<T>,
  logger: { log: (message: string) => void },
  jobName: string,
): Promise<T | undefined> {
  if (!isSchedulerEnabled()) {
    logger.log(`[${jobName}] Scheduler disabled (RUN_SCHEDULER !== 'true'), skipping execution`);
    return undefined;
  }
  return fn();
}
