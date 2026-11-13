import { useId, type ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface RubberSegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  title?: string;
}

export interface RubberSegmentProps<T extends string> {
  options: readonly RubberSegmentOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  ariaLabel?: string;
  size?: "xs" | "sm";
  variant?: "solid" | "soft";
  className?: string;
  optionClassName?: string;
}

/**
 * Segmented control with an elastic orange highlight pill that slides cleanly
 * between options using Motion shared-layout transitions.
 */
export function RubberSegment<T extends string>({
  options,
  value,
  onValueChange,
  ariaLabel,
  size = "sm",
  variant = "solid",
  className,
  optionClassName,
}: RubberSegmentProps<T>) {
  const layoutId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <LayoutGroup id={layoutId}>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn(
          "border-border bg-muted/50 inline-flex max-w-full items-center gap-0.5 rounded-lg border p-0.5",
          className,
        )}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={option.disabled}
              title={option.title}
              onClick={() => {
                if (!option.disabled && option.value !== value) {
                  onValueChange(option.value);
                }
              }}
              className={cn(
                "focus-visible:ring-ring/50 relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
                size === "xs"
                  ? "h-6 px-2 text-[11px]"
                  : "h-7 px-2.5 text-xs",
                active
                  ? variant === "solid"
                    ? "font-semibold text-white"
                    : "text-brand-orange font-semibold"
                  : "text-muted-foreground hover:text-foreground",
                optionClassName,
              )}
            >
              {active && (
                <motion.span
                  layoutId={`rubber-pill-${layoutId}`}
                  aria-hidden="true"
                  transition={
                    reduceMotion
                      ? { duration: 0.08 }
                      : {
                          type: "spring",
                          stiffness: 520,
                          damping: 32,
                          mass: 0.72,
                        }
                  }
                  className={cn(
                    "absolute inset-0 rounded-md",
                    variant === "solid"
                      ? "bg-brand-orange shadow-xs"
                      : "border-brand-orange/35 bg-card border shadow-2xs",
                  )}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {option.icon}
                <span>{option.label}</span>
                {option.badge}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
