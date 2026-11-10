import { transform } from "sucrase";

/**
 * Strip TypeScript syntax so the code can run in the JavaScript sandbox.
 * Sucrase preserves line numbers, so runtime errors still point at the
 * right line. It does not type-check.
 */
export function stripTypes(code: string): { ok: true; code: string } | { ok: false; error: string } {
  try {
    const out = transform(code, { transforms: ["typescript"], disableESTransforms: true });
    return { ok: true, code: out.code };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? `SyntaxError: ${err.message}` : String(err) };
  }
}
