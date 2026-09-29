import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleHelp,
  ImagePlus,
  Loader2,
  Package,
  ScanFace,
  Sparkles,
  Upload,
  UserRound,
  Wand2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CharacterSheetGeneratorModal } from "@/pages/editor/components/CharacterSheetGeneratorModal";
import {
  aiGenerationService,
  imageSourceToDataUrl,
  type AmbassadorPreset,
} from "@/services/aiGenerationService";

interface AIImageStudioPanelProps {
  referenceMediaUrls: string[];
  onApplyImage: (imageUrl: string, s3Key?: string) => void;
}

const ASPECT_RATIOS = ["1:1", "4:5", "9:16", "16:9"] as const;
const MAX_REFERENCE_BYTES = 10 * 1024 * 1024;

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Invalid image result"));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export function AIImageStudioPanel({
  referenceMediaUrls,
  onApplyImage,
}: AIImageStudioPanelProps) {
  const { t } = useTranslation();
  const productInputRef = useRef<HTMLInputElement>(null);
  const ambassadorInputRef = useRef<HTMLInputElement>(null);
  const [presets, setPresets] = useState<AmbassadorPreset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(true);
  const [isPresetPanelOpen, setIsPresetPanelOpen] = useState(false);
  const [uploadedProduct, setUploadedProduct] = useState("");
  const [uploadedAmbassador, setUploadedAmbassador] = useState("");
  const [aiGeneratedAmbassador, setAiGeneratedAmbassador] = useState("");
  const [characterSheet, setCharacterSheet] = useState("");
  const [isCharacterFlowOpen, setIsCharacterFlowOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(
    referenceMediaUrls[0] ?? "",
  );
  const [selectedAmbassador, setSelectedAmbassador] = useState("");
  const [aspectRatio, setAspectRatio] =
    useState<(typeof ASPECT_RATIOS)[number]>("1:1");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCharacterSheet, setIsGeneratingCharacterSheet] =
    useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedImageKey, setGeneratedImageKey] = useState<string>();

  useEffect(() => {
    let active = true;
    aiGenerationService
      .listAmbassadorPresets()
      .then((items) => {
        if (!active) return;
        setPresets(items);
        setSelectedAmbassador((current) => current || items[0]?.id || "");
      })
      .catch(() => {
        if (active) toast.error(t("editor.studio.image.presetLoadFailed"));
      })
      .finally(() => {
        if (active) setIsLoadingPresets(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    if (!selectedProduct && referenceMediaUrls[0]) {
      setSelectedProduct(referenceMediaUrls[0]);
    }
  }, [referenceMediaUrls, selectedProduct]);

  const productReferences = useMemo(
    () =>
      Array.from(
        new Set([uploadedProduct, ...referenceMediaUrls].filter(Boolean)),
      ).slice(0, 4),
    [referenceMediaUrls, uploadedProduct],
  );

  const selectedPreset = presets.find(
    (preset) => preset.id === selectedAmbassador,
  );
  const selectedAmbassadorImage =
    selectedPreset?.image_url ||
    (selectedAmbassador === "uploaded" ? uploadedAmbassador : "") ||
    (selectedAmbassador === "ai-generated" ? aiGeneratedAmbassador : "") ||
    (selectedAmbassador === "character-sheet" ? characterSheet : "");

  const handleReferenceUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    kind: "product" | "ambassador",
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("editor.studio.image.uploadImageOnly"));
      return;
    }
    if (file.size > MAX_REFERENCE_BYTES) {
      toast.error(t("editor.studio.image.uploadTooLarge"));
      return;
    }

    try {
      const dataUrl = await readImage(file);
      if (kind === "product") {
        setUploadedProduct(dataUrl);
        setSelectedProduct(dataUrl);
      } else {
        setUploadedAmbassador(dataUrl);
        setSelectedAmbassador("uploaded");
      }
      toast.success(t("editor.studio.image.uploadSuccess"));
    } catch {
      toast.error(t("editor.studio.image.uploadFailed"));
    }
  };

  const handleGenerateCharacterSheet = async () => {
    if (!selectedAmbassador) {
      toast.error(t("editor.studio.image.ambassadorRequired"));
      return;
    }
    setIsGeneratingCharacterSheet(true);
    try {
      const result = selectedPreset
        ? await aiGenerationService.generateCharacterSheet({
            presetId: selectedPreset.id,
            name: selectedPreset.name,
          })
        : await aiGenerationService.generateCharacterSheet({
            referenceImage: await imageSourceToDataUrl(selectedAmbassadorImage),
          });
      setCharacterSheet(result.image_url);
      setSelectedAmbassador("character-sheet");
      toast.success(t("editor.studio.image.characterSheetSuccess"));
    } catch {
      toast.error(t("editor.studio.image.characterSheetFailed"));
    } finally {
      setIsGeneratingCharacterSheet(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(t("editor.studio.image.promptRequired"));
      return;
    }
    if (!selectedProduct) {
      toast.error(t("editor.studio.image.productRequired"));
      return;
    }
    if (!selectedAmbassador) {
      toast.error(t("editor.studio.image.ambassadorRequired"));
      return;
    }

    setIsGenerating(true);
    setGeneratedImage("");
    setGeneratedImageKey(undefined);
    try {
      const productReferenceImage = await imageSourceToDataUrl(selectedProduct);
      const ambassador = selectedPreset
        ? {
            source: "preset" as const,
            preset_id: selectedPreset.id,
            reference_images: [] as [],
          }
        : {
            source: "custom" as const,
            reference_images: [
              await imageSourceToDataUrl(selectedAmbassadorImage),
            ] as [string],
          };
      const result = await aiGenerationService.generateCommercialImage({
        prompt,
        aspectRatio,
        productReferenceImage,
        ambassador,
      });
      if (!result.image_url) throw new Error("Missing generated image URL");
      setGeneratedImage(result.image_url);
      setGeneratedImageKey(result.s3_key);
      toast.success(t("editor.studio.image.generateSuccess"));
    } catch {
      toast.error(t("editor.studio.image.generateFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedImage) return;
    onApplyImage(generatedImage, generatedImageKey);
    toast.success(t("editor.studio.image.applySuccess"));
  };

  return (
    <div className="border-border bg-card space-y-5 rounded-xl border p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Package className="text-muted-foreground size-3.5" />
            <span className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
              {t("editor.studio.image.referenceLabel")}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-2xs h-7 gap-1 px-2"
            onClick={() => productInputRef.current?.click()}
          >
            <Upload className="size-3" />
            {t("editor.studio.image.uploadProductButton")}
          </Button>
          <input
            ref={productInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleReferenceUpload(event, "product")}
          />
        </div>
        {productReferences.length ? (
          <div className="grid grid-cols-3 gap-2">
            {productReferences.map((url, index) => (
              <button
                key={`${url.slice(0, 80)}-${index}`}
                type="button"
                onClick={() => setSelectedProduct(url)}
                aria-label={t("editor.studio.image.referenceItem", {
                  index: index + 1,
                })}
                className={cn(
                  "border-border bg-muted relative aspect-square overflow-hidden rounded-lg border-2",
                  selectedProduct === url && "border-brand-orange",
                )}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                {selectedProduct === url && (
                  <span className="bg-brand-orange absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full text-white">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-2xs">
            {t("editor.studio.image.productRequired")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <UserRound className="text-muted-foreground size-3.5" />
            <span className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
              {t("editor.studio.image.ambassadorLabel")}
            </span>
          </div>
          <div className="group relative shrink-0">
            <button
              type="button"
              aria-label={t("editor.studio.image.referenceHelp")}
              className="text-muted-foreground hover:text-brand-orange flex size-6 items-center justify-center rounded-full"
            >
              <CircleHelp className="size-4" />
            </button>
            <div
              role="tooltip"
              className="border-border bg-popover text-popover-foreground text-2xs pointer-events-none absolute top-full right-0 z-50 mt-1 hidden w-64 rounded-lg border p-2.5 leading-relaxed shadow-xl group-focus-within:block group-hover:block"
            >
              {t("editor.studio.image.referenceHelp")}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPresetPanelOpen((open) => !open)}
          className="border-border bg-background flex w-full items-center gap-2 rounded-lg border p-2 text-left"
        >
          {selectedAmbassadorImage ? (
            <img
              src={selectedAmbassadorImage}
              alt=""
              className="size-10 rounded-md object-cover"
            />
          ) : (
            <UserRound className="text-muted-foreground bg-muted size-10 rounded-md p-2" />
          )}
          <span className="min-w-0 flex-1 truncate text-xs font-medium">
            {isLoadingPresets
              ? t("editor.studio.image.loadingPresets")
              : selectedPreset?.name ||
                (selectedAmbassador === "uploaded"
                  ? t("editor.studio.image.customAmbassador")
                  : "") ||
                (selectedAmbassador === "ai-generated"
                  ? t("editor.studio.image.aiGeneratedAmbassador")
                  : "") ||
                (selectedAmbassador === "character-sheet"
                  ? t("editor.studio.image.characterSheet")
                  : "") ||
                t("editor.studio.image.chooseAmbassador")}
          </span>
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              isPresetPanelOpen && "rotate-180",
            )}
          />
        </button>

        {isPresetPanelOpen && (
          <div className="border-border bg-muted/30 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedAmbassador(preset.id);
                  setIsPresetPanelOpen(false);
                }}
                className={cn(
                  "border-border bg-background flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left",
                  selectedAmbassador === preset.id &&
                    "border-brand-orange bg-brand-orange-soft",
                )}
              >
                <img
                  src={preset.image_url}
                  alt=""
                  className="size-10 shrink-0 rounded-md object-cover"
                />
                <span className="text-2xs min-w-0 truncate font-medium">
                  {preset.name}
                </span>
              </button>
            ))}
            {uploadedAmbassador && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAmbassador("uploaded");
                  setIsPresetPanelOpen(false);
                }}
                className={cn(
                  "border-border bg-background flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left",
                  selectedAmbassador === "uploaded" &&
                    "border-brand-orange bg-brand-orange-soft",
                )}
              >
                <img
                  src={uploadedAmbassador}
                  alt=""
                  className="size-10 shrink-0 rounded-md object-cover"
                />
                <span className="text-2xs truncate font-medium">
                  {t("editor.studio.image.customAmbassador")}
                </span>
              </button>
            )}
            {aiGeneratedAmbassador && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAmbassador("ai-generated");
                  setIsPresetPanelOpen(false);
                }}
                className={cn(
                  "border-border bg-background flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left",
                  selectedAmbassador === "ai-generated" &&
                    "border-brand-orange bg-brand-orange-soft",
                )}
              >
                <img
                  src={aiGeneratedAmbassador}
                  alt=""
                  className="size-10 shrink-0 rounded-md object-cover"
                />
                <span className="text-2xs truncate font-medium">
                  {t("editor.studio.image.aiGeneratedAmbassador")}
                </span>
              </button>
            )}
            {characterSheet && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAmbassador("character-sheet");
                  setIsPresetPanelOpen(false);
                }}
                className={cn(
                  "border-border bg-background flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left",
                  selectedAmbassador === "character-sheet" &&
                    "border-brand-orange bg-brand-orange-soft",
                )}
              >
                <img
                  src={characterSheet}
                  alt=""
                  className="size-10 shrink-0 rounded-md object-cover"
                />
                <span className="text-2xs truncate font-medium">
                  {t("editor.studio.image.characterSheet")}
                </span>
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-auto min-h-9 w-full gap-1.5 py-2 text-xs whitespace-normal"
            onClick={() => ambassadorInputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {t("editor.studio.image.uploadAmbassadorButton")}
          </Button>
          <input
            ref={ambassadorInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleReferenceUpload(event, "ambassador")}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-brand-orange/30 text-brand-orange hover:bg-brand-orange-soft h-auto min-h-9 w-full gap-1.5 py-2 text-xs whitespace-normal"
            disabled={isGeneratingCharacterSheet || !selectedAmbassador}
            onClick={handleGenerateCharacterSheet}
          >
            {isGeneratingCharacterSheet ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ScanFace className="size-3.5" />
            )}
            {isGeneratingCharacterSheet
              ? t("editor.studio.image.generatingCharacterSheet")
              : t("editor.studio.image.createSheetFromSelectedButton")}
          </Button>
          <Button
            type="button"
            variant="orange"
            size="sm"
            className="h-auto min-h-9 w-full gap-1.5 py-2 text-xs whitespace-normal"
            onClick={() => setIsCharacterFlowOpen(true)}
          >
            <Sparkles className="size-3.5" />
            {t("editor.studio.image.generateCharacterSheetButton")}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="studio-image-prompt"
          className="text-muted-foreground text-xs font-semibold"
        >
          {t("editor.studio.image.promptLabel")}
        </label>
        <Textarea
          id="studio-image-prompt"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={t("editor.studio.image.promptPlaceholder")}
          className="border-border bg-muted text-foreground rounded-lg text-xs"
        />
      </div>

      <div className="space-y-2">
        <span className="text-muted-foreground text-xs font-semibold">
          {t("editor.studio.image.aspectRatioLabel")}
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={cn(
                "border-border bg-background text-muted-foreground rounded-md border py-1.5 font-mono text-xs",
                aspectRatio === ratio &&
                  "border-brand-orange bg-brand-orange-soft text-brand-orange",
              )}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <Button
        data-testid="generate-image"
        variant="orange"
        className="w-full"
        disabled={isGenerating}
        onClick={handleGenerate}
      >
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Wand2 className="size-4" />
        )}
        {isGenerating
          ? t("editor.studio.image.generating", { progress: "…" })
          : t("editor.studio.image.generateButton")}
      </Button>

      {generatedImage && (
        <div className="space-y-3">
          <p className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
            {t("editor.studio.image.resultsLabel")}
          </p>
          <div className="border-brand-orange relative aspect-square overflow-hidden rounded-lg border-2">
            <img
              src={generatedImage}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="bg-brand-orange absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full text-white">
              <Check className="size-3" />
            </span>
          </div>
          <Button
            data-testid="apply-image"
            variant="outline"
            className="w-full"
            onClick={handleApply}
          >
            <ImagePlus className="size-4" />
            {t("editor.studio.image.applyButton")}
          </Button>
        </div>
      )}

      <CharacterSheetGeneratorModal
        open={isCharacterFlowOpen}
        onOpenChange={setIsCharacterFlowOpen}
        onComplete={({ characterImageUrl, characterSheetUrl }) => {
          setAiGeneratedAmbassador(characterImageUrl);
          setCharacterSheet(characterSheetUrl);
          setSelectedAmbassador("character-sheet");
          setIsPresetPanelOpen(false);
        }}
      />
    </div>
  );
}
