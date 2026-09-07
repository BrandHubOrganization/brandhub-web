import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Eraser,
  Images,
  ImagePlus,
  Palette,
  UploadCloud,
  X,
} from "lucide-react";

type ImageTool =
  | "TEXT_TO_IMAGE"
  | "VARIATIONS"
  | "REMOVE_BG"
  | "STYLE"
  | "BRAND_REFERENCE";

type StyleCategory = "PHOTOGRAPHY" | "ILLUSTRATION" | "MOOD";

const STYLE_CATEGORIES: StyleCategory[] = [
  "PHOTOGRAPHY",
  "ILLUSTRATION",
  "MOOD",
];

const STYLE_PRESETS: Record<StyleCategory, string[]> = {
  PHOTOGRAPHY: ["REALISTIC", "STUDIO_LIGHT", "CINEMATIC", "MACRO"],
  ILLUSTRATION: ["FLAT_VECTOR", "WATERCOLOR", "3D_RENDER", "SKETCH"],
  MOOD: ["VIBRANT", "MINIMALIST", "VINTAGE", "LUXURY_DARK"],
};

const TOOL_ICON: Record<ImageTool, typeof ImagePlus> = {
  TEXT_TO_IMAGE: ImagePlus,
  VARIATIONS: Images,
  REMOVE_BG: Eraser,
  STYLE: Palette,
  BRAND_REFERENCE: UploadCloud,
};

export function AIImageToolsPanel() {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState<ImageTool>("TEXT_TO_IMAGE");
  const [textToImagePrompt, setTextToImagePrompt] = useState("");
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [styleCategory, setStyleCategory] =
    useState<StyleCategory>("PHOTOGRAPHY");
  const [referenceAssets, setReferenceAssets] = useState<
    { id: string; name: string; previewUrl: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools: ImageTool[] = [
    "TEXT_TO_IMAGE",
    "VARIATIONS",
    "REMOVE_BG",
    "STYLE",
    "BRAND_REFERENCE",
  ];

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newAssets = Array.from(files).map((file) => ({
      id: `asset-${Date.now()}-${file.name}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    }));
    setReferenceAssets((prev) => [...prev, ...newAssets]);
    toast.success(t("editor.aiGenerate.brandReferenceUploadSuccess"));
  }

  function removeReferenceAsset(id: string) {
    setReferenceAssets((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-1.5">
      <span className="text-2xs text-muted-foreground block font-semibold tracking-wider uppercase">
        {t("editor.aiGenerate.imageToolsLabel")}
      </span>
      <div className="grid grid-cols-5 gap-1">
        {tools.map((tool) => {
          const Icon = TOOL_ICON[tool];
          return (
            <button
              key={tool}
              type="button"
              onClick={() => setActiveTool(tool)}
              title={t(`editor.aiGenerate.tool.${tool}`)}
              className={`text-3xs flex cursor-pointer flex-col items-center gap-1 rounded-lg px-1 py-2 font-medium transition-colors ${
                activeTool === tool
                  ? "bg-brand-orange-soft text-brand-orange"
                  : "bg-muted text-muted-foreground hover:opacity-80"
              }`}
            >
              <Icon className="size-3.5" />
              {t(`editor.aiGenerate.tool.${tool}`)}
            </button>
          );
        })}
      </div>

      {activeTool === "TEXT_TO_IMAGE" && (
        <div className="space-y-1.5 pt-1">
          <Textarea
            rows={2}
            value={textToImagePrompt}
            onChange={(e) => setTextToImagePrompt(e.target.value)}
            placeholder={t("editor.aiGenerate.textToImagePlaceholder")}
            className="focus:ring-brand-orange/20 focus:border-brand-orange border-border bg-muted text-foreground rounded-xl text-xs"
          />
          <button
            type="button"
            onClick={() =>
              setToolResult(t("editor.aiGenerate.textToImageDone"))
            }
            className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs bg-muted text-muted-foreground flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-medium transition-colors"
          >
            <ImagePlus className="size-3.5" />
            {t("editor.aiGenerate.textToImageButton")}
          </button>
        </div>
      )}

      {activeTool === "VARIATIONS" && (
        <button
          type="button"
          onClick={() => setToolResult(t("editor.aiGenerate.variationsDone"))}
          className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs bg-muted text-muted-foreground mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-medium transition-colors"
        >
          <Images className="size-3.5" />
          {t("editor.aiGenerate.tool.VARIATIONS")}
        </button>
      )}

      {activeTool === "REMOVE_BG" && (
        <button
          type="button"
          onClick={() => setToolResult(t("editor.aiGenerate.bgRemoved"))}
          className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs bg-muted text-muted-foreground mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-medium transition-colors"
        >
          <Eraser className="size-3.5" />
          {t("editor.aiGenerate.tool.REMOVE_BG")}
        </button>
      )}

      {activeTool === "STYLE" && (
        <div className="mt-1 space-y-2">
          <div className="flex flex-wrap gap-1">
            {STYLE_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setStyleCategory(category)}
                className={`text-3xs cursor-pointer rounded-lg px-2 py-1 font-semibold transition-colors ${
                  styleCategory === category
                    ? "bg-brand-orange text-white"
                    : "bg-muted text-muted-foreground hover:opacity-80"
                }`}
              >
                {t(`editor.aiGenerate.styleCategory.${category}`)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {STYLE_PRESETS[styleCategory].map((style) => (
              <button
                key={style}
                type="button"
                onClick={() =>
                  setToolResult(
                    t("editor.aiGenerate.stylePresetApplied", {
                      style: t(`editor.aiGenerate.stylePreset.${style}`),
                    }),
                  )
                }
                className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs bg-muted text-muted-foreground cursor-pointer rounded-lg px-2 py-2 font-medium transition-colors"
              >
                {t(`editor.aiGenerate.stylePreset.${style}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTool === "BRAND_REFERENCE" && (
        <div className="mt-1 space-y-2">
          <p className="text-3xs text-muted-foreground">
            {t("editor.aiGenerate.brandReferenceHint")}
          </p>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesSelected(e.dataTransfer.files);
            }}
            className="border-border hover:border-brand-orange text-muted-foreground flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-4 text-center transition-colors"
          >
            <UploadCloud className="size-5" />
            <span className="text-2xs font-medium">
              {t("editor.aiGenerate.brandReferenceDropzone")}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          {referenceAssets.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {referenceAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group border-border relative aspect-square overflow-hidden rounded-lg border"
                >
                  <img
                    src={asset.previewUrl}
                    alt={asset.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeReferenceAsset(asset.id)}
                    className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toolResult && (
        <p className="bg-brand-orange-soft/40 border-brand-orange/20 text-brand-orange text-2xs mt-1.5 rounded-lg border px-2.5 py-1.5">
          {toolResult}
        </p>
      )}
    </div>
  );
}
