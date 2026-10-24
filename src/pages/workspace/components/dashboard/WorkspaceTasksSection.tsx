import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FolderKanban, ChevronRight, Plus, FileEdit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceCampaignSummary } from "../WorkspaceCampaignSummary";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import { canonicalTaskStatus } from "@/pages/tasks/utils/taskStatus";
import type { TaskListItem, TaskStatus } from "@/types/task";
import type { Campaign } from "@/pages/campaign/types";

interface WorkspaceTasksSectionProps {
  workspaceId: string;
  tasks: TaskListItem[];
  tasksTotal: number;
  tasksLoading: boolean;
  campaigns: Campaign[];
  campaignsLoading: boolean;
  campaignsError: boolean;
  isManagerOrOwner: boolean;
  onRetryCampaigns: () => void;
}

export function WorkspaceTasksSection({
  workspaceId,
  tasks,
  tasksTotal,
  tasksLoading,
  campaigns,
  campaignsLoading,
  campaignsError,
  isManagerOrOwner,
  onRetryCampaigns,
}: WorkspaceTasksSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 lg:col-span-2">
      {/* Recent Tasks Card */}
      <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="text-brand-orange size-5" />
            <h3 className="text-foreground font-semibold">
              {t("workspace.dashboard.recentTasks")}
            </h3>
            <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
              {tasksTotal}
            </span>
          </div>
          {workspaceId && (
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-orange hover:text-brand-orange/80 gap-1 text-xs"
              onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
            >
              <span>{t("workspace.dashboard.viewAllTasks")}</span>
              <ChevronRight className="size-3.5" />
            </Button>
          )}
        </div>

        {tasksLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="border-brand-orange size-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
            <FolderKanban className="mb-2 size-8 opacity-40" />
            <p className="text-sm font-medium">
              {t("workspace.dashboard.noTasks")}
            </p>
            {isManagerOrOwner && workspaceId && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5"
                onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
              >
                <Plus className="size-4" />
                <span>{t("workspace.dashboard.createTask")}</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => {
              const canonical = canonicalTaskStatus(task.status as TaskStatus);
              const statusInfo = STATUS_CONFIG[canonical] || STATUS_CONFIG.TODO;
              return (
                <div
                  key={task.id}
                  onClick={() =>
                    workspaceId && navigate(`/workspaces/${workspaceId}/tasks`)
                  }
                  className="border-border hover:border-brand-orange/40 hover:bg-muted/40 group flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-brand-orange-soft text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg">
                      <FileEdit className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground group-hover:text-brand-orange truncate text-sm font-medium transition-colors">
                        {task.name}
                      </p>
                      <div className="text-muted-foreground text-2xs mt-0.5 flex items-center gap-2">
                        <span className="font-semibold tracking-wider uppercase">
                          {task.type}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.assigneeName && <span>• {task.assigneeName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`text-2xs inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${statusInfo.dot}`}
                      />
                      {statusInfo.defaultLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WorkspaceCampaignSummary
        workspaceId={workspaceId}
        campaigns={campaigns}
        loading={campaignsLoading}
        failed={campaignsError}
        canPlan={isManagerOrOwner}
        onRetry={onRetryCampaigns}
      />
    </div>
  );
}
