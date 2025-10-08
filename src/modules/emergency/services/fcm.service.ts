import { FcmModel } from '@/modules/emergency/models';
import { firebaseMessaging } from '@/config/firebase.ts';
import type {
  notification,
  notificationResponse,
} from '@/modules/emergency/types/fcm.type.ts';

export const sendAllNotificationService = async (
  notification: notification
): Promise<notificationResponse> => {
  try {
    const tokens = await FcmModel.getAllFcmToken();
    const registrationTokens = tokens
      .map((token) => token.tokens)
      .filter((token) => token !== null);

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
