"use client";

import { addToLocalList, useLocalList } from "@/lib/local-store";
import type { ChallengeLanguage } from "./challenges";

/**
 * Practice progress and drafts. Both live in this browser (localStorage);
 * solved challenges are also synced to the account when signed in (see
 * lib/firebase/progress-sync.ts). Drafts never leave the browser.
 */

export const SOLVED_KEY = "devora:practice:solved";

/** Slugs of challenges solved (in this browser, and in your account when signed in). */
export function useSolved(): string[] {
  return useLocalList(SOLVED_KEY);
}

export function markSolved(slug: string) {
  addToLocalList(SOLVED_KEY, slug);
}

const draftKey = (slug: string, lang: ChallengeLanguage) => `devora:practice:draft:${slug}:${lang}`;

export function loadDraft(slug: string, lang: ChallengeLanguage): string | null {
  try {
    return window.localStorage.getItem(draftKey(slug, lang));
  } catch {
    return null;
  }
}

export function saveDraft(slug: string, lang: ChallengeLanguage, code: string) {
  try {
    window.localStorage.setItem(draftKey(slug, lang), code);
  } catch {
    /* ignore */
  }
}

export function clearDraft(slug: string, lang: ChallengeLanguage) {
  try {
    window.localStorage.removeItem(draftKey(slug, lang));
  } catch {
    /* ignore */
  }
}
