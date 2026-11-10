"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import type { Profile } from "@/lib/firebase/profiles";

type AuthState = {
  /** True until Firebase has reported the initial sign-in state. */
  loading: boolean;
  user: User | null;
  /** Public profile; null if signed out or the profile isn't set up yet. */
  profile: Profile | null;
  /** Signed in, but hasn't chosen a username yet. */
  needsProfile: boolean;
};

const AuthContext = createContext<AuthState>({ loading: true, user: null, profile: null, needsProfile: false });

export const useAuth = () => useContext(AuthContext);

/**
 * Tracks the Firebase user and their profile. Firebase is loaded lazily after
 * the first paint so pages that don't need accounts stay light.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ loading: true, user: null, profile: null, needsProfile: false });

  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let unsubProfile: (() => void) | undefined;
    let stopSync: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ auth, db }, { onAuthStateChanged }, { doc, onSnapshot }, { toProfile }, { startProgressSync }] = await Promise.all([
        import("@/lib/firebase/client"),
        import("firebase/auth"),
        import("firebase/firestore"),
        import("@/lib/firebase/profiles"),
        import("@/lib/firebase/progress-sync"),
      ]);
      if (cancelled) return;

      unsubAuth = onAuthStateChanged(auth(), (user) => {
        unsubProfile?.();
        stopSync?.();
        unsubProfile = undefined;
        stopSync = undefined;
        if (!user) {
          setState({ loading: false, user: null, profile: null, needsProfile: false });
          return;
        }
        stopSync = startProgressSync(user.uid);
        unsubProfile = onSnapshot(
          doc(db(), "users", user.uid),
          (snap) => {
            // "estimate" fills pending server timestamps (e.g. lastPostAt right
            // after posting) with the local time, so cooldowns apply immediately.
            const profile = snap.exists() ? toProfile(user.uid, snap.data({ serverTimestamps: "estimate" })) : null;
            setState({ loading: false, user, profile, needsProfile: !profile });
          },
          () => setState({ loading: false, user, profile: null, needsProfile: false }),
        );
      });
    })();

    return () => {
      cancelled = true;
      unsubAuth?.();
      unsubProfile?.();
      stopSync?.();
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
