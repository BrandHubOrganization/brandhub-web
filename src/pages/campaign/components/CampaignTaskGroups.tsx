import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { CampaignTask } from "../types";
import type { TaskStatus } from "@/types/task";
import { canonicalTaskStatus } from "@/pages/tasks/utils/taskStatus";

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
  const groups = [
    {
      key: "planned",
      items: tasks.filter((task) => task.sourceType !== "CONTENT_REQUEST"),
    },
    {
      key: "supplemental",
      items: tasks.filter((task) => task.sourceType === "CONTENT_REQUEST"),
    },
  ];
  return (
    <div className="space-y-5">
      {groups.map(
        (group) =>
          group.items.length > 0 && (
            <section key={group.key}>
              <h4 className="font-semibold">
                {t(`campaign.closure.${group.key}`)}
              </h4>
              <ul className="divide-border divide-y">
                {group.items.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium break-words">{task.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {t(`campaign.types.${task.type}`)}
                      </p>
                      {task.sourceType === "CONTENT_REQUEST" &&
                        task.sourceRefId && (
                          <Link
                            className="underline underline-offset-4"
                            to={`/workspaces/${workspaceId}/requests?request=${task.sourceRefId}`}
                          >
                            {t("campaign.closure.sourceRequest")}
                          </Link>
                        )}
                      {task.cancellation && (
                        <p className="text-muted-foreground break-words">
                          {t(
                            `campaign.closure.reasons.${task.cancellation.reasonCode}`,
                          )}
                          {task.cancellation.note
                            ? ` — ${task.cancellation.note}`
                            : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        className="underline underline-offset-4"
                        to={`/workspaces/${workspaceId}/tasks?task=${encodeURIComponent(task.id)}`}
                      >
                        {t("tasks.workflow.openDetail")}
                      </Link>
                      <Badge
                        variant={
                          ["COMPLETED", "FINISHED"].includes(task.status)
                            ? "APPROVED"
                            : "outline"
                        }
                      >
                        {t(
                          `campaign.ui.taskStatuses.${canonicalTaskStatus(task.status as TaskStatus)}`,
                          { defaultValue: task.status },
                        )}
                      </Badge>
                      {canManage &&
                        task.type === "POST" &&
                        task.status !== "CANCELLED" && (
                          <Link
                            className="underline underline-offset-4"
                            to={`/workspaces/${workspaceId}/content-writing?taskId=${task.id}`}
                          >
                            {t("campaign.delivery.openEditor")}
                          </Link>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}
