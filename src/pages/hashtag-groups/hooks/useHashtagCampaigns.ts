import { useQuery } from "@tanstack/react-query";
import { listHashtagCampaigns } from "@/pages/hashtag-groups/services/hashtagService";

export function useHashtagCampaigns(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: ["hashtag-campaigns", workspaceId],
    queryFn: ({ signal }) => listHashtagCampaigns(workspaceId, signal),
    enabled,
    retry: false,
  });
}
