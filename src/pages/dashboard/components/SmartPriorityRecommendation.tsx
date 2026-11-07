import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Zap,
  Clock,
  Calendar,
  FileCheck,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TaskListItem } from "@/types/task";
import type { Workspace } from "@/types/workspace";
import type {
  RecommendedTask,
  UrgencyType,
} from "../utils/smartPriorityAlgorithm";

export interface SmartPriorityRecommendationProps {
  recommendations: RecommendedTask[];
  workspaces?: Workspace[];
  onNavigateTask: (task: TaskListItem, action: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function SmartPriorityRecommendation({
  recommendations,
  workspaces = [],
  onNavigateTask,
  isLoading = false,
  className,
}: SmartPriorityRecommendationProps) {
  const { t } = useTranslation();

  // Map workspaceId -> workspace name
  const workspaceMap = useMemo(() => {
    return new Map(workspaces.map((w) => [w.id, w.name]));
  }, [workspaces]);

  const renderBadge = (urgencyType: UrgencyType, label: string) => {
    switch (urgencyType) {
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
            <Clock className="size-3" />
            {label}
          </span>
        );
      case "DUE_TODAY":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-semibold bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shrink-0">
            <Calendar className="size-3" />
            {label}
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-semibold bg-muted text-foreground border border-border/60 shrink-0">
            <FileCheck className="size-3" />
            {label}
          </span>
        );
      case "URGENT":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <AlertCircle className="size-3" />
            {label}
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs flex flex-col lg:h-[435px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-brand-orange/10 text-brand-orange">
            <Zap className="size-4 fill-brand-orange/20" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t(
                "dashboard.smartPriority.title",
                "Gợi ý ưu tiên: Bạn nên làm gì trước?"
              )}
            </h3>
            <p className="text-2xs text-muted-foreground">
              {t(
                "dashboard.smartPriority.subtitle",
                "Phân tích thông minh dựa trên hạn chót, trạng thái quy trình và vai trò trực tiếp của bạn"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 min-h-0 space-y-2.5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        /* Empty State */
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-6 text-center space-y-2">
          <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-xs font-medium text-foreground">
            {t(
              "dashboard.smartPriority.emptyTitle",
              "Tuyệt vời! Không có nhiệm vụ nào khẩn cấp"
            )}
          </p>
          <p className="text-2xs text-muted-foreground max-w-sm">
            {t(
              "dashboard.smartPriority.emptyDesc",
              "Tất cả công việc đều đang đúng tiến độ hoặc bạn chưa có task nào cần xử lý ngay lúc này."
            )}
          </p>
        </div>
      ) : (
        /* List Top Recommendations */
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-2.5">
          {recommendations.map((rec, index) => {
            const { task } = rec;
            const wsName = workspaceMap.get(task.workspaceId) || task.workspaceId;

            return (
              <div
                key={task.id}
                onClick={() => onNavigateTask(task, "view")}
                className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:border-brand-orange/60 hover:shadow-xs transition-all active:scale-[0.99]"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Row 1: Index + Badge + Workspace info */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-brand-orange font-bold w-5">
                      #{index + 1}
                    </span>

                    {renderBadge(rec.urgencyType, rec.urgencyLabel)}

                    <div className="inline-flex items-center gap-1 text-2xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40">
                      <FolderOpen className="size-3 text-muted-foreground/70" />
                      <span className="truncate max-w-[150px]">{wsName}</span>
                    </div>

                    {task.key && (
                      <span className="text-2xs font-mono font-medium text-muted-foreground">
                        [{task.key}]
                      </span>
                    )}
                  </div>

                  {/* Row 2: Task Name */}
                  <h4
                    className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-brand-orange transition-colors truncate"
                    title={task.name}
                  >
                    {task.name}
                  </h4>
                </div>

                <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
