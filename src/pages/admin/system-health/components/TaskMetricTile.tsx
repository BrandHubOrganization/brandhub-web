import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { MetricTileConfig } from "@/pages/admin/system-health/components/taskManagerTypes";

interface Props {
  active: boolean;
  config: MetricTileConfig;
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
  cpu: "border-l-[#f05a28] ring-1 ring-[#f05a28]/30 bg-[#f05a28]/5",
  ram: "border-l-[#8b5cf6] ring-1 ring-[#8b5cf6]/30 bg-[#8b5cf6]/5",
  disk: "border-l-[#10b981] ring-1 ring-[#10b981]/30 bg-[#10b981]/5",
};

export function TaskMetricTile({ active, config, onSelect }: Props) {
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
      className={cn(
        "group relative flex flex-col justify-between rounded-lg border border-border/70 p-3 transition-all duration-150 select-none cursor-pointer",
        "bg-card hover:bg-accent/40 active:scale-[0.97]",
        active
          ? cn("border-l-4 shadow-sm", theme)
          : "border-l-4 border-l-transparent opacity-85 hover:opacity-100",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className={cn("size-4 shrink-0 transition-colors", config.color)} />
          <span className="text-xs font-medium text-foreground truncate">
            {config.label}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          {config.status}
        </span>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        <div>
          <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {config.value.toFixed(1)}
          </span>
          <span className="ml-0.5 text-xs text-muted-foreground">%</span>
        </div>

        {sparkPath && (
          <svg
            className="h-7 w-20 shrink-0 overflow-visible"
            viewBox="0 0 80 28"
            fill="none"
          >
            <path
              d={sparkPath}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-colors", config.color)}
            />
          </svg>
        )}
      </div>
    </div>
  );
}
