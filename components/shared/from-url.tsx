"use client";

import { useSearchParams } from "next/navigation";
import { decodeCode } from "@/lib/execution/share";
import { languageOrder, type PlaygroundLanguage } from "@/lib/execution/languages";
import { Playground } from "@/components/playground/playground";
import { CodeTracer } from "@/components/code-tracer/code-tracer";
import { SqlLab } from "@/components/sql/sql-lab";

/** Notice shown when a tool was opened with code from a link. */
function Loaded() {
  return <p className="mb-3 text-[13px] text-fg-muted">Loaded the example from your link — edit it freely.</p>;
}

/**
 * Read ?code= (and ?lang= / ?sql=) so lessons can open examples directly.
 * Invalid or missing parameters fall back to the tool's default example.
 */
export function PlaygroundFromUrl() {
  const params = useSearchParams();
  const code = params.get("code");
  const decoded = code ? decodeCode(code) : null;
  const lang = params.get("lang") as PlaygroundLanguage | null;
  const language = lang && languageOrder.includes(lang) ? lang : "javascript";
  return (
    <>
      {decoded !== null && <Loaded />}
      <Playground key={`${language}:${code}`} initialLanguage={language} initialCode={decoded ?? undefined} />
    </>
  );
}

export function TracerFromUrl() {
  const params = useSearchParams();
  const code = params.get("code");
  const decoded = code ? decodeCode(code) : null;
  return (
    <>
      {decoded !== null && <Loaded />}
      <CodeTracer key={code ?? "default"} initialCode={decoded ?? undefined} />
    </>
  );
}

export function SqlLabFromUrl() {
  const params = useSearchParams();
  const sql = params.get("sql");
  const decoded = sql ? decodeCode(sql) : null;
  return (
    <>
      {decoded !== null && <Loaded />}
      <SqlLab key={sql ?? "default"} initialSql={decoded ?? undefined} />
    </>
  );
}
