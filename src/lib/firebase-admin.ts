import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import * as fs from 'fs';
import * as path from 'path';

let firebaseAdminApp: any;

export function getFirebaseAdminApp() {
  if (!firebaseAdminApp) {
    if (getApps().length > 0) {
      firebaseAdminApp = getApp();
    } else {
      try {
        let serviceAccount: any;
        
        // Use environment variable in production (Vercel)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          } catch (e) {
            // Fallback: try decoding from base64
            const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
            serviceAccount = JSON.parse(decoded);
          }
        } else {
          // Fallback to local file for development
          const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
          if (fs.existsSync(serviceAccountPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          } else {
            console.warn('Firebase Service Account not found. Push notifications will not work.');
            return null; // Return null if not configured
          }
        }

        firebaseAdminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (error) {
        console.error('Firebase Admin initialization error:', error);
      }
    }
  }
  return firebaseAdminApp;
}

export function getAdminMessaging() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getMessaging(app);
}
