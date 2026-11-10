import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase web configuration for the devora-62b2a project.
 *
 * These values identify the project; they are not secrets. Access to data is
 * controlled by Firestore security rules (firestore.rules) and Firebase Auth.
 * Each value can be overridden with a NEXT_PUBLIC_FIREBASE_* environment
 * variable to point a deployment at a different project.
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDyyzOoww7MCm4d_m3nIXn09Nu0UdKfmSg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "devora-62b2a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "devora-62b2a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "devora-62b2a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "718377626828",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:718377626828:web:4763b9aaf46cbad88aa669",
};
