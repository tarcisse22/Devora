"use client";

import {
  Timestamp,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./client";

export type Category = "question" | "discussion" | "project" | "resource";

export const categories: { id: Category; label: string; description: string }[] = [
  { id: "question", label: "Questions", description: "Stuck on something? Ask." },
  { id: "discussion", label: "Discussions", description: "Talk about concepts, careers and learning." },
  { id: "project", label: "Shared projects", description: "Show what you built and get feedback." },
  { id: "resource", label: "Resources", description: "Share articles, courses and tools worth reading." },
];

export const categoryLabel = Object.fromEntries(categories.map((c) => [c.id, c.label])) as Record<Category, string>;

export type Thread = {
  id: string;
  authorId: string;
  authorUsername: string;
  category: Category;
  title: string;
  body: string;
  link?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type Reply = {
  id: string;
  authorId: string;
  authorUsername: string;
  body: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/** Limits — mirrored by firestore.rules, which is what actually enforces them. */
export const LIMITS = { titleMin: 5, titleMax: 150, bodyMax: 10000, replyMax: 5000, linkMax: 300, threadCooldownS: 30, replyCooldownS: 10 };

const toDate = (v: unknown) => (v instanceof Timestamp ? v.toDate() : null);

function toThread(id: string, d: Record<string, unknown>): Thread {
  return {
    id,
    authorId: String(d.authorId),
    authorUsername: String(d.authorUsername),
    category: d.category as Category,
    title: String(d.title),
    body: String(d.body),
    link: typeof d.link === "string" ? d.link : undefined,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

function toReply(id: string, d: Record<string, unknown>): Reply {
  return {
    id,
    authorId: String(d.authorId),
    authorUsername: String(d.authorUsername),
    body: String(d.body),
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

/** Seconds until the user may post again (0 if they can post now). */
export function cooldownRemaining(lastPostAt: Date | null, seconds: number, now = Date.now()) {
  if (!lastPostAt) return 0;
  return Math.max(0, Math.ceil((lastPostAt.getTime() + seconds * 1000 - now) / 1000));
}

/* ---------------------------------------------------------------- reads */

export async function listThreads(max = 100): Promise<Thread[]> {
  const snap = await getDocs(query(collection(db(), "threads"), orderBy("createdAt", "desc"), limit(max)));
  return snap.docs.map((d) => toThread(d.id, d.data()));
}

export async function threadsByAuthor(uid: string): Promise<Thread[]> {
  // Equality filter only (no orderBy), so no composite index is needed.
  const snap = await getDocs(query(collection(db(), "threads"), where("authorId", "==", uid), limit(100)));
  return snap.docs.map((d) => toThread(d.id, d.data())).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

export async function threadCounts(threadId: string): Promise<{ replies: number; likes: number }> {
  const [r, l] = await Promise.all([
    getCountFromServer(collection(db(), "threads", threadId, "replies")),
    getCountFromServer(collection(db(), "threads", threadId, "likes")),
  ]);
  return { replies: r.data().count, likes: l.data().count };
}

export function watchThread(threadId: string, onChange: (t: Thread | null) => void, onError: (e: unknown) => void) {
  return onSnapshot(
    doc(db(), "threads", threadId),
    (s) => onChange(s.exists() ? toThread(s.id, s.data()) : null),
    onError,
  );
}

export function watchReplies(threadId: string, onChange: (r: Reply[]) => void, onError: (e: unknown) => void) {
  return onSnapshot(
    query(collection(db(), "threads", threadId, "replies"), orderBy("createdAt", "asc"), limit(500)),
    (s) => onChange(s.docs.map((d) => toReply(d.id, d.data()))),
    onError,
  );
}

export function watchLikes(threadId: string, onChange: (uids: string[]) => void, onError: (e: unknown) => void) {
  return onSnapshot(collection(db(), "threads", threadId, "likes"), (s) => onChange(s.docs.map((d) => d.id)), onError);
}

/* --------------------------------------------------------------- writes */

export async function createThread(uid: string, username: string, input: { category: Category; title: string; body: string; link?: string }) {
  const ref = doc(collection(db(), "threads"));
  const batch = writeBatch(db());
  batch.set(ref, {
    authorId: uid,
    authorUsername: username,
    category: input.category,
    title: input.title.trim(),
    body: input.body.trim(),
    ...(input.link ? { link: input.link.trim() } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db(), "users", uid), { lastPostAt: serverTimestamp() });
  await batch.commit();
  return ref.id;
}

export async function updateThread(threadId: string, input: { title: string; body: string; link?: string }) {
  await updateDoc(doc(db(), "threads", threadId), {
    title: input.title.trim(),
    body: input.body.trim(),
    link: input.link ? input.link.trim() : deleteField(),
    updatedAt: serverTimestamp(),
  });
}

/** Delete a thread with its replies and likes (allowed for the thread author). */
export async function deleteThread(threadId: string) {
  const [replies, likes] = await Promise.all([
    getDocs(collection(db(), "threads", threadId, "replies")),
    getDocs(collection(db(), "threads", threadId, "likes")),
  ]);
  const refs = [...replies.docs, ...likes.docs].map((d) => d.ref);
  // Batches hold up to 500 writes; delete children first, the thread last.
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(db());
    refs.slice(i, i + 450).forEach((r) => batch.delete(r));
    await batch.commit();
  }
  await deleteDoc(doc(db(), "threads", threadId));
}

export async function createReply(threadId: string, uid: string, username: string, body: string) {
  const batch = writeBatch(db());
  batch.set(doc(collection(db(), "threads", threadId, "replies")), {
    authorId: uid,
    authorUsername: username,
    body: body.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db(), "users", uid), { lastPostAt: serverTimestamp() });
  await batch.commit();
}

export async function updateReply(threadId: string, replyId: string, body: string) {
  await updateDoc(doc(db(), "threads", threadId, "replies", replyId), { body: body.trim(), updatedAt: serverTimestamp() });
}

export async function deleteReply(threadId: string, replyId: string) {
  await deleteDoc(doc(db(), "threads", threadId, "replies", replyId));
}

export async function setLiked(threadId: string, uid: string, liked: boolean) {
  const ref = doc(db(), "threads", threadId, "likes", uid);
  if (liked) await setDoc(ref, { createdAt: serverTimestamp() });
  else await deleteDoc(ref);
}

export async function threadExists(threadId: string) {
  return (await getDoc(doc(db(), "threads", threadId))).exists();
}
