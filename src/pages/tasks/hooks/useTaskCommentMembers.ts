import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { taskCommentService } from "@/pages/tasks/services/taskCommentService";
import { useAuthStore } from "@/store/authStore";

export function useTaskCommentMembers({
  workspaceId,
  taskId,
  search,
  enabled,
}: {
  workspaceId: string;
  taskId: string;
  search: string;
  enabled: boolean;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const debouncedSearch = useDebounce(search, 200);
  const isSearching = search !== debouncedSearch;
  const members = useInfiniteQuery({
    queryKey: [
      "task-comment-members",
      userId,
      workspaceId,
      taskId,
      debouncedSearch,
    ],
    queryFn: ({ pageParam, signal }) =>
      taskCommentService.members(
        workspaceId,
        taskId,
        debouncedSearch,
        pageParam,
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (last, pages) =>
      last.hasMore ? pages.length : undefined,
    enabled: enabled && !isSearching,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return { ...members, isSearching };
}
