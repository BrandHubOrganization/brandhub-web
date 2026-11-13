import type {
  TimelineFilters,
  TimelineSubtask,
  TimelineTask,
} from "@/pages/campaign/types/campaignTimeline";
import { localDay } from "@/pages/campaign/utils/timelineDates";
function stripTimelineHtml(raw?: string | null): string {
  return (raw ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function isTimelineItemMissingDetails(
  item: TimelineTask | TimelineSubtask,
): boolean {
  if ("parentTaskId" in item) {
    return (
      !stripTimelineHtml(item.description) ||
      !stripTimelineHtml(item.acceptanceCriteria)
    );
  }
  if (
    typeof item.description === "string" ||
    typeof item.acceptanceCriteria === "string"
  ) {
    return (
      !stripTimelineHtml(item.description) ||
      !stripTimelineHtml(item.acceptanceCriteria)
    );
  }
  return Boolean(item.missingDetails);
}

export function matchesTimeline(
  item: TimelineTask | TimelineSubtask,
  parent: TimelineTask,
  filters: TimelineFilters,
  _userId: string,
  zone: string,
  today: string,
  deliverable: string,
) {
  const supervisor =
    "supervisorOverrideId" in item
      ? (item.supervisorOverrideId ?? parent.assigneeId)
      : item.supervisorId;
  if (
    filters.search &&
    !item.name
      .toLocaleLowerCase()
      .includes(filters.search.trim().toLocaleLowerCase())
  )
    return false;
  if (
    filters.assignee.length &&
    !filters.assignee.includes(item.assigneeId || "unassigned")
  )
    return false;
  if (
    filters.supervisor.length &&
    (!supervisor || !filters.supervisor.includes(supervisor))
  )
    return false;
  if (filters.statuses.length && !filters.statuses.includes(item.status))
    return false;
  if (filters.types.length && !filters.types.includes(parent.type))
    return false;
  if (filters.deliverable.length && !filters.deliverable.includes(deliverable))
    return false;
  const itemMissingDetails = isTimelineItemMissingDetails(item);
  if (filters.completeness === "missingDetails" && !itemMissingDetails)
    return false;
  if (filters.completeness === "complete" && itemMissingDetails)
    return false;
  if (filters.schedule === "all" && !filters.from && !filters.to) return true;
  const start = localDay(item.plannedStartDate, zone),
    end = localDay(item.dueDate, zone);
  if (filters.schedule === "missing" && start && end) return false;
  if (
    filters.schedule === "overdue" &&
    (!end || end >= today || ["FINISHED", "CANCELLED"].includes(item.status))
  )
    return false;
  if (
    (filters.from && (!end || end < filters.from)) ||
    (filters.to && (!start || start > filters.to))
  )
    return false;
  return true;
}
export function myTaskRelation(
  assignee: string | null,
  supervisor: string | null,
  userId: string,
) {
  return assignee === userId && supervisor === userId
    ? "both"
    : assignee === userId
      ? "assignee"
      : supervisor === userId
        ? "supervisor"
        : "none";
}
