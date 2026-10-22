import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  List,
  Calendar,
  Kanban,
  GitCommitHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type TaskViewMode = "list" | "calendar" | "board" | "gantt";

interface TaskViewSwitcherProps {
  currentView: TaskViewMode;
  onViewChange: (view: TaskViewMode) => void;
  onRefresh: () => void;
  loading: boolean;
}

const VIEWS: Array<{ key: TaskViewMode; icon: typeof List }> = [
  { key: "list", icon: List },
  { key: "calendar", icon: Calendar },
  { key: "board", icon: Kanban },
  { key: "gantt", icon: GitCommitHorizontal },
];

export function TaskViewSwitcher({
  currentView,
  onViewChange,
  onRefresh,
  loading,
}: TaskViewSwitcherProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="border-border bg-muted/60 flex flex-wrap items-center rounded-xl border p-1">
        {VIEWS.map(({ key, icon: Icon }) => (
          <Button
            key={key}
            variant={currentView === key ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={currentView === key}
            onClick={() => onViewChange(key)}
          >
            <Icon aria-hidden className="size-3.5" />
            {t(`tasks.views.${key}`)}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        disabled={loading}
        onClick={onRefresh}
      >
        <RefreshCw aria-hidden className="size-4" />
        {t("tasks.refresh")}
      </Button>
    </div>
  );
}
