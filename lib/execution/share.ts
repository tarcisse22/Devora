/**
 * Encode code into a URL-safe string so lessons can open an example directly
 * in the Playground or Code Tracer (e.g. /playground?lang=python&code=…).
 */
export function encodeCode(code: string): string {
  const bytes = new TextEncoder().encode(code);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCode(encoded: string): string | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

export const playgroundLink = (language: string, code: string) => `/playground?lang=${language}&code=${encodeCode(code)}`;
export const tracerLink = (code: string) => `/code-tracer?code=${encodeCode(code)}`;
export const sqlLabLink = (sql: string) => `/sql-lab?sql=${encodeCode(sql)}`;
