import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  Newspaper,
  PlayCircle,
  Share2,
  Sparkles,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignTask } from "../types";
import type { TaskStatus } from "@/types/task";
import { canonicalTaskStatus } from "@/pages/tasks/taskStatus";

type FilterType = "ALL" | "IN_PROGRESS" | "DONE" | "CANCELLED";

function getTaskTypeIcon(type: string) {
  switch (type) {
    case "POST":
      return <Share2 className="size-3.5 text-brand-orange" />;
    case "LIVESTREAM":
      return <Video className="size-3.5 text-purple-500" />;
    case "EVENT_PLAN":
      return <Calendar className="size-3.5 text-blue-500" />;
    case "SURVEY":
      return <FileText className="size-3.5 text-teal-500" />;
    case "PRESS_RECOMMENDATION":
      return <Newspaper className="size-3.5 text-indigo-500" />;
    default:
      return <FileText className="size-3.5 text-muted-foreground" />;
  }
}

function getStatusBadge(status: string, label: string) {
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
        <Ban className="size-3" />
        {label}
      </span>
    );
  }
  if (["COMPLETED", "FINISHED"].includes(status)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="size-3" />
        {label}
      </span>
    );
  }
  const canonical = canonicalTaskStatus(status as TaskStatus);
  if (canonical === "IN_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
        <Clock className="size-3" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
      <PlayCircle className="size-3" />
      {label}
    </span>
  );
}

export function CampaignTaskGroups({
  tasks,
  workspaceId,
  canManage,
}: {
  tasks: CampaignTask[];
  workspaceId: string;
  canManage: boolean;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>("ALL");

  const countAll = tasks.length;
  const countInProgress = tasks.filter(
    (task) => !["COMPLETED", "FINISHED", "CANCELLED"].includes(task.status),
  ).length;
  const countDone = tasks.filter((task) =>
    ["COMPLETED", "FINISHED"].includes(task.status),
  ).length;
  const countCancelled = tasks.filter(
    (task) => task.status === "CANCELLED",
  ).length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "DONE")
      return ["COMPLETED", "FINISHED"].includes(task.status);
    if (filter === "CANCELLED") return task.status === "CANCELLED";
    if (filter === "IN_PROGRESS")
      return !["COMPLETED", "FINISHED", "CANCELLED"].includes(task.status);
    return true;
  });

  const groups = [
    {
      key: "planned",
      items: filteredTasks.filter(
        (task) => task.sourceType !== "CONTENT_REQUEST",
      ),
    },
    {
      key: "supplemental",
      items: filteredTasks.filter(
        (task) => task.sourceType === "CONTENT_REQUEST",
      ),
    },
  ];

  const totalFilteredCount = groups.reduce(
    (acc, group) => acc + group.items.length,
    0,
  );

  return (
    <div className="space-y-5">
      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-muted/60 p-1 border border-border/50 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              filter === "ALL"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            Tất cả
            <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
              {countAll}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("IN_PROGRESS")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              filter === "IN_PROGRESS"
                ? "bg-card text-sky-700 dark:text-sky-300 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <Clock className="size-3 text-sky-600 dark:text-sky-400" />
            Đang làm
            <span className="rounded-full bg-sky-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
              {countInProgress}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("DONE")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              filter === "DONE"
                ? "bg-card text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
            Đã xong
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              {countDone}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("CANCELLED")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              filter === "CANCELLED"
                ? "bg-card text-rose-700 dark:text-rose-300 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <Ban className="size-3 text-rose-600 dark:text-rose-400" />
            Đã hủy
            <span className="rounded-full bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
              {countCancelled}
            </span>
          </button>
        </div>
      </div>

      {/* Task Groups */}
      {totalFilteredCount === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
          Không có đầu việc nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        groups.map(
          (group) =>
            group.items.length > 0 && (
              <section key={group.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2">
                    {group.key === "planned" ? (
                      <Layers className="size-4 text-brand-orange" />
                    ) : (
                      <Sparkles className="size-4 text-purple-500" />
                    )}
                    {t(`campaign.closure.${group.key}`)}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({group.items.length})
                    </span>
                  </h4>
                </div>

                <div className="grid gap-3">
                  {group.items.map((task) => (
                    <div
                      key={task.id}
                      className="group relative flex flex-col justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-xs sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5 rounded-md bg-muted/70 px-2 py-0.5 text-xs font-medium text-foreground">
                            {getTaskTypeIcon(task.type)}
                            <span>
                              {t(`campaign.types.${task.type}`, {
                                defaultValue: task.type,
                              })}
                            </span>
                          </div>

                          {task.sourceType === "CONTENT_REQUEST" ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-300">
                                <Sparkles className="size-3" />
                                Yêu cầu bổ sung
                              </span>
                              {task.sourceRefId && (
                                <Link
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                                  to={`/workspaces/${workspaceId}/requests?request=${task.sourceRefId}`}
                                >
                                  <FileText className="size-3" />
                                  {t("campaign.closure.sourceRequest")}
                                </Link>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                              <Calendar className="size-3" />
                              Kế hoạch định kỳ
                            </span>
                          )}
                        </div>

                        <p className="font-semibold text-foreground text-sm sm:text-base break-words">
                          {task.name}
                        </p>

                        {task.cancellation && (
                          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-2.5 py-1.5 text-xs text-rose-800 dark:text-rose-300">
                            <span className="font-semibold">
                              {t(
                                `campaign.closure.reasons.${task.cancellation.reasonCode}`,
                                {
                                  defaultValue: task.cancellation.reasonCode,
                                },
                              )}
                            </span>
                            {task.cancellation.note && (
                              <span className="text-rose-700/80 dark:text-rose-400">
                                {" "}— {task.cancellation.note}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:self-center">
                        {getStatusBadge(
                          task.status,
                          t(
                            `campaign.ui.taskStatuses.${canonicalTaskStatus(task.status as TaskStatus)}`,
                            { defaultValue: task.status },
                          ),
                        )}

                        {canManage &&
                          task.type === "POST" &&
                          task.status !== "CANCELLED" && (
                            <Link
                              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-3 py-1.5 text-xs font-medium text-brand-orange transition-all hover:bg-brand-orange/20 hover:border-brand-orange/40 active:scale-98"
                              to={`/workspaces/${workspaceId}/content-writing?taskId=${task.id}`}
                            >
                              <ExternalLink className="size-3.5" />
                              {t("campaign.delivery.openEditor", {
                                defaultValue: "Mở Editor",
                              })}
                            </Link>
                          )}

                        <Link
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted/80 hover:border-border active:scale-98 shadow-2xs"
                          to={`/workspaces/${workspaceId}/tasks?task=${encodeURIComponent(task.id)}`}
                        >
                          {t("tasks.workflow.openDetail", {
                            defaultValue: "Chi tiết task",
                          })}
                          <ArrowUpRight className="size-3.5 text-muted-foreground" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ),
        )
      )}
    </div>
  );
}
