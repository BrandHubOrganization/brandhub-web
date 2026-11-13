import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SpringCheckProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  tone?: "orange" | "emerald";
  ariaLabel?: string;
  stopPropagation?: boolean;
  readOnlyVisual?: boolean;
  className?: string;
}

/**
 * Tactile spring checkbox with animated SVG check stroke draw in BrandHub tones.
 */
export function SpringCheck({
  checked,
  onCheckedChange,
  disabled = false,
  tone = "orange",
  ariaLabel,
  stopPropagation = false,
  readOnlyVisual = false,
  className,
}: SpringCheckProps) {
  const reduceMotion = useReducedMotion();

  const boxClasses = cn(
    "inline-flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
    checked
      ? tone === "emerald"
        ? "border-emerald-500 bg-emerald-500 text-white"
        : "border-brand-orange bg-brand-orange text-white"
      : "border-border bg-background hover:border-brand-orange/60",
    disabled && !readOnlyVisual && "opacity-50",
    className,
  );

  const icon = (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="size-2.5"
      fill="none"
    >
      {checked && (
        <motion.path
          d="M2.2 6.3 4.8 8.9 9.8 3.3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        />
      )}
    </svg>
  );

  if (readOnlyVisual) {
    return (
      <motion.span
        aria-hidden="true"
        animate={
          reduceMotion ? undefined : { scale: checked ? [0.85, 1.1, 1] : 1 }
        }
        transition={{ duration: 0.2 }}
        className={boxClasses}
      >
        {icon}
      </motion.span>
    );
  }

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.88 }}
      animate={
        reduceMotion ? undefined : { scale: checked ? [0.88, 1.1, 1] : 1 }
      }
      transition={{ type: "spring", stiffness: 520, damping: 24 }}
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
        if (!disabled) onCheckedChange?.(!checked);
      }}
      className={cn(
        "focus-visible:ring-ring/50 cursor-pointer outline-none focus-visible:ring-2 disabled:cursor-not-allowed",
        boxClasses,
      )}
    >
      {icon}
    </motion.button>
  );
}
