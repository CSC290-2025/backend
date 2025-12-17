import admin from 'firebase-admin';
import serviceAccount from '../../serviceAccount.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL:
    'https://sit-integrated-proj-2025-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const firebaseMessaging = admin.messaging();
const firebaseDatabase = admin.database();

export { firebaseMessaging, firebaseDatabase };
