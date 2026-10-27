import { useQuery } from "@tanstack/react-query";
import { materialService } from "@/services/materialService";
import { useAuthStore } from "@/store/authStore";

export function useMaterialDetail(workspace: string, id: string) {
  const actor = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["material-detail", workspace, actor, id],
    queryFn: ({ signal }) => materialService.get(workspace, id, signal),
    enabled: !!actor,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
