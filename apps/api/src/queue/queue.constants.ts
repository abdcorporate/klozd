/**
 * Noms des queues disponibles dans l'application
 */
export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  WEBHOOKS: 'webhooks',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
