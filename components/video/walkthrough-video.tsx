"use client";

import { useState } from "react";
import { Clock, Film, Play } from "lucide-react";
import { walkthroughVideo } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { Button, ButtonLink } from "@/components/ui/button";
import { VideoPosterArt } from "./video-poster-art";

type Props = {
  title: string;
  description: string;
  className?: string;
};

/**
 * Video preview card + modal player. Plays `walkthroughVideo.src` when one is
 * configured; until then the modal states plainly that no video exists yet.
 */
export function WalkthroughVideo({ title, description, className }: Props) {
  const [open, setOpen] = useState(false);
  const { src, poster, duration } = walkthroughVideo;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Play video: ${title}`}
        className={cn(
          "group relative block aspect-video w-full overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-surface text-left shadow-[0_40px_120px_-50px_rgb(108_79_209/0.6)]",
          className,
        )}
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element -- optional, user-supplied poster
          <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <VideoPosterArt />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />

        {/* Play button */}
        <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span
            aria-hidden
            className="absolute size-24 rounded-full border border-accent-200/30 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-110 sm:size-28"
          />
          <span className="flex size-16 items-center justify-center rounded-full bg-accent-200 text-[#14101f] shadow-[0_10px_40px_-6px_rgb(157_134_247/0.8)] transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-105 sm:size-20">
            <Play className="ml-1 size-6 fill-current sm:size-7" aria-hidden />
          </span>
        </span>

        {/* Caption */}
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
          <span className="max-w-[520px]">
            <span className="block text-base font-semibold text-fg sm:text-lg">{title}</span>
            <span className="mt-1 hidden text-[14px] leading-relaxed text-fg-muted sm:block">{description}</span>
          </span>
          {duration && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-canvas/60 px-2.5 py-1 text-[12px] text-fg-muted backdrop-blur">
              <Clock className="size-3.5" aria-hidden />
              {duration}
            </span>
          )}
        </span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} label={title} className="max-w-[960px]">
        {src ? (
          <video
            src={src}
            poster={poster ?? undefined}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full bg-black"
          />
        ) : (
          <VideoUnavailable onClose={() => setOpen(false)} />
        )}
      </Dialog>
    </>
  );
}

function VideoUnavailable({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center sm:px-12 sm:py-16">
      <span className="flex size-12 items-center justify-center rounded-[var(--radius-lg)] border border-line-strong bg-white/[0.04] text-accent-200">
        <Film className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.01em] text-fg">The walkthrough isn’t recorded yet</h2>
      <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-fg-muted">
        We’ll publish a short product walkthrough once the core tools are built. In the meantime you can use the
        algorithm visualizers and the code playground — both are already live.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/visualize" onClick={onClose}>
          Explore the visualizers
        </ButtonLink>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
