import { useState, useEffect, useCallback, useRef } from "react";
import { taskService } from "@/services/taskService";
import type { TaskListItem } from "@/types/task";

export function useTasks(workspaceId: string) {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [loadedWorkspace, setLoadedWorkspace] = useState("");
  const requestSequence = useRef(0);

  // Filters & Sorting state
  const [search, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortField, setSortField] = useState<
    "dueDate" | "createdAt" | "name" | "status"
  >("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const loadTasks = useCallback(
    async (background = false) => {
      if (!workspaceId) return;
      const sequence = ++requestSequence.current;
      if (!background) setLoading(true);
      setError(false);
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
        if (sequence !== requestSequence.current) return;
        setTasks(res.content);
        setRefreshError(false);
        setLoadedWorkspace(workspaceId);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch {
        if (sequence === requestSequence.current) {
          // Never unmount row editors/drafts because an automatic refresh failed.
          if (!background) {
            setError(true);
            setTasks([]);
          } else setRefreshError(true);
        }
      } finally {
        if (sequence === requestSequence.current) setLoading(false);
      }
    },
    [
      workspaceId,
      page,
      sortField,
      sortDirection,
      statusFilter,
      typeFilter,
      search,
    ],
  );

  useEffect(() => {
    loadTasks();
    return () => {
      requestSequence.current++;
    };
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

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(0);
  };

  return {
    tasks: loadedWorkspace === workspaceId && !error ? tasks : [],
    error,
    refreshError,
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
  };
}
