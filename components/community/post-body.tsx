import { Fragment } from "react";

/**
 * Renders user-written text safely: never as HTML. Supports ``` fenced code
 * blocks and `inline code`; everything else is plain text with line breaks.
 */
export function PostBody({ text }: { text: string }) {
  const parts = text.split(/```[a-zA-Z0-9+#-]*\n?([\s\S]*?)```/g);
  return (
    <div className="space-y-3 text-[15px] leading-[1.7] text-fg/90">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="overflow-x-auto rounded-[var(--radius-md)] border border-line bg-black/30 px-4 py-3 font-mono text-[13px] leading-relaxed text-fg/90">
            <code>{part.replace(/\n$/, "")}</code>
          </pre>
        ) : (
          part.trim() && (
            <p key={i} className="whitespace-pre-wrap break-words">
              {part
                .trim()
                .split(/(`[^`\n]+`)/g)
                .map((seg, j) =>
                  seg.startsWith("`") && seg.endsWith("`") && seg.length > 2 ? (
                    <code key={j} className="rounded-[5px] border border-line bg-white/[0.05] px-1.5 py-px font-mono text-[0.88em] text-accent-100">
                      {seg.slice(1, -1)}
                    </code>
                  ) : (
                    <Fragment key={j}>{seg}</Fragment>
                  ),
                )}
            </p>
          )
        ),
      )}
    </div>
  );
}
