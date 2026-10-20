import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCounter({
  current,
  max,
  className,
}: CharacterCounterProps) {
  const isNearLimit = current >= max * 0.9;
  const isAtLimit = current >= max;

  return (
    <span
      className={cn(
        "text-3xs tabular-nums transition-colors",
        isAtLimit
          ? "font-semibold text-destructive"
          : isNearLimit
            ? "font-medium text-amber-500 dark:text-amber-400"
            : "text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      {current}/{max}
    </span>
  );
}
