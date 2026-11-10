import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export function StepControls({ index, total, onPrev, onNext }: Props) {
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-fg" aria-live="polite">
          Step {index + 1} <span className="text-fg-subtle">of {total}</span>
        </p>
        <div className="mt-2.5 h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-200 transition-[width] duration-500 ease-[var(--ease-out-soft)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ControlButton label="Previous step" disabled={index === 0} onClick={onPrev}>
          <ArrowLeft className="size-4" strokeWidth={1.75} />
        </ControlButton>
        <ControlButton label="Next step" disabled={index === total - 1} onClick={onNext} emphasized>
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  disabled,
  onClick,
  emphasized,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  emphasized?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-35",
        emphasized
          ? "border-white/25 text-fg hover:border-accent-300 hover:bg-accent-300/10"
          : "border-line-strong text-fg-muted hover:border-white/25 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
