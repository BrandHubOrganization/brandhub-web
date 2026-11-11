import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  List,
  Calendar,
  Kanban,
  GitCommitHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TaskViewMode = "list" | "calendar" | "board" | "gantt";

export interface TaskViewSwitcherProps {
  currentView: TaskViewMode;
  onViewChange: (view: TaskViewMode) => void;
  onRefresh?: () => void;
  loading?: boolean;
  showRefresh?: boolean;
  className?: string;
}

const VIEWS: Array<{ key: TaskViewMode; icon: typeof List }> = [
  { key: "list", icon: List },
  { key: "calendar", icon: Calendar },
  { key: "board", icon: Kanban },
  { key: "gantt", icon: GitCommitHorizontal },
];

export interface TaskViewTabsProps {
  currentView: TaskViewMode;
  onViewChange: (view: TaskViewMode) => void;
  className?: string;
}

export function TaskViewTabs({ currentView, onViewChange, className }: TaskViewTabsProps) {
  const { t } = useTranslation();

  return (
    <div
      role="tablist"
      aria-label={t("tasks.viewMode", { defaultValue: "Chế độ xem" })}
      className={cn("border-border bg-muted/60 flex flex-wrap items-center gap-1 rounded-xl border p-1 shadow-2xs", className)}
    >
      {VIEWS.map(({ key, icon: Icon }) => {
        const isActive = currentView === key;
        return (
          <Button
            key={key}
            variant={isActive ? "orange" : "ghost"}
            size="sm"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => onViewChange(key)}
            className={cn(
              "rounded-lg transition-all duration-150 active:scale-[0.97]",
              isActive
                ? "bg-brand-orange text-white font-semibold shadow-xs hover:bg-brand-orange/90"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60 font-medium",
            )}
          >
            <Icon aria-hidden className="size-3.5" />
            <span>{t(`tasks.views.${key}`)}</span>
          </Button>
        );
      })}
    </div>
  );
}

export function TaskRefreshButton({
  onRefresh,
  loading = false,
  className,
}: {
  onRefresh: () => void;
  loading?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={onRefresh}
      className={cn(
        "border-border bg-card/90 hover:bg-muted text-foreground h-8 rounded-xl px-3 text-xs shadow-2xs transition-all duration-150 active:scale-[0.97]",
        className,
      )}
    >
      <RefreshCw
        aria-hidden
        className={cn("size-3.5", loading && "animate-spin text-brand-orange")}
      />
      <span>{t("tasks.refresh")}</span>
    </Button>
  );
}

export function TaskViewSwitcher({
  currentView,
  onViewChange,
  onRefresh,
  loading = false,
  showRefresh = true,
  className,
}: TaskViewSwitcherProps) {
  if (!showRefresh || !onRefresh) {
    return (
      <TaskViewTabs
        currentView={currentView}
        onViewChange={onViewChange}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <TaskViewTabs currentView={currentView} onViewChange={onViewChange} />
      <TaskRefreshButton onRefresh={onRefresh} loading={loading} />
    </div>
  );
}
