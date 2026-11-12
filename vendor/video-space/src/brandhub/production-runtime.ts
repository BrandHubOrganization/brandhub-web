import { EditorCore } from "@/core";
import { getHostContext, getProjectApiBase, hostFetch } from "@/platform/host";
import { storageService } from "@/services/storage/service";
import { CURRENT_PROJECT_VERSION } from "@/services/storage/migrations";
import {
  buildDefaultParamValues,
  getBuiltInElementParams,
} from "@/params/registry";
import { processMediaAssets } from "@/media/processing";
import { readVideoFile } from "@/media/mediabunny";
import {
  initializeGpuRenderer,
  isGpuAvailable,
} from "@/services/renderer/gpu-renderer";
import { projectRequest, VideoSpaceApiError } from "./api";
import { restoreFromServer, saveToServer } from "./sync";
import {
  PRODUCTION_MUSIC,
  type ProductionImportServices,
} from "./import-production";

export async function getProductionImportServices() {
  const context = getHostContext();
  const base = `/api/v1/workspaces/${context.workspaceId}/ai/video-productions/${context.sourceProductionId}`;
  const editor = EditorCore.getInstance();
  const read = async (
    path: string,
    name: string,
    fallback: string,
    local = false,
  ) => {
    const response = local
      ? await fetch(path, { credentials: "same-origin" })
      : await hostFetch(path, { responseType: "blob" });
    if (!response.ok)
      throw new VideoSpaceApiError(
        "Could not read the production media",
        response.status,
      );
    const blob = await response.blob();
    return new File([blob], name, { type: blob.type || fallback });
  };
  const services: ProductionImportServices = {
    version: CURRENT_PROJECT_VERSION,
    params: (type) =>
      buildDefaultParamValues(getBuiltInElementParams({ type })),
    lock: (name, run) => {
      if (!navigator.locks)
        throw new Error(
          context.locale === "en"
            ? "Use a current desktop browser to open the editable production safely."
            : "Hãy dùng trình duyệt máy tính phiên bản mới để mở bản dựng an toàn.",
        );
      return navigator.locks.request(name, { mode: "exclusive" }, run);
    },
    getBundle: () => projectRequest({ path: `${base}/editing-bundle` }),
    loadProject: async (id) =>
      (await storageService.loadProject({ id }))?.project ?? null,
    loadMedia: (projectId) => storageService.loadAllMediaAssets({ projectId }),
    restoreProject: restoreFromServer,
    readSource: (segment) =>
      read(
        `${base}/scenes/${segment.sceneId}/content`,
        `${segment.assetId}.mp4`,
        "video/mp4",
      ),
    readLogo: async (logo, projectId) => {
      // Original raster MIME is preserved; extension follows it for native media detection.
      const file = await read(
        `${getProjectApiBase()}/${projectId}/media/${logo.assetId}`,
        "logo.png",
        "image/png",
      );
      const extension =
        file.type === "image/jpeg"
          ? "jpg"
          : file.type === "image/webp"
            ? "webp"
            : "png";
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
        throw new Error("Unsupported production logo type");
      return new File([file], `logo.${extension}`, { type: file.type });
    },
    readMusic: (catalogId) =>
      read(
        `/video-space/library/assets/music/${PRODUCTION_MUSIC[catalogId]}`,
        PRODUCTION_MUSIC[catalogId],
        "audio/wav",
        true,
      ),
    process: async (file) => {
      if (
        file.type.startsWith("video/") &&
        !(await readVideoFile({ file })).canDecode
      )
        throw new Error("Could not decode the source video");
      const [asset] = await processMediaAssets({ files: [file] });
      if (!asset) throw new Error("Could not process the production media");
      return asset;
    },
    saveMedia: (projectId, mediaAsset) =>
      storageService.saveMediaAsset({ projectId, mediaAsset }),
    saveProject: (project) => storageService.saveProject({ project }),
    openProject: async (id) => {
      await initializeGpuRenderer();
      editor.renderer.setDegraded(!isGpuAvailable());
      await editor.project.loadProject({ id });
    },
    publish: async () => {
      await saveToServer(editor);
    },
  };
  return { context, services };
}
