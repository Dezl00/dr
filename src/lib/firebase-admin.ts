import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let firebaseAdminApp: admin.app.App;

export function getFirebaseAdminApp() {
  if (!firebaseAdminApp) {
    if (admin.apps.length > 0) {
      firebaseAdminApp = admin.apps[0] as admin.app.App;
    } else {
      try {
        const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        firebaseAdminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        console.error('Firebase Admin initialization error:', error);
      }
    }
  }
  return firebaseAdminApp;
}
