import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface CometDialProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Compact circular arc dial that animates smoothly to reflect task or brief completion.
 */
export function CometDial({
  value,
  max,
  size = 28,
  strokeWidth = 3,
  showText = true,
  className,
}: CometDialProps) {
  const reduceMotion = useReducedMotion();
  const safeMax = Math.max(1, max);
  const ratio = Math.min(1, Math.max(0, value / safeMax));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={`${value}/${max}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted/80"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className={cn(
            ratio >= 1 ? "text-emerald-500" : "text-brand-orange",
          )}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={
            reduceMotion
              ? { duration: 0.08 }
              : { type: "spring", stiffness: 260, damping: 28 }
          }
        />
      </svg>
      {showText && (
        <span className="text-foreground absolute text-[9px] font-bold tabular-nums">
          {value}
        </span>
      )}
    </div>
  );
}
