import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type StatusMarkState =
  | "idle"
  | "pending"
  | "saving"
  | "success"
  | "error"
  | "unsaved";

export interface StatusMarkProps {
  state: StatusMarkState;
  tone?: "orange" | "emerald" | "white";
  size?: "xs" | "sm";
  className?: string;
}

/**
 * Animated SVG status indicator that smoothly morphs between idle,
 * spinning progress, drawn checkmark, and error shake feedback.
 */
export function StatusMark({
  state,
  tone = "emerald",
  size = "sm",
  className,
}: StatusMarkProps) {
  const reduceMotion = useReducedMotion();
  const dim = size === "xs" ? "size-3.5" : "size-4";

  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center", dim, className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {(state === "pending" || state === "saving") && (
          <motion.svg
            key="spinning"
            viewBox="0 0 16 16"
            className={cn(
              dim,
              tone === "white" ? "text-white" : "text-brand-orange",
            )}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: reduceMotion ? 0 : 360,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              opacity: { duration: 0.14 },
              scale: { duration: 0.14 },
              rotate: reduceMotion
                ? undefined
                : { duration: 0.85, repeat: Infinity, ease: "linear" },
            }}
          >
            <circle
              cx="8"
              cy="8"
              r="5.5"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="2"
            />
            <path
              d="M8 2.5A5.5 5.5 0 0 1 13.5 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
        )}

        {state === "success" && (
          <motion.svg
            key="success"
            viewBox="0 0 16 16"
            className={cn(
              dim,
              tone === "white"
                ? "text-white"
                : tone === "orange"
                  ? "text-brand-orange"
                  : "text-emerald-600 dark:text-emerald-400",
            )}
            initial={{ opacity: 0, scale: 0.78 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="currentColor"
              fillOpacity="0.14"
            />
            <motion.path
              d="M5.1 8.2 7.1 10.2 11.1 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            />
          </motion.svg>
        )}

        {state === "error" && (
          <motion.svg
            key="error"
            viewBox="0 0 16 16"
            className={cn(dim, "text-destructive")}
            initial={{ opacity: 0, x: 0 }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, x: [-3, 3, -2, 2, 0] }
            }
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.32 }}
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="currentColor"
              fillOpacity="0.14"
            />
            <path
              d="M5.7 5.7 10.3 10.3M10.3 5.7 5.7 10.3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </motion.svg>
        )}

        {state === "unsaved" && (
          <motion.span
            key="unsaved"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            className="bg-brand-orange relative inline-flex size-2 rounded-full"
          />
        )}

        {state === "idle" && (
          <motion.svg
            key="idle"
            viewBox="0 0 16 16"
            className={cn(dim, "text-muted-foreground/70")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <circle
              cx="8"
              cy="8"
              r="5.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}

export interface CallChipProps {
  state: StatusMarkState;
  label: ReactNode;
  tone?: "orange" | "emerald";
  role?: "status" | "alert";
  className?: string;
}

/**
 * Compact status pill pairing StatusMark with animated text layout transitions.
 */
export function CallChip({
  state,
  label,
  tone = "emerald",
  role = "status",
  className,
}: CallChipProps) {
  const toneClass =
    state === "error"
      ? "border-destructive/35 bg-destructive/8 text-destructive"
      : state === "pending" || state === "saving" || state === "unsaved"
        ? "border-brand-orange/35 bg-brand-orange-soft/65 text-brand-orange"
        : state === "success"
          ? tone === "orange"
            ? "border-brand-orange/35 bg-brand-orange/10 text-brand-orange"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted/45 text-muted-foreground";

  return (
    <motion.span
      layout="position"
      role={role}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] leading-none font-medium transition-colors",
        toneClass,
        className,
      )}
    >
      <StatusMark state={state} tone={tone} size="xs" />
      <span className="whitespace-nowrap">{label}</span>
    </motion.span>
  );
}
