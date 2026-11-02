import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type { TrendSettings } from "@/pages/admin/types/trendSettings";

const path = "/api/v1/admin/ai/trend-pipeline/config";
export const trendSettingsService = {
  async get(signal?: AbortSignal) {
    return requireApiData<TrendSettings>(
      (await api.get(path, { signal, timeout: 15_000 })).data,
    );
  },
  async save(config: TrendSettings) {
    return requireApiData<TrendSettings>(
      (await api.patch(path, config, { timeout: 15_000 })).data,
    );
  },
};
