import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { creditService } from "@/pages/credit/services/creditService";
import {
  CREDIT_QUERY_OPTIONS,
  creditKeys,
} from "@/pages/credit/utils/creditQuery";
import type { WorkspaceCredit } from "@/pages/credit/types/credit";

export function useWorkspaceCredit(agencyId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const key = [...creditKeys.scope(userId, agencyId), "workspaces"];
  const query = useQuery({
    ...CREDIT_QUERY_OPTIONS,
    queryKey: key,
    enabled: !!userId,
    queryFn: ({ signal }) => creditService.workspaces(agencyId, signal),
  });
  const save = async (workspace: WorkspaceCredit, cap: number | null) => {
    const updated = await creditService.saveWorkspace(agencyId, workspace, cap);
    client.setQueryData<WorkspaceCredit[]>(key, (previous = []) =>
      previous.map((entry) =>
        entry.workspaceId === updated.workspaceId ? updated : entry,
      ),
    );
    await client.invalidateQueries({ queryKey: ["workspace-ai", userId] });
  };
  return { query, save };
}
