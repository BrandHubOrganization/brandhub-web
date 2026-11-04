import { useQuery } from "@tanstack/react-query";
import { taskPostService } from "@/pages/editor/services/taskPostService";
import type { TaskPost } from "@/pages/editor/services/taskPostService";
import { useWorkspaceStore } from "@/store/workspaceStore";

export function useTaskPost(
  workspaceId: string,
  taskId: string,
  enabled: boolean = true,
) {
  // API bài viết của Task từ chối Owner, không cần gọi để nhận 403.
  const role = useWorkspaceStore(
    (s) => s.currentMemberRole || s.currentWorkspace?.myRole,
  );
  return useQuery<TaskPost | null>({
    queryKey: ["task-post", workspaceId, taskId],
    queryFn: async () => {
      try {
        return await taskPostService.read(workspaceId, taskId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(workspaceId && taskId && enabled && role !== "OWNER"),
    staleTime: 30000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
