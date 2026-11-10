"use client";

import { useSyncExternalStore } from "react";

/**
 * A list of strings kept in this browser's localStorage, readable with a
 * hook. Nothing leaves the device. Every access is guarded: storage can be
 * unavailable (private mode, blocked site data), in which case values are
 * simply not kept.
 */
const EVENT = "devora:local-store";
const cache = new Map<string, string[]>();
const EMPTY: string[] = [];

function read(key: string): string[] {
  if (cache.has(key)) return cache.get(key)!;
  let value: string[] = [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    if (Array.isArray(parsed)) value = parsed.filter((v) => typeof v === "string");
  } catch {
    /* unavailable or corrupt — treat as empty */
  }
  cache.set(key, value);
  return value;
}

function write(key: string, values: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    /* unavailable — keep in memory only */
  }
  cache.set(key, values);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const handler = (e: Event) => {
    if (e instanceof StorageEvent && e.key) cache.delete(e.key);
    onChange();
  };
  window.addEventListener("storage", handler);
  window.addEventListener(EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENT, handler);
  };
}

export function useLocalList(key: string): string[] {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );
}

export function toggleInLocalList(key: string, value: string) {
  const current = read(key);
  write(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
}

export function clearLocalList(key: string) {
  write(key, []);
}
