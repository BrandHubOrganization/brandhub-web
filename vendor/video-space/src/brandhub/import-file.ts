import { toast } from "sonner";
import { EditorCore } from "@/core";
import { initializeGpuRenderer, isGpuAvailable } from "@/services/renderer/gpu-renderer";
import { processMediaAssets } from "@/media/processing";
import { buildElementFromMedia } from "@/timeline/element-utils";
import { mediaTimeFromSeconds, ZERO_MEDIA_TIME } from "@/wasm";
import { getHostContext } from "@/platform/host";
import { saveToServer } from "./sync";

export async function createProjectFromFile({ file, name }: { file?: File; name?: string }): Promise<string> {
  const english = getHostContext().locale === "en";
  if (file && (file.size === 0 || file.size > 128 * 1024 * 1024))
    throw new Error(english ? "Choose a nonempty file up to 128 MiB." : "Chọn tệp có dữ liệu, tối đa 128 MiB.");
  const editor = EditorCore.getInstance();
  const projectId = await editor.project.createNewProject({
    name: name?.trim() || file?.name.replace(/\.[^.]+$/, "") || (english ? "New project" : "Bản dựng mới"),
  });
  await initializeGpuRenderer();
  editor.renderer.setDegraded(!isGpuAvailable());
  await editor.project.loadProject({ id: projectId });
  if (file) {
    const processed = await processMediaAssets({ files: [file] });
    if (!processed.length) throw new Error(english ? "Could not read this video. Try H.264 MP4." : "Không đọc được video. Hãy thử tệp MP4 H.264.");
    for (const asset of processed) {
      const saved = await editor.media.addMediaAsset({ projectId, asset });
      if (!saved) throw new Error(english ? "Could not store this clip in the browser." : "Không lưu được clip vào trình duyệt.");
      if (saved.width && saved.height) await editor.project.updateSettings({ settings: {
        canvasSize: { width: saved.width, height: saved.height },
        originalCanvasSize: { width: saved.width, height: saved.height },
      } });
      editor.timeline.insertElement({
        element: buildElementFromMedia({ mediaId: saved.id, mediaType: saved.type, name: saved.name,
          duration: mediaTimeFromSeconds({ seconds: saved.duration ?? 5 }), startTime: ZERO_MEDIA_TIME }),
        placement: { mode: "auto" },
      });
    }
  }
  await editor.save.flush();
  try { await saveToServer(editor); }
  catch (error) {
    toast.warning(english ? "Saved locally; cloud save is pending" : "Đã lưu trên máy; chưa lưu lên máy chủ", {
      description: error instanceof Error ? error.message : undefined,
    });
  }
  return projectId;
}
