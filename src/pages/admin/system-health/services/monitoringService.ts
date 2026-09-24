import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type {
  MonitoringPage,
  ServerHealth,
  Snapshot,
  TargetHealth,
} from "@/pages/admin/system-health/types/monitoring";

export class MonitoringAccessError extends Error {
  readonly status: number;
  constructor(status: number) {
    super("MONITORING_ACCESS_DENIED");
    this.status = status;
  }
}

async function readPages(
  path: string,
  signal: AbortSignal,
): Promise<MonitoringPage[]> {
  const pages: MonitoringPage[] = [];
  let count = 1;
  for (let page = 0; page < count; page++) {
    const response = await api.get<ApiResponse<MonitoringPage>>(
      "/api/monitoring/" + path,
      {
        signal,
        params: { page, size: 200 },
        timeout: 5000,
        // Monitoring must clear protected data immediately instead of silently refreshing a revoked session.
        validateStatus: (status) => status < 500,
      },
    );
    if ([401, 403].includes(response.status))
      throw new MonitoringAccessError(response.status);
    if (response.status !== 200 || !response.data.success)
      throw new Error("MONITORING_UNAVAILABLE");
    pages.push(response.data.data);
    count = response.data.data.totalPages;
  }
  return pages;
}

/** Fetch complete bounded pages before replacing a dashboard snapshot. */
export async function readServers(
  signal: AbortSignal,
): Promise<Snapshot<ServerHealth>> {
  const pages = await readPages("servers", signal);
  return {
    rows: pages.flatMap((page) => page.servers ?? []),
    serverTime: pages[0].serverTime,
  };
}

/** Host and health reads remain separate so either source may fail independently. */
export async function readTargets(
  signal: AbortSignal,
): Promise<Snapshot<TargetHealth>> {
  const pages = await readPages("health-targets", signal);
  return {
    rows: pages.flatMap((page) => page.targets ?? []),
    serverTime: pages[0].serverTime,
  };
}
