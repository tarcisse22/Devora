// Copies browser runtimes (Pyodide, sql.js) from node_modules into
// public/vendor so they are served from Devora's own origin — no CDN needed.
// Runs automatically after `npm install` and before `dev` / `build`.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = join(root, "node_modules");
const out = join(root, "public", "vendor");

const files = {
  pyodide: ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"],
  "sql.js": ["dist/worker.sql-wasm.js", "dist/sql-wasm.wasm"],
};

for (const [pkg, list] of Object.entries(files)) {
  const target = join(out, pkg === "sql.js" ? "sql" : pkg);
  mkdirSync(target, { recursive: true });
  for (const file of list) {
    const src = join(nm, pkg, file);
    if (!existsSync(src)) {
      console.error(`[copy-vendor] missing ${src} — run npm install`);
      process.exit(1);
    }
    cpSync(src, join(target, file.split("/").pop()));
  }
}
console.log("[copy-vendor] runtimes copied to public/vendor");
