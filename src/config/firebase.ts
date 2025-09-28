import config from '@/config/env.ts';
import firebaseAdmin from 'firebase-admin';

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: config.projectId,
    privateKey: config.privateKey,
    clientEmail: config.clientEmail,
  }),
});

const firebaseMessaging = firebaseAdmin.messaging(firebaseAdmin.app());

export default firebaseMessaging;
