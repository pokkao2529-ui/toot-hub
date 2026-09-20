import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Safe initialization for both SSR and Client environments
// Prevent Vercel build crash if env variables are not set
const isFirebaseConfigured = !!firebaseConfig.apiKey;

let appInstance: FirebaseApp | undefined;

if (isFirebaseConfigured) {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

// Export as optional or mock so it doesn't crash SSR/Build
export const app: FirebaseApp | undefined = appInstance;
export const auth: Auth | null = appInstance ? getAuth(appInstance) : null;
export const db: Firestore | null = appInstance ? getFirestore(appInstance) : null;
export const storage: FirebaseStorage | null = appInstance ? getStorage(appInstance) : null;
