import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { materialService } from "@/services/materialService";
import { useMaterialTrash } from "@/pages/library/hooks/useMaterialTrash";
import type { MaterialFilters } from "@/types/material";

export function useMaterialRepository(
  deleted: boolean,
  page: number,
  search: string,
  filters: MaterialFilters,
) {
  const client = useQueryClient();
  const [forbidden, setForbidden] = useState(false);
  const repository = useMaterialTrash(deleted, page, search, filters, {
    blocked: forbidden,
    onForbidden: (workspace, actor) => {
      setForbidden(true);
      client.removeQueries({ queryKey: ["materials", workspace, actor] });
      client.removeQueries({ queryKey: ["material-detail", workspace, actor] });
      client.removeQueries({
        queryKey: ["material-storage-usage", workspace, actor],
      });
      client.removeQueries({
        queryKey: ["repository-upload-profiles", workspace, actor],
      });
    },
  });
  const usage = useQuery({
    queryKey: [
      "material-storage-usage",
      repository.workspace,
      repository.actor,
    ],
    enabled:
      !forbidden &&
      !!repository.workspace &&
      !!repository.actor &&
      ["OWNER", "MANAGER", "CREATOR"].includes(repository.role ?? ""),
    queryFn: ({ signal }) =>
      materialService.storageUsage(repository.workspace!, signal),
    retry: false,
    staleTime: 60_000,
  });
  const retryAccess = () => {
    setForbidden(false);
    void repository.refresh();
  };
  return { ...repository, usage, forbidden, retryAccess };
}
