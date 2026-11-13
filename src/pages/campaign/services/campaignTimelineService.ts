import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type {
  CreateOutOfScopeTaskInput,
  TimelineTask,
  TimelineView,
} from "@/pages/campaign/types/campaignTimeline";
export const campaignTimelineService = {
  async read(workspaceId: string, campaignId: string) {
    const response = await api.get<ApiResponse<TimelineView>>(
      `/api/v1/workspaces/${workspaceId}/campaigns/${campaignId}/timeline`,
    );
    const view = requireApiData<TimelineView>(response.data);
    if (
      !view ||
      !Array.isArray(view.rows) ||
      !Array.isArray(view.members) ||
      typeof view.timezone !== "string" ||
      !view.names ||
      typeof view.names !== "object" ||
      view.rows.some(
        (row) =>
          typeof row.id !== "string" ||
          typeof row.name !== "string" ||
          !Array.isArray(row.subtasks),
      )
    )
      throw new Error("INVALID_CAMPAIGN_TIMELINE");
    new Intl.DateTimeFormat("en", { timeZone: view.timezone });
    return view;
  },
  schedule(
    workspaceId: string,
    taskId: string,
    plannedStartDate: string,
    dueDate: string,
    expectedRevision: number,
  ) {
    return api.patch(
      `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/schedule`,
      { plannedStartDate, dueDate, expectedRevision },
    );
  },
  async createTask(
    workspaceId: string,
    campaignId: string,
    payload: CreateOutOfScopeTaskInput,
  ) {
    const response = await api.post<ApiResponse<TimelineTask>>(
      `/api/v1/workspaces/${workspaceId}/campaigns/${campaignId}/timeline/tasks`,
      payload,
    );
    return requireApiData<TimelineTask>(response.data);
  },
};
