import { api } from "@/lib/axios";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type {
  TrendHistory,
  TrendPage,
} from "@/pages/workspace-trends/types/trends";

export async function listWorkspaceTrends(
  workspaceId: string,
  date: string,
  q: string,
  cursor: string | undefined,
  signal: AbortSignal,
) {
  const response = await api.get<ApiResponse<TrendPage>>(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/trends`,
    {
      params: { date: date || undefined, q, cursor, limit: 20 },
      signal,
    },
  );
  return requireApiData<TrendPage>(response.data);
}

export async function getTrendHistory(
  workspaceId: string,
  keyword: string,
  endDate: string,
  days: number,
  signal: AbortSignal,
) {
  const response = await api.get<ApiResponse<TrendHistory>>(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/trends/history`,
    {
      params: { keyword, endDate: endDate || undefined, days },
      signal,
    },
  );
  return requireApiData<TrendHistory>(response.data);
}
