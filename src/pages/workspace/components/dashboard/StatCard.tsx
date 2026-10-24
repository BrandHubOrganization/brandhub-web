import { Badge } from "@/components/ui/badge";
import type { StatCardProps } from "../../types/dashboard";

export function StatCard({
  label,
  value,
  icon: Icon,
  sublabel,
  badgeText,
  badgeVariant = "secondary",
  colorClass = "text-brand-orange",
  bgIconClass = "bg-brand-orange-soft",
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`border-border bg-card hover:border-brand-orange/40 rounded-2xl border p-5 shadow-xs transition-all hover:shadow-sm ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {label}
        </span>
        {Icon && (
          <div
            className={`flex size-9 items-center justify-center rounded-xl ${bgIconClass} ${colorClass}`}
          >
            <Icon className="size-4.5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {value}
        </span>
        {badgeText && (
          <Badge variant={badgeVariant} className="text-2xs font-semibold">
            {badgeText}
          </Badge>
        )}
      </div>
      {sublabel && (
        <p className="text-muted-foreground mt-1.5 truncate text-xs">
          {sublabel}
        </p>
      )}
    </div>
  );
}
