import type { Campaign } from "@/pages/campaign/types";
import type {
  TimelineTask,
  TimelineSubtask,
  TimelineFilters,
  TimelineView,
} from "@/pages/campaign/types/campaignTimeline";
import { matchesTimeline } from "@/pages/campaign/utils/timelineFilters";
export type TimelineNode =
  | { kind: "group"; id: string; name: string; count: number }
  | { kind: "task"; row: TimelineTask; contextOnly: boolean }
  | { kind: "sub"; row: TimelineSubtask; parent: TimelineTask }
  | { kind: "add"; parent: TimelineTask }
  | { kind: "creator"; parent: TimelineTask };
export function buildTimelineNodes(
  campaign: Campaign,
  data: TimelineView,
  filters: TimelineFilters,
  userId: string,
  today: string,
  expanded: Readonly<Record<string, boolean>>,
  collapsed: Readonly<Record<string, boolean>>,
  creating: string | null,
  filtered: boolean,
  otherName: string,
): TimelineNode[] {
  const result: TimelineNode[] = [];
  const workItems = new Map(campaign.workItems.map((w) => [w.id, w]));
  const groups = [
    ...campaign.deliverablePlan.map((d) => ({ id: d.id, name: d.name })),
    { id: "other", name: otherName },
  ];
  for (const group of groups) {
    const children: TimelineNode[] = [];
    let matched = 0;
    for (const task of data.rows) {
      const deliverable =
        workItems.get(task.campaignWorkItemId ?? "")?.deliverableId ?? "other";
      if (deliverable !== group.id) continue;
      const ownMatch = matchesTimeline(
        task,
        task,
        filters,
        userId,
        data.timezone,
        today,
        deliverable,
      );
      const subs = task.subtasks.filter((s) =>
        matchesTimeline(
          s,
          task,
          filters,
          userId,
          data.timezone,
          today,
          deliverable,
        ),
      );
      if (!ownMatch && !subs.length) continue;
      matched++;
      children.push({ kind: "task", row: task, contextOnly: !ownMatch });
      if (!!expanded[task.id] || (filtered && subs.length > 0)) {
        children.push(
          ...subs.map((row) => ({ kind: "sub" as const, row, parent: task })),
        );
        if (task.canManageSubtasks)
          children.push({ kind: "add", parent: task });
        if (creating === task.id)
          children.push({ kind: "creator", parent: task });
      }
    }
    if (matched) {
      result.push({
        kind: "group",
        id: group.id,
        name: group.name,
        count: matched,
      });
      if (!collapsed[group.id] || filtered) result.push(...children);
    }
  }
  return result;
}
