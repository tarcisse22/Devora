/** Renders `inline code` spans inside plain text. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="rounded-[5px] border border-line bg-white/[0.05] px-1.5 py-px font-mono text-[0.9em] text-accent-100">
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export const difficultyStyle = {
  Easy: "border-success/30 bg-success/10 text-success",
  Medium: "border-warning/30 bg-warning/10 text-warning",
  Hard: "border-[#ff9b9b]/30 bg-[#ff9b9b]/10 text-[#ffb3b3]",
} as const;
