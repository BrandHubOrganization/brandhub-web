import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { trendPipelineService as service } from "@/pages/admin/services/trendPipelineService";
import type { TrendPipelineRuns } from "@/pages/admin/types/trendPipeline";

export function useTrendPipeline(onAccepted: () => void) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const pending = useRef(false);
  const previous = useRef<string | null>(null);
  const status = useQuery({
    queryKey: ["admin", "ai", "trend-pipeline"],
    queryFn: ({ signal }) => service.status(signal),
    refetchInterval: 15_000,
    retry: false,
  });
  const runs = useQuery({
    queryKey: ["admin", "ai", "trend-pipeline-runs"],
    queryFn: ({ signal }) => service.runs(signal),
    refetchInterval: (q) => (q.state.data?.running ? 3_000 : 15_000),
    retry: false,
  });
  const refresh = () => {
    void client.invalidateQueries({
      queryKey: ["admin", "ai", "trend-pipeline"],
    });
    void client.invalidateQueries({
      queryKey: ["admin", "ai", "trend-pipeline-runs"],
    });
  };
  useEffect(() => {
    const id = runs.data?.running?.id ?? null;
    if (runs.data && previous.current && !id) {
      void client.invalidateQueries({ queryKey: ["admin-trends"] });
      void client.invalidateQueries({ queryKey: ["admin-trend-summary"] });
    }
    previous.current = id;
  }, [runs.data, client]);
  const mutation = useMutation({
    mutationFn: service.start,
    retry: false,
    onSuccess: (run) => {
      client.setQueryData<TrendPipelineRuns>(
        ["admin", "ai", "trend-pipeline-runs"],
        (current) => ({
          running: run.status === "RUNNING" ? run : null,
          history: current?.history ?? [],
        }),
      );
      toast.success(t("admin.trendPipeline.accepted"));
      refresh();
      onAccepted();
    },
    onError: (error: unknown) => {
      const code = isAxiosError<{ error?: { code?: string } }>(error)
        ? error.response?.data?.error?.code
        : undefined;
      toast.error(
        t(
          code === "TREND_PIPELINE_ALREADY_RUNNING"
            ? "admin.trendPipeline.busy"
            : code === "TREND_PIPELINE_NOT_READY"
              ? "admin.trendPipeline.notReady"
              : "admin.trendPipeline.error",
        ),
      );
      refresh();
    },
  });
  return {
    status,
    runs,
    mutation,
    refresh,
    start: async () => {
      if (pending.current) return;
      pending.current = true;
      try {
        await mutation.mutateAsync();
      } finally {
        pending.current = false;
      }
    },
  };
}
