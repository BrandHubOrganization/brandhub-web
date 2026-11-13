import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface FuseButtonProps {
  onConfirm: () => void | Promise<unknown>;
  icon: ReactNode;
  armLabel?: string;
  ariaLabel: string;
  title?: string;
  disabled?: boolean;
  armDurationMs?: number;
  className?: string;
}

/**
 * Two-step inline safety action: first tap arms a timed countdown fuse bar;
 * second tap within the window confirms execution without a blocking modal.
 */
export function FuseButton({
  onConfirm,
  icon,
  armLabel = "Xác nhận gỡ?",
  ariaLabel,
  title,
  disabled = false,
  armDurationMs = 3000,
  className,
}: FuseButtonProps) {
  const [armed, setArmed] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), armDurationMs);
    return () => window.clearTimeout(timer);
  }, [armed, armDurationMs]);

  return (
    <motion.button
      type="button"
      layout="position"
      disabled={disabled}
      title={title ?? ariaLabel}
      aria-label={armed ? armLabel : ariaLabel}
      onClick={() => {
        if (disabled) return;
        if (!armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        void onConfirm();
      }}
      onBlur={() => setArmed(false)}
      className={cn(
        "focus-visible:ring-ring/50 relative inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-md text-xs font-medium transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        armed
          ? "border-destructive/40 bg-destructive/12 text-destructive border px-2.5"
          : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-8",
        className,
      )}
    >
      {armed && (
        <motion.span
          aria-hidden="true"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={
            reduceMotion
              ? { duration: 0.1 }
              : { duration: armDurationMs / 1000, ease: "linear" }
          }
          style={{ transformOrigin: "left" }}
          className="bg-destructive/25 pointer-events-none absolute right-0 bottom-0 left-0 h-0.5"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-1">
        {icon}
        <AnimatePresence mode="wait">
          {armed && (
            <motion.span
              key="armed-label"
              initial={reduceMotion ? false : { opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap font-semibold"
            >
              {armLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
