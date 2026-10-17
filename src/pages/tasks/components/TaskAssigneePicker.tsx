import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { useInlineTaskField } from "@/pages/tasks/hooks/useInlineTaskField";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import { workflowError } from "@/pages/tasks/taskWorkflowErrors";

export function TaskAssigneePicker({
  workspaceId,
  taskId,
  assigneeName,
  scope = "detail",
}: {
  workspaceId: string;
  taskId: string;
  assigneeName?: string | null;
  scope?: "row" | "detail";
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const state = useTaskWorkflow(workspaceId, taskId, open);
  const task = state.query.data;
  const field = useInlineTaskField(
    `task-${taskId}-${scope}-assignee`,
    task?.assigneeId || "",
    (assigneeId) => state.assign({ assigneeId }),
  );
  const pending = field.status === "saving";
  const options = useQuery({
    queryKey: ["task-member-options", workspaceId, taskId],
    queryFn: () => taskWorkflowService.options(workspaceId, taskId),
    enabled: open && Boolean(task?.allowedActions.canAssign),
    retry: false,
    refetchOnWindowFocus: false,
  });
  async function save(value: string) {
    field.change(value);
    if (await field.commit(value)) setOpen(false);
  }
  const label = task?.assigneeName || assigneeName || t("tasks.unassigned");
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            className="h-auto min-h-9 max-w-full justify-start gap-2 px-2 font-normal"
            aria-label={t("tasks.inline.edit", { field: t("tasks.assignee") })}
          >
            <span className="truncate">{label}</span>
            <ChevronDown
              aria-hidden
              className="text-muted-foreground size-3.5 shrink-0"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-72 max-w-[calc(100vw-2rem)] rounded-xl"
          onEscapeKeyDown={(event) => {
            if (pending) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (pending) event.preventDefault();
          }}
        >
          <DropdownMenuLabel>
            {t("tasks.workflow.chooseCreator")}
          </DropdownMenuLabel>
          {state.query.isPending && (
            <p role="status" className="p-2 text-sm">
              {t("tasks.loading")}
            </p>
          )}
          {state.query.isError && (
            <div role="alert" className="space-y-2 p-2 text-sm">
              <p>{workflowError(state.query.error, t)}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void state.reload()}
              >
                {t("tasks.retry")}
              </Button>
            </div>
          )}
          {task && !state.query.isError && !task.allowedActions.canAssign && (
            <p role="status" className="text-muted-foreground p-2 text-sm">
              {t(
                task.lockReason
                  ? task.lockReason === "TASK_SCHEMA_NOT_READY"
                    ? "tasks.inline.setupUnavailable"
                    : `tasks.workflow.errors.${task.lockReason}`
                  : task.allowedActions.canEditDetail
                    ? "tasks.inline.requirementsFirst"
                    : "tasks.workflow.errors.FORBIDDEN",
              )}
            </p>
          )}
          {task?.allowedActions.canAssign && !state.query.isError && (
            <>
              {options.isPending && (
                <p role="status" className="p-2 text-sm">
                  {t("tasks.loading")}
                </p>
              )}
              {options.isError && (
                <div role="alert" className="space-y-2 p-2 text-sm">
                  <p>{t("tasks.inline.membersError")}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={options.isFetching}
                    onClick={() => void options.refetch()}
                  >
                    {t("tasks.retry")}
                  </Button>
                </div>
              )}
              {options.isSuccess && options.data.length === 0 && (
                <p className="text-muted-foreground p-2 text-sm">
                  {t("tasks.inline.noCreators")}
                </p>
              )}
              {options.data?.map((member) => (
                <DropdownMenuItem
                  key={member.userId}
                  disabled={pending}
                  className="min-h-10 cursor-pointer"
                  onSelect={(event) => {
                    event.preventDefault();
                    void save(member.userId);
                  }}
                >
                  <span className="min-w-0 flex-1 break-words">
                    {member.displayName}
                  </span>
                  {task.assigneeId === member.userId && (
                    <Check aria-hidden className="size-4 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}
          {field.error && (
            <div role="alert" className="space-y-2 border-t p-2 text-sm">
              <p className="text-destructive">{field.error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  state.retry();
                  if (await field.commit()) setOpen(false);
                }}
              >
                {t("tasks.retry")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  field.discard();
                  state.retry();
                }}
              >
                {t("tasks.inline.discard")}
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <p aria-live="polite" className="text-muted-foreground text-xs">
        {pending
          ? t("tasks.inline.saving")
          : field.status === "saved"
            ? t("tasks.inline.saved")
            : field.error}
      </p>
    </div>
  );
}
