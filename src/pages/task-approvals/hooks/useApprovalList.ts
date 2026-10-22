import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { taskService } from "@/services/taskService";

export function useApprovalList(
  workspaceId: string,
  filters: {
    status: string;
    search: string;
    page: number;
    revision: number;
  },
) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["task-approval-list", userId, workspaceId, filters],
    queryFn: () =>
      taskService.getWorkspaceTasks(workspaceId, {
        type: "POST",
        status: filters.status,
        search: filters.search,
        page: filters.page,
        size: 15,
        sort: "createdAt",
        direction: "desc",
      }),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
