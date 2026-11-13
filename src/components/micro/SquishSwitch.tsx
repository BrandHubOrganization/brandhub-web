import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SquishSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Elastic toggle switch whose thumb subtly squishes during transitions,
 * inspired by React Bits micro/squish-switch.
 */
export function SquishSwitch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  ariaLabel,
  className,
}: SquishSwitchProps) {
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onCheckedChange(!checked);
      }}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-xs outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
          checked
            ? "bg-brand-orange shadow-2xs"
            : "bg-muted border-border border",
        )}
      >
        <motion.span
          layout
          animate={
            reduceMotion
              ? undefined
              : {
                  scaleX: checked ? [1.22, 1] : [1.22, 1],
                  scaleY: checked ? [0.85, 1] : [0.85, 1],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.08 }
              : { type: "spring", stiffness: 560, damping: 28 }
          }
          className={cn(
            "block size-3.5 rounded-full bg-white shadow-xs",
            checked ? "ml-auto" : "mr-auto",
          )}
        />
      </span>
      {label && (
        <span
          className={cn(
            "text-xs font-medium transition-colors",
            checked ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}
