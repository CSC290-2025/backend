import type * as z from 'zod';
import type { BatchResponse } from 'firebase-admin/messaging';
import type { FcmSchemas } from '@/modules/emergency/schemas/fcm.schema.ts';

type FcmResponse = z.infer<typeof FcmSchemas.FcmResponseSchema>;
type CreateTokenFcm = z.infer<typeof FcmSchemas.CreateTokenFcmSchema>;
type Notification = z.infer<typeof FcmSchemas.NotificationSchema>;
type NotificationResponse = BatchResponse;

export type { FcmResponse, CreateTokenFcm, Notification, NotificationResponse };
