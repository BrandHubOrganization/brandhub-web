import { useQuery } from "@tanstack/react-query";
import { taskPostService } from "@/pages/editor/services/taskPostService";
import type { TaskPost } from "@/pages/editor/services/taskPostService";

export function useTaskPost(
  workspaceId: string,
  taskId: string,
  enabled: boolean = true,
) {
  return useQuery<TaskPost | null>({
    queryKey: ["task-post", workspaceId, taskId],
    queryFn: async () => {
      try {
        return await taskPostService.read(workspaceId, taskId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(workspaceId && taskId && enabled),
    staleTime: 30000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
