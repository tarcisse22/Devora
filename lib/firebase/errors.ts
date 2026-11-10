/** Turn Firebase error codes into messages people can act on. */
const messages: Record<string, string> = {
  "auth/invalid-email": "That email address doesn’t look right.",
  "auth/missing-password": "Enter your password.",
  "auth/weak-password": "Choose a password with at least 8 characters.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Couldn’t reach the server. Check your connection and try again.",
  "auth/requires-recent-login": "For your security, enter your password again to continue.",
  "auth/user-disabled": "This account has been disabled.",
  "permission-denied": "You don’t have permission to do that.",
  unavailable: "The service is temporarily unavailable. Try again in a moment.",
};

export function friendlyError(err: unknown): string {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";
  return messages[code] ?? (err instanceof Error ? err.message.replace(/^Firebase:\s*/, "") : "Something went wrong. Please try again.");
}

export const errorCode = (err: unknown) => (typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "");
