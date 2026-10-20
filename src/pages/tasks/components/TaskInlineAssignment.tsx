import { useTranslation } from "react-i18next";
import { User2, ShieldCheck } from "lucide-react";
import { InlineTaskField } from "@/pages/tasks/components/InlineTaskField";
import { TaskAssigneePicker } from "@/pages/tasks/components/TaskAssigneePicker";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskInlineAssignment({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
          <User2 className="size-3.5 text-muted-foreground" />
          <span>{t("tasks.assignee")}</span>
        </div>
        {task.allowedActions.canEditDetail || task.allowedActions.canAssign ? (
          <TaskAssigneePicker
            workspaceId={task.workspaceId}
            taskId={task.id}
            assigneeName={task.assigneeName}
          />
        ) : (
          <p className="py-1 text-sm font-medium">
            {task.assigneeName || t("tasks.unassigned")}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
          <ShieldCheck className="size-3.5 text-muted-foreground" />
          <span>{t("tasks.workflow.fields.requiresClientApproval")}</span>
        </div>
        <InlineTaskField
          id={`task-${task.id}-client-approval`}
          label=""
          value={String(task.requiresClientApproval)}
          displayValue={t(
            task.requiresClientApproval
              ? "tasks.workflow.yes"
              : "tasks.workflow.no",
          )}
          editable={task.allowedActions.canAssign && Boolean(task.assigneeId)}
          options={[
            { value: "true", label: t("tasks.workflow.yes") },
            { value: "false", label: t("tasks.workflow.no") },
          ]}
          save={(value) =>
            state.assign({ requiresClientApproval: value === "true" })
          }
          retry={state.retry}
        />
      </div>
    </div>
  );
}

