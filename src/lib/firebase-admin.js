import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // In a Firebase or Google Cloud environment (like App Hosting),
    // the Admin SDK is automatically configured when initialized with no arguments.
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminDb = admin.firestore();
