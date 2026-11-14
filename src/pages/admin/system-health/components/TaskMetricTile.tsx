import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { MetricTileConfig } from "@/pages/admin/system-health/components/taskManagerTypes";

interface Props {
  active: boolean;
  config: MetricTileConfig;
  index?: number;
  onSelect: () => void;
}

function buildSparkline(history: number[]): string {
  if (history.length < 2) return "";
  const width = 80;
  const height = 28;
  const step = width / (history.length - 1);
  return history
    .map((val, idx) => {
      const x = (idx * step).toFixed(1);
      const clamped = Math.max(0, Math.min(100, val));
      const y = (height - (clamped / 100) * (height - 6) - 3).toFixed(1);
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

const ACTIVE_THEMES = {
  all: "border-l-primary ring-1 ring-primary/30 bg-primary/5",
  cpu: "border-l-brand-orange ring-1 ring-brand-orange/30 bg-brand-orange-soft",
  ram: "border-l-violet-500 ring-1 ring-violet-500/30 bg-violet-500/5",
  disk: "border-l-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-500/5",
};

export function TaskMetricTile({ active, config, index = 0, onSelect }: Props) {
  const Icon = config.icon;
  const sparkPath = buildSparkline(config.history);
  const theme = ACTIVE_THEMES[config.key];

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      style={{ animationDelay: `${index * 30}ms` }}
      className={cn(
        "group border-border/70 relative flex min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-lg border p-3 transition-all duration-200 ease-out select-none",
        "bg-card hover:bg-accent/40 hover:border-border active:scale-[0.97]",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 fill-mode-both duration-300",
        active
          ? cn("border-l-4 shadow-sm", theme)
          : "border-l-4 border-l-transparent opacity-85 hover:opacity-100",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Icon
            className={cn("size-4 shrink-0 transition-colors", config.color)}
          />
          <span className="text-foreground truncate text-xs font-medium">
            {config.label}
          </span>
        </div>
        <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
          {config.status}
        </span>
      </div>

      <div className="mt-2.5 flex min-w-0 items-end justify-between gap-2">
        <div className="shrink-0 tabular-nums">
          <span className="text-foreground font-mono text-xl font-bold tracking-tight sm:text-2xl">
            {config.value.toFixed(1)}
          </span>
          <span className="text-muted-foreground ml-0.5 text-xs">%</span>
        </div>

        {sparkPath && (
          <svg
            className="h-7 w-12 min-w-0 shrink sm:w-20"
            viewBox="0 0 80 28"
            fill="none"
          >
            <path
              d={sparkPath}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-colors duration-200", config.color)}
            />
          </svg>
        )}
      </div>
    </div>
  );
}
