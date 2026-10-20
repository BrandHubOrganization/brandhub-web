import { useTranslation } from "react-i18next";
import { InlineTaskField } from "@/pages/tasks/components/InlineTaskField";
import { TaskAssigneePicker } from "@/pages/tasks/components/TaskAssigneePicker";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskInlineAssignment({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs">{t("tasks.assignee")}</p>
        {task.allowedActions.canEditDetail || task.allowedActions.canAssign ? (
          <TaskAssigneePicker
            workspaceId={task.workspaceId}
            taskId={task.id}
            assigneeName={task.assigneeName}
          />
        ) : (
          <p className="py-2 text-sm">
            {task.assigneeName || t("tasks.unassigned")}
          </p>
        )}
      </div>
      <InlineTaskField
        id={`task-${task.id}-client-approval`}
        label={t("tasks.workflow.fields.requiresClientApproval")}
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
  );
}
