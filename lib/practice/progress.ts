"use client";

import { useSyncExternalStore } from "react";
import type { ChallengeLanguage } from "./challenges";

/**
 * Practice progress and drafts, stored in this browser only (localStorage).
 * There are no accounts yet, so nothing is sent anywhere. All access is
 * wrapped in try/catch: storage can be unavailable (private mode, blocked).
 */

const SOLVED_KEY = "devora:practice:solved";
const EVENT = "devora:practice-progress";

function readSolved(): string[] {
  try {
    const raw = window.localStorage.getItem(SOLVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

let cache: string[] | null = null;
const snapshot = () => (cache ??= readSolved());

function subscribe(onChange: () => void) {
  const handler = () => {
    cache = null;
    onChange();
  };
  window.addEventListener("storage", handler);
  window.addEventListener(EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENT, handler);
  };
}

const EMPTY: string[] = [];

/** Slugs of challenges solved in this browser. Empty during server render. */
export function useSolved(): string[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function markSolved(slug: string) {
  try {
    const solved = new Set(readSolved());
    solved.add(slug);
    window.localStorage.setItem(SOLVED_KEY, JSON.stringify([...solved]));
  } catch {
    /* storage unavailable — progress simply isn't kept */
  }
  cache = null;
  window.dispatchEvent(new Event(EVENT));
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
