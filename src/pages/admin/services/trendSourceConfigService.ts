import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type { TrendSourceConfig } from "@/pages/admin/types/trendSourceConfig";

const path = "/api/v1/admin/ai/trend-pipeline/source-config";
export const trendSourceConfigService = {
  async get(signal?: AbortSignal) {
    return requireApiData<TrendSourceConfig>(
      (await api.get(path, { signal, timeout: 15_000 })).data,
    );
  },
  async save(config: TrendSourceConfig) {
    return requireApiData<TrendSourceConfig>(
      (await api.patch(path, config, { timeout: 15_000 })).data,
    );
  },
};
