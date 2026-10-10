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
        let serviceAccount: any;
        
        // Use environment variable in production (Vercel)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } else {
          // Fallback to local file for development
          const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
          if (fs.existsSync(serviceAccountPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          } else {
            console.warn('Firebase Service Account not found. Push notifications will not work.');
            return admin.apps[0] as admin.app.App; // return undefined safely if no app
          }
        }

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
