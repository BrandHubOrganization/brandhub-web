import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { campaignTimelineService } from "@/pages/campaign/services/campaignTimelineService";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import type {
  TimelineEdit,
  TimelineView,
} from "@/pages/campaign/types/campaignTimeline";
import { dayInstant, todayIn } from "@/pages/campaign/utils/timelineDates";
export function useCampaignTimeline(workspaceId: string, campaignId: string) {
  const userId = useAuthStore((s) => s.user?.id) ?? "";
  const client = useQueryClient();
  const { t } = useTranslation();
  const queryKey = ["campaign-timeline", userId, workspaceId, campaignId];
  const query = useQuery({
    queryKey,
    queryFn: () => campaignTimelineService.read(workspaceId, campaignId),
    staleTime: 10000,
  });
  const mutation = useMutation({
    scope: { id: `campaign-timeline:${workspaceId}:${campaignId}` },
    mutationFn: async (edit: TimelineEdit) => {
      const data = client.getQueryData<TimelineView>(queryKey);
      const row = data?.rows.find((r) => r.id === edit.taskId);
      if (!data || !row || row.workflowRevision === null)
        throw new Error("TASK_NOT_READY");
      const base = `/api/v1/workspaces/${workspaceId}/tasks/${row.id}/subtasks`;
      if (edit.kind === "create")
        return api.post(base, {
          name: edit.name,
          assigneeId: edit.assigneeId,
          plannedStartDate: dayInstant(todayIn(data.timezone), data.timezone),
          dueDate: edit.dueDate,
          expectedRevision: row.workflowRevision,
          subtaskRole: edit.subtaskRole ?? null,
        });
      if (edit.kind === "status")
        return api.patch(`${base}/${edit.subtaskId}/status`, {
          status: edit.status,
        });
      if (edit.kind === "field") {
        if (edit.subtaskId) {
          const sub = row.subtasks.find((s) => s.id === edit.subtaskId);
          if (!sub) throw new Error("TASK_NOT_FOUND");
          return api.patch(`${base}/${sub.id}`, {
            ...sub,
            expectedRevision: row.workflowRevision,
            [edit.field]: edit.value,
          });
        }
        return taskWorkflowService.field(workspaceId, row.id, {
          field: edit.field,
          value: edit.value,
          expectedRevision: row.workflowRevision,
        });
      }
      if (edit.subtaskId) {
        const sub = row.subtasks.find((s) => s.id === edit.subtaskId);
        if (!sub) throw new Error("TASK_NOT_FOUND");
        return api.patch(`${base}/${sub.id}`, {
          ...sub,
          expectedRevision: row.workflowRevision,
          ...(edit.kind === "assignee"
            ? { assigneeId: edit.assigneeId }
            : { plannedStartDate: edit.start, dueDate: edit.end }),
        });
      }
      if (edit.kind === "schedule")
        return campaignTimelineService.schedule(
          workspaceId,
          row.id,
          edit.start,
          edit.end,
          row.workflowRevision,
        );
      if (!edit.assigneeId) throw new Error("INVALID_ASSIGNEE");
      const workflow = await taskWorkflowService.read(workspaceId, row.id);
      return taskWorkflowService.assign(workspaceId, row.id, {
        assigneeId: edit.assigneeId,
        requiresClientApproval: workflow.requiresClientApproval,
        expectedRevision: row.workflowRevision,
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey });
      await client.invalidateQueries({ queryKey: ["campaign-subtasks"] });
      await client.invalidateQueries({ queryKey: ["task-workflow", workspaceId] });
    },
    onError: async () => {
      toast.error(t("campaign.timeline.saveError"));
      await client.invalidateQueries({ queryKey });
    },
  });
  return {
    ...query,
    userId,
    edit: mutation.mutateAsync,
    busy: mutation.isPending,
    queryKey,
  };
}
