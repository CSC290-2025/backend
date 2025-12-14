import { FcmModel } from '@/modules/emergency/models';
import { firebaseMessaging } from '@/config/firebase.ts';
import { ValidationError } from '@/errors';
import type {
  CreateNotification,
  NotificationResponse,
  SendFcmResponse,
} from '@/modules/emergency/types/fcm.type.ts';

export const sendAllNotificationService = async (
  data: CreateNotification
): Promise<NotificationResponse> => {
  try {
    const tokens = await FcmModel.getAllFcmToken();

    const registrationTokens = tokens
      .map((token) => token.tokens)
      .filter((token) => token !== null);

    if (registrationTokens.length === 0) {
      throw new ValidationError('No valid token');
    }
    const notification = data.notification;
    const message = {
      notification: {
        title: notification.title || 'Notification Title',
        body: notification.body || 'Notification Body',
      },
      tokens: registrationTokens,
    };

    return await firebaseMessaging.sendEachForMulticast(message);
  } catch (error: any) {
    throw new Error(error?.message || `Internal server error !`);
  }
};

export const sendNotificationToToken = async (
  token: string,
  data: CreateNotification
): Promise<SendFcmResponse> => {
  try {
    const notification = data.notification;
    const message = {
      notification: {
        title: notification.title || 'Notification Title',
        body: notification.body || 'Notification Body',
      },
      token,
    };

    const messageId = await firebaseMessaging.send({
      ...message,
      webpush: {
        notification: {
          icon: 'https://www.google.com/favicon.ico',
          title: 'Notification Title',
          body: 'Notification Body',
        },
      },
    });

    return { message_id: messageId };
  } catch (error: any) {
    throw new Error(error?.message || `Internal server error !`);
  }
};
