import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import { executeVideoSpaceRequest } from "@/pages/video-space/services/videoSpaceService";
import type {
  ProductVideoPlanRequest,
  ProductVideoProduction,
  ProductVideoQuote,
} from "@/pages/product-video/types/productVideo";

const base = (workspaceId: string) =>
  `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/ai/video-productions`;
const item = (workspaceId: string, productionId: string) =>
  `${base(workspaceId)}/${encodeURIComponent(productionId)}`;
const options = (key?: string, signal?: AbortSignal) => ({
  signal,
  ...(key ? { headers: { "Idempotency-Key": key } } : {}),
});
async function post<T>(
  url: string,
  body: unknown,
  key?: string,
  signal?: AbortSignal,
): Promise<T> {
  return requireApiData<T>(
    (await api.post(url, body, options(key, signal))).data,
  );
}
export function canApproveProduction(
  production: ProductVideoProduction | undefined,
  dirty: boolean,
  now = Date.now(),
): boolean {
  return (
    !!production &&
    production.state === "PLAN_READY" &&
    !dirty &&
    production.providerReady &&
    !production.missingInputs?.length &&
    !!production.quote &&
    Number.isFinite(Date.parse(production.quote.expiresAt)) &&
    Date.parse(production.quote.expiresAt) > now
  );
}
export const productVideoService = {
  plan: (
    workspaceId: string,
    body: ProductVideoPlanRequest,
    signal?: AbortSignal,
  ) =>
    post<ProductVideoProduction>(
      `${base(workspaceId)}/plan`,
      body,
      undefined,
      signal,
    ),
  get: async (
    workspaceId: string,
    productionId: string,
    signal?: AbortSignal,
  ) =>
    requireApiData<ProductVideoProduction>(
      (await api.get(item(workspaceId, productionId), { signal })).data,
    ),
  generate: (
    workspaceId: string,
    productionId: string,
    body: { revision: number; quoteId: string },
    key: string,
    signal?: AbortSignal,
  ) =>
    post<ProductVideoProduction>(
      `${item(workspaceId, productionId)}/generate`,
      body,
      key,
      signal,
    ),
  retryQuote: (
    workspaceId: string,
    productionId: string,
    sceneId: string,
    revision: number,
    signal?: AbortSignal,
  ) =>
    post<ProductVideoQuote>(
      `${item(workspaceId, productionId)}/scenes/${encodeURIComponent(sceneId)}/retry`,
      { revision },
      undefined,
      signal,
    ),
  retryScene: (
    workspaceId: string,
    productionId: string,
    sceneId: string,
    revision: number,
    quoteId: string,
    key: string,
    signal?: AbortSignal,
  ) =>
    post<ProductVideoProduction>(
      `${item(workspaceId, productionId)}/scenes/${encodeURIComponent(sceneId)}/retry`,
      { revision, quoteId },
      key,
      signal,
    ),
  retryRender: (
    workspaceId: string,
    productionId: string,
    revision: number,
    key: string,
    signal?: AbortSignal,
  ) =>
    post<ProductVideoProduction>(
      `${item(workspaceId, productionId)}/render-retry`,
      { revision },
      key,
      signal,
    ),
  content: async (
    workspaceId: string,
    productionId: string,
    signal?: AbortSignal,
  ): Promise<Blob> =>
    (
      await api.get(`${item(workspaceId, productionId)}/content`, {
        responseType: "blob",
        signal,
      })
    ).data,
};

export async function uploadProductImage(
  workspaceId: string,
  projectId: string,
  file: File,
  signal: AbortSignal,
): Promise<string> {
  if (
    !["image/jpeg", "image/png"].includes(file.type) ||
    file.size > 10 * 1024 * 1024 ||
    !file.size
  )
    throw new Error("PRODUCT_VIDEO_IMAGE_INVALID");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("PRODUCT_VIDEO_IMAGE_INVALID");
  }
  const { width, height } = bitmap;
  bitmap.close();
  if (width * height > 20_000_000 || width < 1 || height < 1)
    throw new Error("PRODUCT_VIDEO_IMAGE_INVALID");
  const assetId = crypto.randomUUID();
  const result = await executeVideoSpaceRequest(
    {
      type: "brandhub-video-space:request",
      version: 1,
      sessionId: "product-video",
      requestId: crypto.randomUUID(),
      method: "PUT",
      responseType: "json",
      path: `/api/v1/workspaces/${workspaceId}/video-projects/${projectId}/media/${assetId}`,
      body: {
        file,
        metadata: JSON.stringify({
          id: assetId,
          name: file.name,
          type: "image",
          width,
          height,
          mimeType: file.type,
          lastModified: file.lastModified,
        }),
      },
    },
    signal,
  );
  requireApiData(result.body);
  return assetId;
}
