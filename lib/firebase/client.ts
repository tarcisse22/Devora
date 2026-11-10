"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

/** Lazily initialised Firebase services (browser only). */
let app: FirebaseApp | null = null;

export function firebaseApp(): FirebaseApp {
  app ??= getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export const auth = (): Auth => getAuth(firebaseApp());
export const db = (): Firestore => getFirestore(firebaseApp());
