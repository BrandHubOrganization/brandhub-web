import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type { TaskListItem, TaskPriority, TaskStatus, TaskType } from "@/types/task";
import { campaignService } from "@/pages/campaign/services/campaignService";
import {
  countActiveFilters,
  extractUniqueAssignees,
  extractUniqueParents,
  extractUniqueReporters,
  filterTasks,
  type TaskTimelineAssignee,
  type TaskTimelineParent,
} from "@/pages/tasks/utils/taskFilterUtils";
import type { FilterCategory } from "@/pages/tasks/components/filters/TaskFilterPopoverOptions";

export function useTaskFilters(tasks: TaskListItem[], workspaceId?: string) {
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const userId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<TaskType[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [selectedReporters, setSelectedReporters] = useState<string[]>([]);
  const [selectedApprovals, setSelectedApprovals] = useState<("YES" | "NO")[]>([]);
  const [now] = useState(() => Date.now());

  // Defense-in-depth: Creator only sees and interacts with their own assigned tasks
  const scopedTasks = useMemo(() => {
    if (currentMemberRole === "CREATOR" && userId) {
      return tasks.filter((task) => task.assigneeId === userId);
    }
    return tasks;
  }, [tasks, currentMemberRole, userId]);

  const { data: campaigns } = useQuery({
    queryKey: ["workspace-campaigns", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        const res = await campaignService.list(workspaceId);
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(workspaceId),
    staleTime: 5 * 60 * 1000,
  });

  const uniqueAssignees = useMemo<TaskTimelineAssignee[]>(() => {
    return extractUniqueAssignees(scopedTasks);
  }, [scopedTasks]);

  const uniqueParents = useMemo<TaskTimelineParent[]>(() => {
    const parentList = campaigns?.map((c) => ({ id: c.id, name: c.name })) || [];
    return extractUniqueParents(scopedTasks, parentList);
  }, [scopedTasks, campaigns]);

  const uniqueReporters = useMemo<TaskTimelineAssignee[]>(() => {
    return extractUniqueReporters(scopedTasks);
  }, [scopedTasks]);

  const toggleAssignee = useCallback((id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleStatus = useCallback((status: TaskStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((x) => x !== status)
        : [...prev, status],
    );
  }, []);

  const toggleType = useCallback((type: TaskType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type],
    );
  }, []);

  const toggleSchedule = useCallback((schedule: string) => {
    if (schedule === "ALL") {
      setSelectedSchedules([]);
      return;
    }
    setSelectedSchedules((prev) =>
      prev.includes(schedule)
        ? prev.filter((x) => x !== schedule)
        : [...prev, schedule],
    );
  }, []);

  const toggleParent = useCallback((id: string) => {
    setSelectedParents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const togglePriority = useCallback((priority: TaskPriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((x) => x !== priority)
        : [...prev, priority],
    );
  }, []);

  const toggleReporter = useCallback((id: string) => {
    setSelectedReporters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleApproval = useCallback((approval: "YES" | "NO") => {
    setSelectedApprovals((prev) =>
      prev.includes(approval)
        ? prev.filter((x) => x !== approval)
        : [...prev, approval],
    );
  }, []);

  const clearCategory = useCallback((category: FilterCategory) => {
    switch (category) {
      case "parent":
        setSelectedParents([]);
        break;
      case "assignee":
        setSelectedAssignees([]);
        break;
      case "status":
        setSelectedStatuses([]);
        break;
      case "type":
        setSelectedTypes([]);
        break;
      case "schedule":
        setSelectedSchedules([]);
        break;
      case "priority":
        setSelectedPriorities([]);
        break;
      case "reporter":
        setSelectedReporters([]);
        break;
      case "approval":
        setSelectedApprovals([]);
        break;
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setSelectedAssignees([]);
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedSchedules([]);
    setSelectedParents([]);
    setSelectedPriorities([]);
    setSelectedReporters([]);
    setSelectedApprovals([]);
  }, []);

  const activeFilterCount = useMemo(() => {
    return countActiveFilters({
      assignees: selectedAssignees,
      statuses: selectedStatuses,
      types: selectedTypes,
      schedules: selectedSchedules,
      parents: selectedParents,
      priorities: selectedPriorities,
      reporters: selectedReporters,
      approvals: selectedApprovals,
    });
  }, [
    selectedAssignees,
    selectedStatuses,
    selectedTypes,
    selectedSchedules,
    selectedParents,
    selectedPriorities,
    selectedReporters,
    selectedApprovals,
  ]);

  const filteredTasks = useMemo(() => {
    return filterTasks(
      scopedTasks,
      {
        search,
        assignees: selectedAssignees,
        statuses: selectedStatuses,
        types: selectedTypes,
        schedules: selectedSchedules,
        parents: selectedParents,
        priorities: selectedPriorities,
        reporters: selectedReporters,
        approvals: selectedApprovals,
      },
      now,
    );
  }, [
    scopedTasks,
    now,
    search,
    selectedAssignees,
    selectedStatuses,
    selectedTypes,
    selectedSchedules,
    selectedParents,
    selectedPriorities,
    selectedReporters,
    selectedApprovals,
  ]);

  const isFiltered = activeFilterCount > 0 || Boolean(search.trim());

  return {
    search,
    setSearch,
    selectedAssignees,
    toggleAssignee,
    selectedStatuses,
    toggleStatus,
    selectedTypes,
    toggleType,
    selectedSchedules,
    toggleSchedule,
    selectedParents,
    toggleParent,
    selectedPriorities,
    togglePriority,
    selectedReporters,
    toggleReporter,
    selectedApprovals,
    toggleApproval,
    clearCategory,
    clearAllFilters,
    activeFilterCount,
    uniqueAssignees,
    uniqueParents,
    uniqueReporters,
    filteredTasks,
    isFiltered,
  };
}
