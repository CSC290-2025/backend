import config from '@/config/env';
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: config.projectId,
    privateKey: config.privateKey.replace(/\\n/g, '\n'),
    clientEmail: config.clientEmail,
  }),
});

const firebaseMessaging = admin.messaging();
export { firebaseMessaging };
