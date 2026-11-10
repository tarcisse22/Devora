import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Database, Footprints, Info, Lightbulb, Play } from "lucide-react";
import type { LessonBlock } from "@/lib/learn/types";
import { playgroundLink, sqlLabLink, tracerLink } from "@/lib/execution/share";
import { cn } from "@/lib/utils";
import { LessonText } from "./lesson-text";

const languageLabel: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  sql: "SQL",
  c: "C",
  cpp: "C++",
  text: "Text",
};

const callout = {
  note: { icon: Info, className: "border-accent-300/30 bg-accent-300/[0.06]", iconClass: "text-accent-300" },
  tip: { icon: Lightbulb, className: "border-success/30 bg-success/[0.06]", iconClass: "text-success" },
  warning: { icon: AlertTriangle, className: "border-warning/30 bg-warning/[0.06]", iconClass: "text-warning" },
};

function ActionLink({ href, icon: Icon, children }: { href: string; icon: typeof Play; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-[12px] font-medium text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
    >
      <Icon className="size-3.5" aria-hidden />
      {children}
    </Link>
  );
}

function CodeBlock({ block }: { block: Extract<LessonBlock, { type: "code" }> }) {
  const runnable = block.runnable && block.language !== "text";
  return (
    <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-black/30">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-1.5">
        <figcaption className="text-[12px] text-fg-subtle">
          <span className="font-mono text-accent-300">{languageLabel[block.language]}</span>
          {block.caption && <span> · {block.caption}</span>}
        </figcaption>
        {(runnable || block.traceable) && (
          <div className="flex items-center gap-0.5">
            {runnable && block.language === "sql" && (
              <ActionLink href={sqlLabLink(block.code)} icon={Database}>
                Run in SQL Lab
              </ActionLink>
            )}
            {runnable && block.language !== "sql" && (
              <ActionLink href={playgroundLink(block.language, block.code)} icon={Play}>
                Run in Playground
              </ActionLink>
            )}
            {block.traceable && (
              <ActionLink href={tracerLink(block.code)} icon={Footprints}>
                Trace it
              </ActionLink>
            )}
          </div>
        )}
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-fg/90">
        <code>{block.code}</code>
      </pre>
    </figure>
  );
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="text-[16px] leading-[1.75] text-fg/85">
                <LessonText text={block.text} />
              </p>
            );
          case "h":
            return (
              <h2 key={i} className="pt-3 text-[20px] font-semibold tracking-[-0.015em] text-fg">
                {block.text}
              </h2>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={i} className={cn("space-y-2 pl-5 text-[15.5px] leading-relaxed text-fg/85", block.ordered ? "list-decimal" : "list-disc", "marker:text-accent-300")}>
                {block.items.map((item) => (
                  <li key={item} className="pl-1">
                    <LessonText text={item} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "code":
            return <CodeBlock key={i} block={block} />;
          case "callout": {
            const c = callout[block.tone];
            return (
              <aside key={i} className={cn("flex gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-[14.5px] leading-relaxed text-fg/90", c.className)}>
                <c.icon className={cn("mt-0.5 size-4 shrink-0", c.iconClass)} aria-hidden />
                <p>
                  <LessonText text={block.text} />
                </p>
              </aside>
            );
          }
          case "diagram":
            return (
              <figure key={i} className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface/60">
                <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.6] text-accent-100/90">{block.text}</pre>
                <figcaption className="border-t border-line px-4 py-2 text-[12px] text-fg-subtle">{block.caption}</figcaption>
              </figure>
            );
          case "tool":
            return (
              <Link
                key={i}
                href={block.href}
                className="group flex items-start gap-3 rounded-[var(--radius-lg)] border border-accent-300/25 bg-accent-300/[0.05] px-4 py-3.5 transition-colors hover:border-accent-300/45 hover:bg-accent-300/[0.09]"
              >
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 text-[14.5px] font-medium text-accent-100">
                    {block.title}
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span className="mt-0.5 block text-[13.5px] leading-relaxed text-fg-muted">{block.text}</span>
                </span>
              </Link>
            );
        }
      })}
    </div>
  );
}
