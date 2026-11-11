import { useEffect, useRef, useState, type ReactNode } from "react";
import { Music2, Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/editor/use-editor";
import { useFileUpload } from "@/media/use-file-upload";
import { processMediaAssets } from "@/media/processing";
import { buildElementFromMedia } from "@/timeline/element-utils";
import { mediaTimeFromSeconds } from "@/wasm";
import { guardResourceTarget } from "./target";
import { editorResourceMessages } from "./messages";

export function UploadedAudioView({
  navigation,
  locale,
}: {
  navigation: ReactNode;
  locale: "vi" | "en";
}) {
  const editor = useEditor();
  const assets = useEditor((e) => e.media.getAssets());
  const t = editorResourceMessages[locale];
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = container.current;
    return () =>
      root?.querySelectorAll("audio").forEach((audio) => audio.pause());
  }, []);
  const { fileInputProps, openFilePicker, dragProps } = useFileUpload({
    accept: "audio/*,.mp3,.wav,.m4a,.ogg,.weba",
    multiple: true,
    onFilesSelected: async (files) => {
      if (busy) return;
      const projectId = editor.project.getActive().metadata.id;
      const assertCurrent = guardResourceTarget({ editor });
      setBusy(true);
      try {
        const processed = await processMediaAssets({ files });
        for (const asset of processed) {
          try {
            assertCurrent();
            if (asset.type !== "audio") throw new Error(t.audioFailed);
            if (!(await editor.media.addMediaAsset({ projectId, asset })))
              throw new Error(t.audioFailed);
          } catch (error) {
            if (asset.url) URL.revokeObjectURL(asset.url);
            throw error;
          }
        }
      } catch {
        toast.error(t.audioFailed);
      } finally {
        setBusy(false);
      }
    },
  });
  const audio = assets.filter(
    (asset) => asset.type === "audio" && !asset.ephemeral,
  );
  const visible = audio.filter((asset) =>
    asset.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  function pause() {
    container.current
      ?.querySelectorAll("audio")
      .forEach((audio) => audio.pause());
  }
  return (
    <div className="bh-resource-body" {...dragProps}>
      <nav className="bh-resource-categories" aria-label={t.audioType}>
        {navigation}
      </nav>
      <div className="bh-resource-main" ref={container}>
        <div className="flex flex-col gap-3 p-3">
          <input {...fileInputProps} disabled={busy} />
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={openFilePicker}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {busy ? t.importing : t.importAudio}
          </Button>
          <Input
            aria-label={t.searchAudio}
            placeholder={t.searchAudio}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="bh-resource-results space-y-3 p-3" aria-live="polite">
          {!visible.length && (
            <p className="text-muted-foreground text-sm">
              {audio.length ? t.noAudio : t.emptyAudio}
            </p>
          )}
          {visible.map((asset) => (
            <article
              key={asset.id}
              data-uploaded-audio={asset.id}
              className="border-border space-y-2 rounded-md border p-3"
            >
              <div className="flex items-center gap-2">
                <Music2 className="size-4 shrink-0" />
                <span className="truncate text-sm" title={asset.name}>
                  {asset.name}
                </span>
              </div>
              <audio
                controls
                preload="metadata"
                src={asset.url}
                aria-label={t.previewAudio.replace("{name}", asset.name)}
                className="h-8 w-full"
                onPlay={(e) => {
                  editor.playback.pause();
                  container.current?.querySelectorAll("audio").forEach((a) => {
                    if (a !== e.currentTarget) a.pause();
                  });
                }}
              />
              <Button
                variant="outline"
                size="sm"
                aria-label={t.addAudio.replace("{name}", asset.name)}
                onClick={() => {
                  pause();
                  editor.timeline.insertElement({
                    element: buildElementFromMedia({
                      mediaId: asset.id,
                      mediaType: "audio",
                      name: asset.name,
                      duration: mediaTimeFromSeconds({
                        seconds:
                          asset.duration && Number.isFinite(asset.duration)
                            ? asset.duration
                            : 5,
                      }),
                      startTime: editor.playback.getCurrentTime(),
                    }),
                    placement: { mode: "auto", trackType: "audio" },
                  });
                }}
              >
                <Plus className="size-4" />
                {t.addAudio.replace("{name}", asset.name)}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
