import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trendSettingsService as service } from "@/pages/admin/services/trendSettingsService";

const key = ["admin", "ai", "trend-pipeline-config"];
export function useTrendSettings() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => service.get(signal),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: service.save,
    retry: false,
    onSuccess: (config) => {
      client.setQueryData(key, config);
      void client.invalidateQueries({
        queryKey: ["admin", "ai", "trend-pipeline"],
      });
    },
  });
  return { query, mutation };
}
