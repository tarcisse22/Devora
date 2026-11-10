"use client";

import { EmailAuthProvider, deleteUser, reauthenticateWithCredential, type User } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "./client";
import { deleteThread, threadsByAuthor } from "./community";

/**
 * Permanently delete the signed-in user's account: their threads (with all
 * replies and likes in them), progress, public profile and sign-in. The
 * username stays reserved so nobody can impersonate them in old replies.
 */
export async function deleteAccount(user: User, password: string) {
  if (!user.email) throw new Error("This account has no email address.");
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  for (const t of await threadsByAuthor(user.uid)) await deleteThread(t.id);
  await deleteDoc(doc(db(), "progress", user.uid));
  await deleteDoc(doc(db(), "users", user.uid));
  await deleteUser(user);
}
