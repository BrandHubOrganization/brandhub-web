import type { TFunction } from "i18next";
import type { TaskStatus, TaskType } from "@/types/task";
import type {
  TaskTimelineAssignee,
  TaskTimelineParent,
} from "@/pages/tasks/utils/taskFilterUtils";
import { ALL_STATUSES, ALL_TYPES } from "./TaskFilterCategoryList";
import { ALL_PRIORITIES } from "./TaskFilterExtraOptions";
import type { FilterCategory, TaskFilterPopoverOptionsProps } from "./types";

export function getCategorySearchPlaceholder(
  activeCategory: FilterCategory,
  t: TFunction,
): string {
  switch (activeCategory) {
    case "parent":
      return t("tasks.timelineGrid.searchParent", { defaultValue: "Search parent..." });
    case "assignee":
      return t("tasks.timelineGrid.searchAssignee", { defaultValue: "Search assignee..." });
    case "status":
      return t("tasks.timelineGrid.searchStatus", { defaultValue: "Search status..." });
    case "type":
      return t("tasks.timelineGrid.searchType", { defaultValue: "Search work type..." });
    case "schedule":
      return t("tasks.timelineGrid.searchSchedule", { defaultValue: "Search schedule..." });
    case "priority":
      return t("tasks.timelineGrid.searchPriority", { defaultValue: "Search priority..." });
    case "reporter":
      return t("tasks.timelineGrid.searchReporter", { defaultValue: "Search reporter..." });
    case "approval":
      return t("tasks.timelineGrid.searchApproval", { defaultValue: "Search approval..." });
  }
}

interface ComputeCountsParams {
  category: FilterCategory;
  q: string;
  props: TaskFilterPopoverOptionsProps;
  currentUser?: { id?: string; name?: string } | null;
  t: TFunction;
}

export function computeCategoryCounts({
  category,
  q,
  props,
  currentUser,
  t,
}: ComputeCountsParams): { totalCount: number; filteredCount: number; activeSelectedCount: number } {
  switch (category) {
    case "parent":
      return countParents(props.parents, props.selectedParents, q);
    case "assignee":
      return countAssignees(props.assignees, props.selectedAssignees, currentUser, q, t);
    case "status":
      return countStatuses(props.selectedStatuses, q, t);
    case "type":
      return countTypes(props.selectedTypes, q, t);
    case "schedule":
      return countSchedules(props.selectedSchedules, q, t);
    case "priority":
      return countPriorities(props.selectedPriorities || [], q, t);
    case "reporter":
      return countReporters(props.reporters || [], props.selectedReporters || [], currentUser, q, t);
    case "approval":
      return countApprovals(props.selectedApprovals || [], q, t);
  }
}

function countParents(parents: TaskTimelineParent[], selected: string[], q: string) {
  const filtered = parents.filter((p) => !q || p.name.toLowerCase().includes(q)).length;
  return { totalCount: parents.length, filteredCount: filtered, activeSelectedCount: selected.length };
}

function countAssignees(
  assignees: TaskTimelineAssignee[],
  selected: string[],
  currentUser: { id?: string; name?: string } | null | undefined,
  q: string,
  t: TFunction,
) {
  const validMembers = assignees.filter(
    (p) => p.id !== "UNASSIGNED" && p.name.trim().toLowerCase() !== "unknown" && p.id !== currentUser?.id,
  );
  const unLabel = t("tasks.timelineGrid.unassigned", { defaultValue: "Chưa phân công" }).toLowerCase();
  const curLabel = t("tasks.timelineGrid.currentUser", { defaultValue: "Người dùng hiện tại" }).toLowerCase();
  const cName = currentUser?.name?.toLowerCase() || "";
  const showUn = !q || unLabel.includes(q) || "unassigned".includes(q) || "chưa giao việc".includes(q);
  const showCur = !q || curLabel.includes(q) || "current user".includes(q) || (cName && cName.includes(q));
  const filtered = validMembers.filter((p) => !q || p.name.toLowerCase().includes(q)).length;
  return {
    totalCount: 2 + validMembers.length,
    filteredCount: (showUn ? 1 : 0) + (showCur ? 1 : 0) + filtered,
    activeSelectedCount: selected.length,
  };
}

function countStatuses(selected: TaskStatus[], q: string, t: TFunction) {
  const filtered = ALL_STATUSES.filter(({ value }) => {
    if (!q) return true;
    const label = t(`tasks.status.${value}`, { defaultValue: value }).toLowerCase();
    return label.includes(q) || value.toLowerCase().includes(q);
  }).length;
  return { totalCount: ALL_STATUSES.length, filteredCount: filtered, activeSelectedCount: selected.length };
}

function countTypes(selected: TaskType[], q: string, t: TFunction) {
  const filtered = ALL_TYPES.filter((type) => {
    if (!q) return true;
    const label = t(`tasks.types.${type}`, { defaultValue: type }).toLowerCase();
    return label.includes(q) || type.toLowerCase().includes(q);
  }).length;
  return { totalCount: ALL_TYPES.length, filteredCount: filtered, activeSelectedCount: selected.length };
}

function countSchedules(selected: string[], q: string, t: TFunction) {
  const labels = [
    t("tasks.timelineGrid.scheduleAll", { defaultValue: "Tất cả" }),
    t("tasks.timelineGrid.scheduleUnscheduled", { defaultValue: "Chưa có hạn" }),
    t("tasks.timelineGrid.scheduleOverdue", { defaultValue: "Quá hạn" }),
  ];
  const filtered = labels.filter((lbl) => !q || lbl.toLowerCase().includes(q)).length;
  return {
    totalCount: labels.length,
    filteredCount: filtered,
    activeSelectedCount: selected.filter((s) => s !== "ALL").length,
  };
}

function countPriorities(selected: string[], q: string, t: TFunction) {
  const filtered = ALL_PRIORITIES.filter((priority) => {
    if (!q) return true;
    const label = t(`tasks.priority.${priority}`, { defaultValue: priority }).toLowerCase();
    return label.includes(q) || priority.toLowerCase().includes(q);
  }).length;
  return { totalCount: ALL_PRIORITIES.length, filteredCount: filtered, activeSelectedCount: selected.length };
}

function countReporters(
  reporters: TaskTimelineAssignee[],
  selected: string[],
  currentUser: { id?: string; name?: string } | null | undefined,
  q: string,
  t: TFunction,
) {
  const valid = reporters.filter((p) => p.id !== "UNASSIGNED" && p.id !== currentUser?.id);
  const curLabel = t("tasks.timelineGrid.currentUser", { defaultValue: "Người dùng hiện tại" }).toLowerCase();
  const cName = currentUser?.name?.toLowerCase() || "";
  const showCur = !q || curLabel.includes(q) || "current user".includes(q) || (cName && cName.includes(q));
  const filtered = valid.filter((p) => !q || p.name.toLowerCase().includes(q)).length;
  return {
    totalCount: 1 + valid.length,
    filteredCount: (showCur ? 1 : 0) + filtered,
    activeSelectedCount: selected.length,
  };
}

function countApprovals(selected: string[], q: string, t: TFunction) {
  const labels = [
    t("tasks.timelineGrid.approvalYes", { defaultValue: "Cần khách hàng duyệt" }),
    t("tasks.timelineGrid.approvalNo", { defaultValue: "Không cần khách hàng duyệt" }),
  ];
  const filtered = labels.filter((lbl) => !q || lbl.toLowerCase().includes(q)).length;
  return { totalCount: 2, filteredCount: filtered, activeSelectedCount: selected.length };
}