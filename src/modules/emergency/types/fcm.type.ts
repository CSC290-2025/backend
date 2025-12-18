import type * as z from 'zod';
import type { BatchResponse } from 'firebase-admin/messaging';
import type { FcmSchemas } from '@/modules/emergency/schemas';

type SendFcmResponse = z.infer<typeof FcmSchemas.SendFcmResponseSchema>;
type CreateNotification = z.infer<typeof FcmSchemas.CreateNotificationSchema>;
type NotificationResponse = BatchResponse;

export type { SendFcmResponse, CreateNotification, NotificationResponse };
