import type * as z from 'zod';
import type { BatchResponse } from 'firebase-admin/messaging';
import type { FcmSchemas } from '@/modules/emergency/schemas/fcm.schema.ts';

type FcmResponse = z.infer<typeof FcmSchemas.FcmResponseSchema>;
type createTokenFcm = z.infer<typeof FcmSchemas.CreateTokenFcmSchema>;
type notification = z.infer<typeof FcmSchemas.NotificationSchema>;
type notificationResponse = BatchResponse;

export type { FcmResponse, createTokenFcm, notification, notificationResponse };
