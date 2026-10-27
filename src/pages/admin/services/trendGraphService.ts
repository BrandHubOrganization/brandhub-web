import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import {
  expandedGraphResultSchema,
  graphPageSchema,
  graphResultSchema,
  nodeSearchPageSchema,
} from "@/pages/admin/types/trendGraph";
import type { ApiResponse } from "@/services/authService";
import type {
  GraphExpandSelection,
  GraphNodeSearch,
  GraphSearch,
  GraphSelection,
} from "@/pages/admin/types/trendGraph";

const PATH = "/api/v1/admin/ai/trend-graph";
export const trendGraphService = {
  async search(selection: GraphSearch, signal?: AbortSignal) {
    const response = await api.get<ApiResponse<unknown>>(`${PATH}/trends`, {
      params: selection,
      signal,
    });
    return graphPageSchema.parse(requireApiData<unknown>(response.data));
  },
  async searchNodes(selection: GraphNodeSearch, signal?: AbortSignal) {
    const response = await api.get<ApiResponse<unknown>>(`${PATH}/nodes`, {
      params: selection,
      signal,
    });
    return nodeSearchPageSchema.parse(requireApiData<unknown>(response.data));
  },
  async neighborhood(selection: GraphSelection, signal?: AbortSignal) {
    const response = await api.get<ApiResponse<unknown>>(
      `${PATH}/neighborhood`,
      { params: selection, signal },
    );
    const graph = graphResultSchema.parse(
      requireApiData<unknown>(response.data),
    );
    if (graph.trendId !== selection.trendId)
      throw new Error("GRAPH_SELECTION_MISMATCH");
    return graph;
  },
  async expandNode(selection: GraphExpandSelection, signal?: AbortSignal) {
    const response = await api.get<ApiResponse<unknown>>(`${PATH}/expand`, {
      params: selection,
      signal,
    });
    return expandedGraphResultSchema.parse(
      requireApiData<unknown>(response.data),
    );
  },
};
