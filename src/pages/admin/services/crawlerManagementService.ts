import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type {
  CredentialKind,
  CredentialMetadata,
  CrawlerHealth,
  RunOptions,
  RunPreview,
  CrawlerRunDetail,
} from "@/pages/admin/types/crawlerManagement";
import type { TrendPipelineRun } from "@/pages/admin/types/trendPipeline";

const path = "/api/v1/admin/ai/trend-pipeline/management";
export const crawlerManagementService = {
  async health(signal?: AbortSignal) {
    return requireApiData<CrawlerHealth>(
      (await api.get(path + "/health", { signal, timeout: 20_000 })).data,
    );
  },
  async credentials(signal?: AbortSignal) {
    return requireApiData<{
      storageReady: boolean;
      sessionStorage?: "memory";
      items: CredentialMetadata[];
    }>((await api.get(path + "/credentials", { signal })).data);
  },
  // Credentials use direct promises; secret payloads never enter the Query mutation cache.
  async replace(kind: CredentialKind, payload: Record<string, unknown>) {
    return requireApiData<CredentialMetadata>(
      (
        await api.post(path + "/credentials/" + kind, payload, {
          timeout: 20_000,
        })
      ).data,
    );
  },
  async credentialAction(
    kind: CredentialKind,
    action: "probe" | "revoke",
    revision: number,
  ) {
    return requireApiData<CredentialMetadata>(
      (
        await api.post(
          `${path}/credentials/${kind}/${action}`,
          { revision },
          { timeout: 45_000 },
        )
      ).data,
    );
  },
  async preview(options: RunOptions) {
    return requireApiData<RunPreview>(
      (await api.post(path + "/preview", options)).data,
    );
  },
  async start(
    options: RunOptions & {
      revision: number;
      sourceRevision?: number | null;
      requestId: string;
    },
  ) {
    return requireApiData<TrendPipelineRun>(
      (await api.post(path + "/start", options, { timeout: 30_000 })).data,
    );
  },
  async stop(id: string) {
    return requireApiData<{ status: string }>(
      (await api.post(`${path}/runs/${encodeURIComponent(id)}/stop`, {})).data,
    );
  },
  async detail(id: string, offset: number, signal?: AbortSignal) {
    return requireApiData<CrawlerRunDetail>(
      (
        await api.get(`${path}/runs/${encodeURIComponent(id)}`, {
          params: { offset },
          signal,
        })
      ).data,
    );
  },
};
