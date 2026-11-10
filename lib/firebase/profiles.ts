"use client";

import { Timestamp, doc, getDoc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "./client";

export type Profile = {
  uid: string;
  username: string;
  displayName: string;
  bio: string;
  createdAt: Date | null;
  lastPostAt: Date | null;
};

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function toProfile(uid: string, data: Record<string, unknown>): Profile {
  const ts = (v: unknown) => (v instanceof Timestamp ? v.toDate() : null);
  return {
    uid,
    username: String(data.username ?? ""),
    displayName: String(data.displayName ?? ""),
    bio: String(data.bio ?? ""),
    createdAt: ts(data.createdAt),
    lastPostAt: ts(data.lastPostAt),
  };
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  return (await getDoc(doc(db(), "usernames", username))).exists();
}

/**
 * Claim a username and create the public profile in one atomic batch. The
 * security rules reject the batch if the username already exists.
 */
export async function createProfile(uid: string, username: string, displayName: string) {
  const batch = writeBatch(db());
  batch.set(doc(db(), "usernames", username), { uid });
  batch.set(doc(db(), "users", uid), {
    username,
    displayName,
    bio: "",
    createdAt: serverTimestamp(),
    lastPostAt: Timestamp.fromMillis(0),
  });
  await batch.commit();
}

export async function updateProfile(uid: string, changes: { displayName: string; bio: string }) {
  await updateDoc(doc(db(), "users", uid), changes);
}

export async function profileByUsername(username: string): Promise<Profile | null> {
  const claim = await getDoc(doc(db(), "usernames", username));
  if (!claim.exists()) return null;
  const uid = String(claim.data().uid);
  const snap = await getDoc(doc(db(), "users", uid));
  return snap.exists() ? toProfile(uid, snap.data()) : null;
}
