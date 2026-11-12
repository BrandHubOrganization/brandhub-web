import type { TaskListItem, TaskPriority, TaskStatus, TaskType } from "@/types/task";
import { taskDeadline } from "@/pages/tasks/utils/taskViewData";
import { useAuthStore } from "@/store/authStore";

export interface TaskTimelineAssignee {
  id: string;
  name: string;
  avatar?: string | null;
  initials: string;
}

export interface TaskTimelineParent {
  id: string;
  name: string;
}

export interface TaskFilterCriteria {
  search: string;
  assignees: string[];
  statuses: TaskStatus[];
  types: TaskType[];
  schedules: string[];
  parents?: string[];
  priorities?: TaskPriority[];
  reporters?: string[];
  approvals?: ("YES" | "NO")[];
}

const INVALID_ASSIGNEES = new Set([
  "unknown", "unassigned", "chưa giao việc", "chua giao viec", "none", "null", "undefined",
]);

export function isValidAssignee(
  id?: string | null,
  name?: string | null,
): boolean {
  if (!id || !name) return false;
  const cleanId = id.trim();
  const cleanName = name.trim();
  if (!cleanId || !cleanName) return false;
  if (INVALID_ASSIGNEES.has(cleanId.toLowerCase())) return false;
  if (INVALID_ASSIGNEES.has(cleanName.toLowerCase())) return false;
  return true;
}

export function computeAssigneeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function extractUniqueAssignees(
  tasks: TaskListItem[],
): TaskTimelineAssignee[] {
  const map = new Map<string, TaskTimelineAssignee>();
  for (const t of tasks) {
    if (!isValidAssignee(t.assigneeId, t.assigneeName)) continue;
    const id = t.assigneeId!.trim();
    const name = t.assigneeName!.trim();

    if (!map.has(id)) {
      map.set(id, {
        id,
        name,
        avatar: t.assigneeAvatar ?? null,
        initials: computeAssigneeInitials(name),
      });
    } else {
      const existing = map.get(id)!;
      if (!existing.avatar && t.assigneeAvatar) {
        existing.avatar = t.assigneeAvatar;
      }
    }
  }
  return Array.from(map.values());
}

export function extractUniqueReporters(
  tasks: TaskListItem[],
): TaskTimelineAssignee[] {
  const map = new Map<string, TaskTimelineAssignee>();
  for (const t of tasks) {
    const rawId = t.reporterId || (t as { createdBy?: string }).createdBy;
    const rawName = t.reporterName || rawId;
    if (!isValidAssignee(rawId, rawName)) continue;
    const id = rawId!.trim();
    const name = rawName!.trim();

    if (!map.has(id)) {
      map.set(id, {
        id,
        name,
        avatar: t.reporterAvatar ?? null,
        initials: computeAssigneeInitials(name),
      });
    } else {
      const existing = map.get(id)!;
      if (!existing.avatar && t.reporterAvatar) {
        existing.avatar = t.reporterAvatar;
      }
    }
  }
  return Array.from(map.values());
}

export function extractUniqueParents(
  tasks: TaskListItem[],
  campaigns?: TaskTimelineParent[],
): TaskTimelineParent[] {
  const map = new Map<string, string>();
  if (campaigns) {
    for (const c of campaigns) {
      if (c.id) map.set(c.id, c.name || c.id);
    }
  }
  for (const t of tasks) {
    if (t.campaignId && !map.has(t.campaignId)) {
      const customTask = t as { campaignName?: string };
      map.set(
        t.campaignId,
        customTask.campaignName || `Campaign ${t.campaignId.slice(0, 6)}`,
      );
    }
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}

export function countActiveFilters(
  criteria: Omit<TaskFilterCriteria, "search">,
): number {
  let count = criteria.assignees.length + criteria.statuses.length + criteria.types.length;
  count += criteria.schedules.filter((s) => s !== "ALL").length;
  if (criteria.parents) count += criteria.parents.length;
  if (criteria.priorities) count += criteria.priorities.length;
  if (criteria.reporters) count += criteria.reporters.length;
  if (criteria.approvals) count += criteria.approvals.length;
  return count;
}

function matchesSearch(task: TaskListItem, q: string): boolean {
  if (!q) return true;
  const nameMatch = task.name.toLowerCase().includes(q);
  const keyMatch = task.key ? task.key.toLowerCase().includes(q) : false;
  const assigneeMatch =
    isValidAssignee(task.assigneeId, task.assigneeName) && task.assigneeName
      ? task.assigneeName.toLowerCase().includes(q)
      : false;
  return nameMatch || keyMatch || assigneeMatch;
}

export function isTaskUnassigned(task: TaskListItem): boolean {
  return !isValidAssignee(task.assigneeId, task.assigneeName);
}

export function matchesAssignee(
  task: TaskListItem,
  assignees: string[],
): boolean {
  if (assignees.length === 0) return true;
  const unassigned = isTaskUnassigned(task);
  if (unassigned) {
    return assignees.includes("UNASSIGNED");
  }
  const aId = task.assigneeId?.trim();
  const aName = task.assigneeName?.trim();
  const currentUserId = useAuthStore.getState().user?.id;
  const currentUserName = useAuthStore.getState().user?.name;

  if (assignees.includes("CURRENT_USER")) {
    if (
      (currentUserId && aId === currentUserId) ||
      (currentUserName &&
        aName &&
        aName.toLowerCase() === currentUserName.toLowerCase())
    ) {
      return true;
    }
  }

  return (
    (aId ? assignees.includes(aId) : false) ||
    (aName ? assignees.includes(aName) : false)
  );
}

function matchesSchedule(
  task: TaskListItem,
  schedules: string[],
  now: number,
): boolean {
  if (schedules.length === 0 || schedules.includes("ALL")) return true;
  const deadline = taskDeadline(task);
  const isUnscheduled = !deadline;
  const isOverdue = Boolean(
    deadline &&
      task.status !== "FINISHED" &&
      task.status !== "CANCELLED" &&
      deadline.getTime() < now,
  );
  const matchUnscheduled = schedules.includes("UNSCHEDULED") && isUnscheduled;
  const matchOverdue = schedules.includes("OVERDUE") && isOverdue;
  return matchUnscheduled || matchOverdue;
}

export function matchesReporter(
  task: TaskListItem,
  reporters: string[],
): boolean {
  if (reporters.length === 0) return true;
  const rawId = task.reporterId || (task as { createdBy?: string }).createdBy;
  const rId = rawId?.trim();
  const rName = task.reporterName?.trim();
  const currentUserId = useAuthStore.getState().user?.id;
  const currentUserName = useAuthStore.getState().user?.name;

  if (reporters.includes("CURRENT_USER")) {
    if (
      (currentUserId && rId === currentUserId) ||
      (currentUserName &&
        rName &&
        rName.toLowerCase() === currentUserName.toLowerCase())
    ) {
      return true;
    }
  }

  return Boolean(
    (rId && reporters.includes(rId)) || (rName && reporters.includes(rName)),
  );
}

function matchesApproval(
  task: TaskListItem,
  approvals: ("YES" | "NO")[],
): boolean {
  if (approvals.length === 0) return true;
  const req = Boolean(task.requiresClientApproval);
  const matchYes = approvals.includes("YES") && req;
  const matchNo = approvals.includes("NO") && !req;
  return matchYes || matchNo;
}

export function filterTasks(
  tasks: TaskListItem[],
  criteria: TaskFilterCriteria,
  now: number = Date.now(),
): TaskListItem[] {
  const {
    search,
    assignees,
    statuses,
    types,
    schedules,
    parents,
    priorities,
    reporters,
    approvals,
  } = criteria;
  const q = search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (!matchesSearch(task, q)) return false;
    if (!matchesAssignee(task, assignees)) return false;
    if (statuses.length > 0 && !statuses.includes(task.status)) return false;
    if (types.length > 0 && (!task.type || !types.includes(task.type))) {
      return false;
    }
    if (!matchesSchedule(task, schedules, now)) return false;
    if (parents && parents.length > 0) {
      if (!task.campaignId || !parents.includes(task.campaignId)) return false;
    }
    if (priorities && priorities.length > 0) {
      if (!task.priority || !priorities.includes(task.priority)) return false;
    }
    if (reporters && reporters.length > 0 && !matchesReporter(task, reporters)) {
      return false;
    }
    if (approvals && approvals.length > 0 && !matchesApproval(task, approvals)) {
      return false;
    }
    return true;
  });
}
