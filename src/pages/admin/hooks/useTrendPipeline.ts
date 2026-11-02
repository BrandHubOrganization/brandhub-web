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
    mutationFn: (runId: string | undefined) =>
      runId ? service.recover(runId) : service.start(),
    retry: false,
    onSuccess: (run, runId) => {
      client.setQueryData<TrendPipelineRuns>(
        ["admin", "ai", "trend-pipeline-runs"],
        (current) => ({
          running: run.status === "RUNNING" ? run : null,
          history: (current?.history ?? []).filter(
            (old) => old.pipelineRunId !== run.pipelineRunId,
          ),
        }),
      );
      toast.success(
        t(
          runId
            ? "admin.trendPipeline.recoveryAccepted"
            : "admin.trendPipeline.accepted",
        ),
      );
      refresh();
      onAccepted();
    },
    onError: (error: unknown, runId) => {
      const code = isAxiosError<{ error?: { code?: string } }>(error)
        ? error.response?.data?.error?.code
        : undefined;
      toast.error(
        t(
          code === "TREND_PIPELINE_ALREADY_RUNNING"
            ? "admin.trendPipeline.busy"
            : code === "TREND_PIPELINE_NOT_READY"
              ? runId
                ? "admin.trendPipeline.recoveryNotReady"
                : "admin.trendPipeline.notReady"
              : code === "TREND_PIPELINE_RECOVERY_NOT_ALLOWED"
                ? "admin.trendPipeline.recoveryConflict"
                : code === "TREND_PIPELINE_RUN_NOT_FOUND"
                  ? "admin.trendPipeline.runNotFound"
                  : "admin.trendPipeline.error",
        ),
      );
      refresh();
    },
  });
  const submit = async (runId?: string) => {
    if (pending.current) return;
    pending.current = true;
    try {
      await mutation.mutateAsync(runId);
    } finally {
      pending.current = false;
    }
  };
  return {
    status,
    runs,
    mutation,
    refresh,
    start: () => submit(),
    recover: (runId: string) => submit(runId),
  };
}
