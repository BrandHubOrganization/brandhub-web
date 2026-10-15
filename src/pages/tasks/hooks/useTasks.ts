import { useState, useEffect, useCallback } from "react";
import { taskService } from "@/services/taskService";
import type { TaskListItem } from "@/types/task";

export function useTasks(workspaceId: string) {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Sorting state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"dueDate" | "createdAt" | "name" | "status">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const loadTasks = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await taskService.getWorkspaceTasks(workspaceId, {
        page,
        size: 15,
        sort: sortField,
        direction: sortDirection,
        status: statusFilter,
        type: typeFilter,
        search,
      });
      setTasks(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, page, sortField, sortDirection, statusFilter, typeFilter, search]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSort = (field: "dueDate" | "createdAt" | "name" | "status") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(0);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setPage(0);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskListItem["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const updateTaskDueDate = (taskId: string, newDueDate: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate } : t))
    );
  };

  return {
    tasks,
    setTasks,
    loading,
    page,
    setPage,
    totalPages,
    totalElements,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    sortField,
    sortDirection,
    handleSort,
    loadTasks,
    resetFilters,
    updateTaskStatus,
    updateTaskDueDate,
  };
}
