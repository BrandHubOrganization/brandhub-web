import { z } from "zod";
import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import {
  publishedTrendSchema,
  trendSummarySchema,
} from "@/pages/admin/types/trendView";
import type { TrendViewSelection } from "@/pages/admin/types/trendView";

const PATH = "/api/v1/admin/ai/trends";

export const trendViewService = {
  async list(selection: TrendViewSelection, signal?: AbortSignal) {
    const response = await api.get(PATH, { params: selection, signal });
    return z
      .array(publishedTrendSchema)
      .parse(requireApiData<unknown>(response.data));
  },
  async summary(signal?: AbortSignal) {
    const response = await api.get(`${PATH}/summary`, { signal });
    return trendSummarySchema.parse(requireApiData<unknown>(response.data));
  },
};
