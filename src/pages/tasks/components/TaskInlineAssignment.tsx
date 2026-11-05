import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, ChevronDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskInlineAssignment({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const canEdit = task.allowedActions.canEditDetail;


  const [clientApprovalOpen, setClientApprovalOpen] = useState(false);
  const [isSavingApproval, setIsSavingApproval] = useState(false);
  const [supervisorOpen, setSupervisorOpen] = useState(false);
  const [savingSupervisor, setSavingSupervisor] = useState(false);
  const supervisorOptions = useQuery({
    queryKey: [
      "task-supervisor-options",
      task.workspaceId,
      task.id,
      task.assigneeId,
    ],
    queryFn: () =>
      taskWorkflowService.options(task.workspaceId, task.id, "supervisor"),
    enabled: supervisorOpen,
  });
  const supervisorName = task.supervisorId
    ? (task.supervisorName ?? t("tasks.unknownAssignee"))
    : t("tasks.unassigned");

  async function selectSupervisor(id: string) {
    if (task.supervisorId === id) return;
    setSavingSupervisor(true);
    state.retry();
    try {
      await state.field("supervisorId", id);
    } catch (error) {
      toast.error(workflowError(error, t));
    } finally {
      setSavingSupervisor(false);
    }
  }

  async function handleSelectApproval(requiresApproval: boolean) {
    if (requiresApproval === task.requiresClientApproval) {
      setClientApprovalOpen(false);
      return;
    }
    setIsSavingApproval(true);
    state.retry();
    try {
      await state.field("requiresClientApproval", requiresApproval);
      setClientApprovalOpen(false);
    } catch (error) {
      toast.error(workflowError(error, t));
    } finally {
      setIsSavingApproval(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. Người giám sát (Supervisor) */}
      <div className="space-y-1.5">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <ShieldCheck className="text-muted-foreground size-3.5" />
          <span>{t("tasks.supervisor")}</span>
        </div>
        {task.allowedActions.canEditDetail ? (
          <DropdownMenu open={supervisorOpen} onOpenChange={setSupervisorOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={savingSupervisor}
                aria-label={t("tasks.inline.edit", {
                  field: t("tasks.supervisor"),
                })}
                className="h-8 max-w-full justify-between gap-2 rounded-lg px-2.5 text-xs"
              >
                <span className="truncate">{supervisorName}</span>
                <ChevronDown className="size-3.5 shrink-0" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-[70] w-56">
              {supervisorOptions.isPending && (
                <DropdownMenuItem disabled>
                  {t("tasks.loading")}
                </DropdownMenuItem>
              )}
              {supervisorOptions.isError && (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    void supervisorOptions.refetch();
                  }}
                >
                  {t("tasks.retry")}
                </DropdownMenuItem>
              )}
              {supervisorOptions.data?.map((member) => (
                <DropdownMenuItem
                  key={member.userId}
                  onSelect={() => void selectSupervisor(member.userId)}
                >
                  <span className="truncate">{member.displayName}</span>
                  {task.supervisorId === member.userId && (
                    <Check className="ml-auto size-4" aria-hidden />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="py-1.5 text-xs">{supervisorName}</p>
        )}
      </div>

      {/* 2. Vai trò khách hàng duyệt (Requires Client Approval) */}
      <div className="space-y-1.5">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <ShieldCheck className="text-muted-foreground size-3.5" />
          <span>{t("tasks.workflow.fields.requiresClientApproval")}</span>
        </div>

        {canEdit ? (
          <DropdownMenu
            open={clientApprovalOpen}
            onOpenChange={(open) => {
              if (!isSavingApproval) setClientApprovalOpen(open);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isSavingApproval}
                className="border-input bg-card/60 hover:bg-muted/80 text-foreground h-8 max-w-full cursor-pointer justify-between gap-2 rounded-lg px-2.5 text-xs font-normal shadow-2xs"
                aria-label={t("tasks.inline.edit", {
                  field: t("tasks.workflow.fields.requiresClientApproval"),
                })}
              >
                <span className="truncate font-medium">
                  {task.requiresClientApproval
                    ? t("tasks.workflow.yes")
                    : t("tasks.workflow.no")}
                </span>
                <ChevronDown
                  aria-hidden
                  className="text-muted-foreground size-3.5 shrink-0"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-[70] w-48 rounded-xl p-1 shadow-lg"
            >
              <DropdownMenuItem
                className="flex cursor-pointer items-center justify-between rounded-lg py-2 text-xs"
                onSelect={() => void handleSelectApproval(true)}
              >
                <span>{t("tasks.workflow.yes")}</span>
                {task.requiresClientApproval && (
                  <Check className="text-brand-orange size-3.5" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex cursor-pointer items-center justify-between rounded-lg py-2 text-xs"
                onSelect={() => void handleSelectApproval(false)}
              >
                <span>{t("tasks.workflow.no")}</span>
                {!task.requiresClientApproval && (
                  <Check className="text-brand-orange size-3.5" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="text-foreground px-2 py-1 text-xs font-normal">
            {task.requiresClientApproval
              ? t("tasks.workflow.yes")
              : t("tasks.workflow.no")}
          </p>
        )}
      </div>
    </div>
  );
}
