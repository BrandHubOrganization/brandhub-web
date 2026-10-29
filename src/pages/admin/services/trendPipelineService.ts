import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type {
  TrendPipelineRun,
  TrendPipelineRuns,
  TrendPipelineStatus,
} from "@/pages/admin/types/trendPipeline";

const path = "/api/v1/admin/ai/trend-pipeline";
export const trendPipelineService = {
  async status(signal?: AbortSignal) {
    return requireApiData<TrendPipelineStatus>(
      (await api.get(path, { signal, timeout: 20_000 })).data,
    );
  },
  async runs(signal?: AbortSignal) {
    return requireApiData<TrendPipelineRuns>(
      (await api.get(path + "/runs", { signal, timeout: 20_000 })).data,
    );
  },
  async start() {
    return requireApiData<TrendPipelineRun>(
      (await api.post(path + "/runs", {}, { timeout: 30_000 })).data,
    );
  },
};
