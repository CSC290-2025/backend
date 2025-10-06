import type * as z from 'zod';
import type { BatchResponse } from 'firebase-admin/messaging';
import type { fcmSchema } from '@/modules/emergency/schemas/fcm.schema.ts';

type fcmToken = z.infer<typeof fcmSchema>;
type NotificationResponse = BatchResponse;

interface Notification {
  title: string;
  body: string;
}

export type { fcmToken, Notification, NotificationResponse };
