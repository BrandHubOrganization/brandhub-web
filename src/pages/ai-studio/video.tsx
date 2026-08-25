import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Clapperboard, Film, ListTree, Play, Wand2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";

type ExportFormat = "MP4" | "GIF" | "WEBM";

const EXPORT_FORMATS: ExportFormat[] = ["MP4", "GIF", "WEBM"];

const SCENES = [
  { index: 1, title: "Mở đầu — giới thiệu sản phẩm", duration: "0:00 – 0:05" },
  { index: 2, title: "Giới thiệu tính năng nổi bật", duration: "0:05 – 0:12" },
  { index: 3, title: "Bằng chứng xã hội / đánh giá", duration: "0:12 – 0:18" },
  { index: 4, title: "Kêu gọi hành động", duration: "0:18 – 0:25" },
];

export function VideoStudioPage() {
  const { t } = useTranslation();
  const [script, setScript] = useState(
    "Giới thiệu 30 giây về dịch vụ quản lý mạng xã hội BrandHub cho thương hiệu thời trang...",
  );
  const [format, setFormat] = useState<ExportFormat>("MP4");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success(t("aiStudio.video.generateSuccess"));
    }, 1200);
  };

  return (
    <PageWrapper
      title={t("aiStudio.video.title")}
      description={t("aiStudio.video.description")}
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left: script + scene mapping */}
        <div className="space-y-6 lg:col-span-2">
          <div className="border-border bg-card rounded-xl border p-5">
            <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
              {t("aiStudio.video.scriptLabel")}
            </label>
            <textarea
              rows={5}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="border-border bg-muted text-foreground w-full rounded-xl border p-3 text-sm leading-relaxed"
            />
          </div>

          <div className="border-border bg-card rounded-xl border p-5">
            <div className="border-border flex items-center gap-2 border-b pb-3">
              <ListTree className="text-brand-orange size-5" />
              <h3 className="text-foreground text-sm font-semibold">
                {t("aiStudio.video.sceneMapping")}
              </h3>
            </div>
            <div className="mt-3 space-y-2">
              {SCENES.map((scene) => (
                <div
                  key={scene.index}
                  className="border-border flex items-center gap-3 rounded-lg border px-3 py-2.5"
                >
                  <div className="bg-muted text-foreground text-2xs flex size-8 shrink-0 items-center justify-center rounded font-mono">
                    {String(scene.index).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-xs font-medium">
                      {scene.title}
                    </p>
                    <p className="text-muted-foreground text-2xs">
                      {scene.duration}
                    </p>
                  </div>
                  <Play className="text-muted-foreground size-3.5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: preview + export */}
        <div className="space-y-6">
          <div className="border-border bg-card aspect-video overflow-hidden rounded-xl border">
            <div className="bg-muted text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
              <Clapperboard className="size-8" />
              <span className="text-2xs">
                {t("aiStudio.video.previewPlaceholder")}
              </span>
            </div>
          </div>

          <div className="border-border bg-card rounded-xl border p-5">
            <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
              {t("aiStudio.video.exportLabel")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXPORT_FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`border-border flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    format === fmt
                      ? "bg-brand-orange border-brand-orange text-white"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Film className="size-3.5" />
                  {fmt}
                </button>
              ))}
            </div>
            <Button
              variant="orange"
              className="mt-4 w-full gap-2"
              loading={generating}
              onClick={handleGenerate}
            >
              {!generating && <Wand2 className="size-4" />}
              {t("aiStudio.video.generateButton")}
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default VideoStudioPage;
