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
  description?: string | null;
  acceptanceCriteria?: string | null;
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
  awaitingClient: boolean;
  missingDetails?: boolean;
  description?: string | null;
  acceptanceCriteria?: string | null;
  outOfScope?: boolean;
}

export interface CreateOutOfScopeTaskInput {
  name: string;
  type: string;
  assigneeId: string | null;
  plannedStartDate: string | null;
  dueDate: string | null;
  description: string | null;
  acceptanceCriteria: string | null;
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
  completeness: "all" | "missingDetails" | "complete";
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
  completeness: "all",
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
      subtaskRole?: string | null;
    }
  | { kind: "status"; taskId: string; subtaskId: string; status: string }
  | {
      kind: "field";
      taskId: string;
      subtaskId?: string;
      field: "description" | "acceptanceCriteria";
      value: string;
    };
