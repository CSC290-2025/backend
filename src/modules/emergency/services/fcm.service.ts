import { FcmModel } from '@/modules/emergency/models';
import { firebaseMessaging } from '@/config/firebase.ts';
import type {
  Notification,
  NotificationResponse,
} from '@/modules/emergency/types/fcm.type.ts';

export const sendAllNotificationService = async (
  notification: Notification
): Promise<NotificationResponse> => {
  try {
    const tokens = await FcmModel.getAllFcmToken();
    const registrationTokens = tokens.map((token) => token.fcmTokens);

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
