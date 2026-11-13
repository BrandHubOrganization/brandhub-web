import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface HoldButtonProps {
  onCommit: () => void | Promise<unknown>;
  children: ReactNode;
  holdHint?: string;
  durationMs?: number;
  disabled?: boolean;
  loading?: boolean;
  tone?: "orange" | "destructive";
  size?: "sm" | "default";
  className?: string;
  ariaLabel?: string;
  dataAttribute?: Record<string, string | boolean | undefined>;
}

/**
 * Press-and-hold confirmation button that fills with an elastic progress sweep
 * before triggering critical mutations, reducing accidental clicks and extra dialogs.
 */
export function HoldButton({
  onCommit,
  children,
  holdHint = "Giữ để xác nhận",
  durationMs = 850,
  disabled = false,
  loading = false,
  tone = "orange",
  size = "sm",
  className,
  ariaLabel,
  dataAttribute,
}: HoldButtonProps) {
  const reduceMotion = useReducedMotion();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);
  const rafRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const committedRef = useRef(false);

  const isDisabled = disabled || loading;

  const stopHold = (showHintIfQuickTap = false) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const elapsed = performance.now() - startTimeRef.current;
    if (
      showHintIfQuickTap &&
      !committedRef.current &&
      elapsed > 0 &&
      elapsed < Math.min(durationMs * 0.8, 450)
    ) {
      setShowTapHint(true);
      if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = window.setTimeout(() => setShowTapHint(false), 1600);
    }
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current);
    };
  }, []);

  const beginHold = () => {
    if (isDisabled || holding) return;
    committedRef.current = false;
    setShowTapHint(false);
    setHolding(true);
    startTimeRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const ratio = Math.min(1, elapsed / durationMs);
      setProgress(ratio);
      if (ratio >= 1) {
        committedRef.current = true;
        rafRef.current = null;
        setHolding(false);
        setProgress(0);
        void onCommit();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      beginHold();
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      stopHold(true);
    }
  };

  const radius = 6.5;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      title={holdHint}
      {...(dataAttribute ?? {})}
      animate={
        reduceMotion
          ? undefined
          : {
              scale: holding ? 0.985 : 1,
            }
      }
      transition={{ duration: 0.12 }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        beginHold();
      }}
      onPointerUp={() => stopHold(true)}
      onPointerCancel={() => stopHold(false)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={() => stopHold(false)}
      className={cn(
        "focus-visible:ring-ring/50 relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-md border font-semibold whitespace-nowrap select-none transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
        tone === "destructive"
          ? "border-rose-500/35 bg-rose-500/8 text-rose-700 hover:bg-rose-500/15 dark:text-rose-300"
          : "border-brand-orange/45 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/15",
        holding &&
          (tone === "destructive" ? "text-rose-900 dark:text-white" : "text-foreground"),
        className,
      )}
    >
      {/* Horizontal sweep fill */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 transition-[opacity] duration-150",
          tone === "destructive" ? "bg-rose-500" : "bg-brand-orange",
          holding ? "opacity-90" : "opacity-0",
        )}
        style={{
          width: `${Math.round(progress * 100)}%`,
        }}
      />

      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-1.5 transition-colors",
          holding && progress > 0.35 && "text-white",
        )}
      >
        {holding ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 18 18"
            className="size-3.5 shrink-0 -rotate-90"
          >
            <circle
              cx="9"
              cy="9"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.28"
              strokeWidth="2.2"
            />
            <circle
              cx="9"
              cy="9"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
        ) : null}

        <span>{showTapHint ? holdHint : children}</span>
      </span>
    </motion.button>
  );
}
