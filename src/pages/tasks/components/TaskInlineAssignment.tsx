import { useState } from "react";
import { useTranslation } from "react-i18next";
import { User2, ShieldCheck, ChevronDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TaskAssigneePicker } from "@/pages/tasks/components/TaskAssigneePicker";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskInlineAssignment({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const systemRole = useAuthStore((s) => s.systemRole);
  const role = currentMemberRole || currentWorkspace?.myRole;
  const canManage =
    role === "MANAGER" ||
    role === "OWNER" ||
    systemRole === "ADMIN";

  // Cho phép chỉnh sửa nếu không phải CLIENT thuần và task chưa kết thúc
  const canEdit =
    (canManage ||
      Boolean(task.allowedActions.canAssign) ||
      Boolean(task.allowedActions.canEditDetail) ||
      role !== "CLIENT") &&
    task.status !== "FINISHED" &&
    task.status !== "CANCELLED";

  const [clientApprovalOpen, setClientApprovalOpen] = useState(false);
  const [isSavingApproval, setIsSavingApproval] = useState(false);

  async function handleSelectApproval(requiresApproval: boolean) {
    if (requiresApproval === task.requiresClientApproval) {
      setClientApprovalOpen(false);
      return;
    }
    setIsSavingApproval(true);
    try {
      await state.assign({ requiresClientApproval: requiresApproval });
      setClientApprovalOpen(false);
    } finally {
      setIsSavingApproval(false);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Người phụ trách (Assignee) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
          <User2 className="size-3.5 text-muted-foreground" />
          <span>{t("tasks.assignee")}</span>
        </div>
        {canEdit ? (
          <TaskAssigneePicker
            workspaceId={task.workspaceId}
            taskId={task.id}
            assigneeName={task.assigneeName}
            task={task}
          />
        ) : (
          <p className="py-1 px-2 text-xs font-normal text-foreground">
            {task.assigneeName || t("tasks.unassigned")}
          </p>
        )}
      </div>

      {/* 2. Vai trò khách hàng duyệt (Requires Client Approval) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
          <ShieldCheck className="size-3.5 text-muted-foreground" />
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
                className="border-input bg-card/60 hover:bg-muted/80 text-foreground h-8 max-w-full justify-between gap-2 px-2.5 text-xs font-normal rounded-lg cursor-pointer shadow-2xs"
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
            <DropdownMenuContent align="start" className="w-48 rounded-xl p-1 shadow-lg z-[70]">
              <DropdownMenuItem
                className="flex items-center justify-between py-2 text-xs cursor-pointer rounded-lg"
                onSelect={() => void handleSelectApproval(true)}
              >
                <span>{t("tasks.workflow.yes")}</span>
                {task.requiresClientApproval && (
                  <Check className="size-3.5 text-brand-orange" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center justify-between py-2 text-xs cursor-pointer rounded-lg"
                onSelect={() => void handleSelectApproval(false)}
              >
                <span>{t("tasks.workflow.no")}</span>
                {!task.requiresClientApproval && (
                  <Check className="size-3.5 text-brand-orange" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="py-1 px-2 text-xs font-normal text-foreground">
            {task.requiresClientApproval
              ? t("tasks.workflow.yes")
              : t("tasks.workflow.no")}
          </p>
        )}
      </div>
    </div>
  );
}
