import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import { InlineTaskField } from "@/pages/tasks/components/InlineTaskField";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskInlineAssignment({
  task,
  onlyAssignee = false,
}: {
  task: TaskWorkflow;
  onlyAssignee?: boolean;
}) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const options = useQuery({
    queryKey: ["task-member-options", task.workspaceId, task.id],
    queryFn: () => taskWorkflowService.options(task.workspaceId, task.id),
    enabled: task.allowedActions.canAssign,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const creators = (options.data || []).map((option) => ({
    value: option.userId,
    label: option.displayName,
  }));
  const canAssign =
    task.allowedActions.canAssign && options.isSuccess && creators.length > 0;
  return (
    <div className="space-y-4">
      <InlineTaskField
        id={`task-${task.id}-${onlyAssignee ? "row" : "detail"}-assignee`}
        label={t("tasks.assignee")}
        value={task.assigneeId || ""}
        displayValue={task.assigneeName || t("tasks.unassigned")}
        editable={canAssign}
        options={[
          { value: "", label: t("tasks.workflow.chooseCreator") },
          ...creators,
        ]}
        save={(assigneeId) => state.assign({ assigneeId })}
        retry={state.retry}
      />
      {options.isPending && task.allowedActions.canAssign && (
        <p role="status" className="text-xs">
          {t("tasks.loading")}
        </p>
      )}
      {options.isError && (
        <p role="alert" className="text-destructive text-xs">
          {t("tasks.inline.membersError")}
        </p>
      )}
      {task.allowedActions.canEditDetail && !task.allowedActions.canAssign && (
        <p className="text-muted-foreground text-xs">
          {t("tasks.inline.requirementsFirst")}
        </p>
      )}
      {!onlyAssignee && (
        <>
          <InlineTaskField
            id={`task-${task.id}-client-approval`}
            label={t("tasks.workflow.fields.requiresClientApproval")}
            value={String(task.requiresClientApproval)}
            displayValue={t(
              task.requiresClientApproval
                ? "tasks.workflow.yes"
                : "tasks.workflow.no",
            )}
            editable={canAssign && Boolean(task.assigneeId)}
            options={[
              { value: "true", label: t("tasks.workflow.yes") },
              { value: "false", label: t("tasks.workflow.no") },
            ]}
            save={(value) =>
              state.assign({ requiresClientApproval: value === "true" })
            }
            retry={state.retry}
          />
        </>
      )}
    </div>
  );
}
