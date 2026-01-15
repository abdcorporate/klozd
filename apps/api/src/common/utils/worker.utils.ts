/**
 * Utility functions for worker management
 * Used to control whether BullMQ processors should run based on RUN_WORKER env var
 */

/**
 * Checks if the worker is enabled based on RUN_WORKER environment variable
 * @returns true if RUN_WORKER is explicitly set to 'true', false otherwise
 */
export function isWorkerEnabled(): boolean {
  return process.env.RUN_WORKER === 'true';
}
