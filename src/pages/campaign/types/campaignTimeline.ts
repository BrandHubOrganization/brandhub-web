import type { TaskMemberOption } from "@/pages/tasks/types/taskWorkflow";
export interface TimelineSubtask {
  id: string;
  parentTaskId: string;
  name: string;
  status: string;
  assigneeId: string | null;
  supervisorOverrideId: string | null;
  dueDate: string | null;
  plannedStartDate: string | null;
  subtaskRole?: string | null;
}
export interface TimelineTask {
  id: string;
  campaignWorkItemId: string | null;
  name: string;
  type: string;
  status: string;
  plannedStartDate: string | null;
  dueDate: string | null;
  assigneeId: string | null;
  supervisorId: string | null;
  workflowRevision: number | null;
  canSchedule: boolean;
  canAssign: boolean;
  canManageSubtasks: boolean;
  subtasks: TimelineSubtask[];
}
export interface TimelineView {
  timezone: string;
  rows: TimelineTask[];
  names: Record<string, string>;
  members: TaskMemberOption[];
}
export interface TimelineFilters {
  search: string;
  mine: "all" | "related" | "assignee" | "supervisor";
  assignee: string[];
  supervisor: string[];
  statuses: string[];
  types: string[];
  deliverable: string[];
  schedule: "all" | "missing" | "overdue";
  from: string;
  to: string;
}
export const EMPTY_FILTERS: TimelineFilters = {
  search: "",
  mine: "all",
  assignee: [],
  supervisor: [],
  statuses: [],
  types: [],
  deliverable: [],
  schedule: "all",
  from: "",
  to: "",
};
export type TimelineEdit =
  | {
      kind: "schedule";
      taskId: string;
      start: string;
      end: string;
      subtaskId?: string;
    }
  | {
      kind: "assignee";
      taskId: string;
      assigneeId: string | null;
      subtaskId?: string;
    }
  | {
      kind: "create";
      taskId: string;
      name: string;
      assigneeId: string | null;
      dueDate: string;
    }
  | { kind: "status"; taskId: string; subtaskId: string; status: string };
