/**
 * Types de jobs pour la queue de notifications
 */
export enum NotificationJobType {
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_SMS = 'SEND_SMS',
  SEND_WHATSAPP = 'SEND_WHATSAPP',
  CREATE_INAPP_NOTIFICATION = 'CREATE_INAPP_NOTIFICATION',
}

/**
 * Données pour le job SEND_EMAIL
 */
export interface SendEmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  metadata?: {
    userId?: string;
    organizationId?: string;
    notificationId?: string;
    [key: string]: any;
  };
}

/**
 * Données pour le job SEND_SMS
 */
export interface SendSmsJobData {
  to: string;
  message: string;
  metadata?: {
    userId?: string;
    organizationId?: string;
    appointmentId?: string;
    [key: string]: any;
  };
}

/**
 * Données pour le job SEND_WHATSAPP
 */
export interface SendWhatsAppJobData {
  to: string;
  message: string;
  metadata?: {
    userId?: string;
    organizationId?: string;
    appointmentId?: string;
    [key: string]: any;
  };
}

/**
 * Données pour le job CREATE_INAPP_NOTIFICATION
 */
export interface CreateInAppNotificationJobData {
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export type NotificationJobData =
  | SendEmailJobData
  | SendSmsJobData
  | SendWhatsAppJobData
  | CreateInAppNotificationJobData;
