"use client";

import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { LEARN_PROGRESS_KEY } from "@/lib/learn/keys";
import { LOCAL_STORE_EVENT, localKeys, readLocalList, setLocalList } from "@/lib/local-store";
import { db } from "./client";

/**
 * Keeps learning progress in sync between this browser and the account.
 *
 * - The browser (localStorage) stays the working copy, so everything works
 *   offline and while signed out.
 * - On sign-in, browser and account progress are merged (union), so nothing
 *   is lost when you first sign in on a device that already has progress.
 * - While signed in, local changes are written to progress/{uid}, and
 *   changes from other devices are applied locally.
 */

const SOLVED_KEY = "devora:practice:solved";
const PROJECT_PREFIX = "devora:project:";
const PROJECT_SUFFIX = ":checklist";

export type ProgressState = { lessons: string[]; challenges: string[]; projectItems: string[] };

const sorted = (values: string[]) => [...new Set(values)].sort();
const serialize = (s: ProgressState) => JSON.stringify([s.lessons, s.challenges, s.projectItems]);

export function readLocalProgress(): ProgressState {
  const projectItems = localKeys(PROJECT_PREFIX)
    .filter((k) => k.endsWith(PROJECT_SUFFIX))
    .flatMap((k) => {
      const slug = k.slice(PROJECT_PREFIX.length, -PROJECT_SUFFIX.length);
      return readLocalList(k).map((i) => `${slug}:${i}`);
    });
  return {
    lessons: sorted(readLocalList(LEARN_PROGRESS_KEY)),
    challenges: sorted(readLocalList(SOLVED_KEY)),
    projectItems: sorted(projectItems),
  };
}

export function writeLocalProgress(state: ProgressState) {
  setLocalList(LEARN_PROGRESS_KEY, sorted(state.lessons));
  setLocalList(SOLVED_KEY, sorted(state.challenges));
  const bySlug = new Map<string, string[]>();
  for (const item of state.projectItems) {
    const cut = item.lastIndexOf(":");
    if (cut <= 0) continue;
    const slug = item.slice(0, cut);
    bySlug.set(slug, [...(bySlug.get(slug) ?? []), item.slice(cut + 1)]);
  }
  // Clear projects that have no items in the new state.
  for (const key of localKeys(PROJECT_PREFIX)) {
    if (!key.endsWith(PROJECT_SUFFIX)) continue;
    const slug = key.slice(PROJECT_PREFIX.length, -PROJECT_SUFFIX.length);
    if (!bySlug.has(slug)) setLocalList(key, []);
  }
  for (const [slug, items] of bySlug) setLocalList(`${PROJECT_PREFIX}${slug}${PROJECT_SUFFIX}`, sorted(items));
}

export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  return {
    lessons: sorted([...a.lessons, ...b.lessons]).slice(0, 500),
    challenges: sorted([...a.challenges, ...b.challenges]).slice(0, 500),
    projectItems: sorted([...a.projectItems, ...b.projectItems]).slice(0, 1000),
  };
}

function fromDoc(data: Record<string, unknown> | undefined): ProgressState {
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return { lessons: sorted(list(data?.lessons)), challenges: sorted(list(data?.challenges)), projectItems: sorted(list(data?.projectItems)) };
}

/** Start syncing for a signed-in user. Returns a function that stops it. */
export function startProgressSync(uid: string): () => void {
  const ref = doc(db(), "progress", uid);
  let stopped = false;
  let applying = false;
  let lastSynced = "";
  let timer: number | undefined;
  let unsubSnapshot: (() => void) | undefined;

  const push = async (state: ProgressState) => {
    lastSynced = serialize(state);
    await setDoc(ref, { ...state, updatedAt: serverTimestamp() });
  };

  const onLocalChange = () => {
    if (applying || stopped) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const current = readLocalProgress();
      if (serialize(current) !== lastSynced) push(current).catch(() => {});
    }, 600);
  };

  (async () => {
    try {
      const snap = await getDoc(ref);
      if (stopped) return;
      const merged = mergeProgress(fromDoc(snap.data()), readLocalProgress());
      applying = true;
      writeLocalProgress(merged);
      applying = false;
      if (!snap.exists() || serialize(fromDoc(snap.data())) !== serialize(merged)) await push(merged);
      else lastSynced = serialize(merged);
      if (stopped) return;
      unsubSnapshot = onSnapshot(ref, (s) => {
        if (!s.exists() || s.metadata.hasPendingWrites) return;
        const remote = fromDoc(s.data());
        const key = serialize(remote);
        if (key === lastSynced || key === serialize(readLocalProgress())) {
          lastSynced = key;
          return;
        }
        lastSynced = key;
        applying = true;
        writeLocalProgress(remote);
        applying = false;
      });
      window.addEventListener(LOCAL_STORE_EVENT, onLocalChange);
    } catch {
      /* offline or rules not deployed — progress stays local */
    }
  })();

  return () => {
    stopped = true;
    window.clearTimeout(timer);
    unsubSnapshot?.();
    window.removeEventListener(LOCAL_STORE_EVENT, onLocalChange);
  };
}
