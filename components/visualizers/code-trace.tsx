import { AnimatePresence, motion } from "framer-motion";

/** Minimal syntax tinting for the short trace lines the visualizer emits. */
function Line({ text }: { text: string }) {
  const commentAt = text.indexOf("//");
  const code = commentAt >= 0 ? text.slice(0, commentAt) : text;
  const comment = commentAt >= 0 ? text.slice(commentAt) : "";

  const parts = code.split(/(\b\d+\b|[A-Z](?=[,)\];])|\.\w+(?=\())/g);

  return (
    <div className="whitespace-pre">
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^\d+$/.test(part)) return <span key={i} className="text-accent-200">{part}</span>;
        if (/^[A-Z]$/.test(part)) return <span key={i} className="text-success/90">{part}</span>;
        if (part.startsWith(".")) return <span key={i} className="text-accent-300">{part}</span>;
        return <span key={i}>{part}</span>;
      })}
      {comment && <span className="text-fg-subtle">{comment}</span>}
    </div>
  );
}

export function CodeTrace({ lines, stepKey }: { lines: string[]; stepKey: number }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-line bg-black/35 px-4 py-3.5">
      <AnimatePresence mode="wait" initial={false}>
        <motion.pre
          key={stepKey}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="min-h-[84px] overflow-x-auto font-mono text-[12px] leading-[1.75] text-fg/85"
        >
          <code>
            {lines.map((line, i) => (
              <Line key={i} text={line} />
            ))}
          </code>
        </motion.pre>
      </AnimatePresence>
    </div>
  );
}
