import { cn } from "@/lib/utils";

export function TrendRankBadge({ rank }: { rank: number | null }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold tabular-nums",
        rank === 1
          ? "border-brand-orange/40 bg-brand-orange text-white shadow-xs"
          : rank === 2
            ? "border-brand-orange/30 bg-brand-orange/15 text-brand-orange"
            : rank === 3
              ? "border-brand-orange/20 bg-brand-orange/10 text-brand-orange"
              : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {rank === null ? "—" : `#${rank}`}
    </span>
  );
}
