import { useCallback, useEffect, useState } from "react";
import type { PostedDetailData } from "../types/postDetail";
import { postDetailService } from "../services/postDetailService";

export function usePostDetail(workspaceId: string, postId: string) {
  const [data, setData] = useState<PostedDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadDetail = useCallback(
    async (refreshMetrics = false) => {
      if (!workspaceId || !postId) return;
      if (refreshMetrics) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);

      try {
        const result = await postDetailService.getPostDetail(
          workspaceId,
          postId,
          refreshMetrics,
        );
        setData(result);
      } catch (err) {
        console.error("Failed to load post detail:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [workspaceId, postId],
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return {
    data,
    isLoading,
    isRefreshing,
    isError,
    refreshMetrics: () => loadDetail(true),
    refetch: () => loadDetail(false),
  };
}
