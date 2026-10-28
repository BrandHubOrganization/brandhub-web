import { api } from "@/lib/axios";
import { requireApiData } from "@/lib/apiData";
import type {
  ReplayJob,
  ReplaySelection,
  ReplaySummary,
  ReplayResult,
} from "@/pages/admin/types/trendReplay";

const path = "/api/v1/admin/ai/trend-replays";
export const trendReplayService = {
  async preview(selection: ReplaySelection) {
    return requireApiData<ReplayJob>(
      (await api.post(`${path}/preview`, selection)).data,
    );
  },
  async list() {
    return requireApiData<{ jobs: ReplaySummary[] }>(
      (await api.get(path)).data,
    );
  },
  async get(id: string) {
    return requireApiData<ReplayJob>((await api.get(`${path}/${id}`)).data);
  },
  async start(id: string) {
    return requireApiData<ReplayJob>(
      (await api.post(`${path}/${id}/start`)).data,
    );
  },
  async result(id: string, day: string) {
    return requireApiData<ReplayResult>(
      (await api.get(`${path}/${id}/days/${day}`)).data,
    );
  },
};
