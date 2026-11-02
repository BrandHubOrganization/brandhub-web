import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trendSourceConfigService as service } from "@/pages/admin/services/trendSourceConfigService";
import type { TrendSourceConfig } from "@/pages/admin/types/trendSourceConfig";

const key = ["admin", "ai", "trend-source-config"];
export function useTrendSourceConfig(enabled: boolean) {
  const client = useQueryClient();
  const pending = useRef(false);
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => service.get(signal),
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: service.save,
    retry: false,
    onSuccess: (config) => client.setQueryData(key, config),
  });
  const save = async (config: TrendSourceConfig) => {
    if (pending.current) return;
    pending.current = true;
    try {
      await mutation.mutateAsync(config);
    } finally {
      pending.current = false;
    }
  };
  return { query, mutation, save };
}
