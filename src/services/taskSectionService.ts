import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type { TaskSection, TaskSectionVersion } from "@/types/task";

function route(workspaceId: string, taskId: string, tail = "") {
  return `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}/sections${tail}`;
}
const key = (sectionKey: string) => `/${encodeURIComponent(sectionKey)}`;

export type SectionAction = "submit" | "approve" | "return" | "reopen";

/** Editor sections of a task (business-service `TaskSectionController`). */
export const taskSectionService = {
  async list(workspaceId: string, taskId: string) {
    const res = await api.get(route(workspaceId, taskId));
    return requireApiData<TaskSection[]>(res.data);
  },
  async patch(
    workspaceId: string,
    taskId: string,
    sectionKey: string,
    content: Record<string, unknown>,
    expectedRevision: number,
  ) {
    const res = await api.patch(route(workspaceId, taskId, key(sectionKey)), {
      content,
      expectedRevision,
    });
    return requireApiData<TaskSection>(res.data);
  },
  /** `note` is required by the server for `return`, optional for `reopen`, ignored otherwise. */
  async act(
    workspaceId: string,
    taskId: string,
    sectionKey: string,
    action: SectionAction,
    note?: string,
  ) {
    const body =
      action === "return" || action === "reopen" ? { note } : undefined;
    const res = await api.post(
      route(workspaceId, taskId, `${key(sectionKey)}/${action}`),
      body,
    );
    return requireApiData<TaskSection>(res.data);
  },
  async versions(workspaceId: string, taskId: string, sectionKey: string) {
    const res = await api.get(
      route(workspaceId, taskId, `${key(sectionKey)}/versions`),
    );
    return requireApiData<TaskSectionVersion[]>(res.data);
  },
  async restore(
    workspaceId: string,
    taskId: string,
    sectionKey: string,
    versionNo: number,
    expectedRevision: number,
  ) {
    const res = await api.post(
      route(workspaceId, taskId, `${key(sectionKey)}/restore/${versionNo}`),
      { expectedRevision },
    );
    return requireApiData<TaskSection>(res.data);
  },
};
