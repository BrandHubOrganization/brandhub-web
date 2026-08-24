import React, { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Check,
  Loader2,
  AlertTriangle,
  Maximize2,
  RotateCcw,
  MessageSquare,
  Wand2,
  Eraser,
  Images,
} from "lucide-react";
import { mockEditorService } from "@/services/mock/mockEditorService";
import type { SocialPlatform, AIErrorType } from "@/types/editor";
import { ImageLightboxModal } from "./ImageLightboxModal";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";

interface AIGeneratePanelProps {
  topic?: string;
  targetPlatforms?: SocialPlatform[];
  onApplyAIResult: (
    caption: string,
    hashtags: string[],
    imageUrl?: string,
  ) => void;
}

const TONE_PRESETS = [
  {
    key: "funny",
    promptAdd: "Phong cách vui vẻ, hài hước, tạo sự chú ý.",
  },
  {
    key: "professional",
    promptAdd: "Giọng văn chuyên nghiệp, ngắn gọn, đáng tin cậy.",
  },
  {
    key: "cta",
    promptAdd: "Tập trung vào ưu đãi, thúc đẩy mua hàng ngay.",
  },
] as const;

export const AIGeneratePanel: React.FC<AIGeneratePanelProps> = ({
  topic = "",
  targetPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
  onApplyAIResult,
}) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState(
    "Viết bài đăng hấp dẫn, ngắn gọn với giọng văn thu hút và kêu gọi hành động.",
  ); // ponytail: sample prompt text is demo content, not UI chrome
  const [userFeedback, setUserFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  // Async States
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [estimatedSeconds, setEstimatedSeconds] = useState(10);
  const [errorState, setErrorState] = useState<AIErrorType>(null);

  // Result State
  const [generatedResult, setGeneratedResult] = useState<{
    caption: string;
    hashtags: string[];
    imageUrl?: string;
    reasoning?: string;
  } | null>(null);

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Image tool state
  const [imageToolResult, setImageToolResult] = useState<string | null>(null);

  const handleGenerate = async (isRegenerate: boolean = false) => {
    if (!prompt.trim()) {
      toast.error(t("editor.aiGenerate.promptRequiredError"));
      return;
    }

    setIsGenerating(true);
    setStreamingText("");
    setErrorState(null);
    if (!isRegenerate) {
      setGeneratedResult(null);
      setShowFeedbackInput(false);
    }

    // Countdown simulation
    setEstimatedSeconds(10);
    const countdownInterval = setInterval(() => {
      setEstimatedSeconds((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    try {
      const res = await mockEditorService.generateWithAI(
        {
          prompt,
          topic,
          platforms: targetPlatforms,
          userFeedback: isRegenerate ? userFeedback : undefined,
          previousOutput: generatedResult || undefined,
        },
        (partialText) => {
          setStreamingText(partialText);
        },
      );

      setGeneratedResult(res);
      setUserFeedback("");
      setShowFeedbackInput(false);
      toast.success(
        isRegenerate
          ? t("editor.aiGenerate.regenerateSuccess")
          : t("editor.aiGenerate.generateSuccess"),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message === "RATE_LIMITED") {
        setErrorState("RATE_LIMITED");
      } else if (message === "SERVICE_UNAVAILABLE") {
        setErrorState("SERVICE_UNAVAILABLE");
      } else {
        setErrorState("GENERATION_FAILED");
      }
    } finally {
      clearInterval(countdownInterval);
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedResult) {
      onApplyAIResult(
        generatedResult.caption,
        generatedResult.hashtags,
        generatedResult.imageUrl,
      );
      toast.success(t("editor.aiGenerate.applySuccess"));
    }
  };

  return (
    <div className="border-border bg-card flex h-full flex-col justify-between space-y-4 rounded-xl border p-5 shadow-xs">
      <div className="space-y-4">
        {/* Header Title */}
        <div className="border-border flex items-center gap-2 border-b pb-3">
          <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-1.5">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
              {t("editor.aiGenerate.title")}
              <span className="bg-brand-orange-soft text-brand-orange text-3xs rounded-full px-1.5 py-0.5 font-bold">
                {t("editor.aiGenerate.proBadge")}
              </span>
            </h3>
            <p className="text-muted-foreground text-2xs">
              {t("editor.aiGenerate.subtitle")}
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-2xs text-muted-foreground block font-semibold tracking-wider uppercase">
            {t("editor.aiGenerate.presetsLabel")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TONE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() =>
                  setPrompt((prev) => `${prev} ${preset.promptAdd}`)
                }
                className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs bg-muted text-muted-foreground cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors"
              >
                + {t(`editor.aiGenerate.presets.${preset.key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Area */}
        <div className="space-y-1.5">
          <label className="text-muted-foreground text-xs font-semibold">
            {t("editor.aiGenerate.promptLabel")}
          </label>
          <Textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("editor.aiGenerate.promptPlaceholder")}
            className="focus:ring-brand-orange/20 focus:border-brand-orange border-border bg-muted text-foreground rounded-xl text-xs"
          />
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={() => handleGenerate(false)}
          disabled={isGenerating}
          className="bg-brand-orange hover:bg-brand-orange/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>
                {t("editor.aiGenerate.generating", {
                  seconds: estimatedSeconds,
                })}
              </span>
            </>
          ) : (
            <>
              <Wand2 className="size-4" />
              <span>{t("editor.aiGenerate.generateButton")}</span>
            </>
          )}
        </button>

        {/* Image Tools */}
        <div className="space-y-1.5">
          <span className="text-2xs text-muted-foreground block font-semibold tracking-wider uppercase">
            {t("editor.aiGenerate.imageToolsLabel")}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() =>
                setImageToolResult(t("editor.aiGenerate.variationsDone"))
              }
              className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs bg-muted text-muted-foreground flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-medium transition-colors"
            >
              <Images className="size-3.5" />
              {t("editor.aiGenerate.imageVariations")}
            </button>
            <button
              type="button"
              onClick={() =>
                setImageToolResult(t("editor.aiGenerate.bgRemoved"))
              }
              className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs bg-muted text-muted-foreground flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-medium transition-colors"
            >
              <Eraser className="size-3.5" />
              {t("editor.aiGenerate.removeBackground")}
            </button>
          </div>
          {imageToolResult && (
            <p className="bg-brand-orange-soft/40 border-brand-orange/20 text-brand-orange text-2xs rounded-lg border px-2.5 py-1.5">
              {imageToolResult}
            </p>
          )}
        </div>

        {/* Error States Display */}
        {errorState && (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs dark:border-red-900/60 dark:bg-red-950/40">
            <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                {errorState === "SERVICE_UNAVAILABLE" &&
                  t("editor.aiGenerate.errorServiceUnavailable")}
                {errorState === "RATE_LIMITED" &&
                  t("editor.aiGenerate.errorRateLimited")}
                {errorState === "GENERATION_FAILED" &&
                  t("editor.aiGenerate.errorGenerationFailed")}
              </span>
            </div>
            <p className="text-2xs text-red-600 dark:text-red-400">
              {t("editor.aiGenerate.errorHint")}
            </p>
            <button
              onClick={() => handleGenerate(false)}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("editor.aiGenerate.retryButton")}</span>
            </button>
          </div>
        )}

        {/* Result & Streaming Display Box */}
        {(isGenerating || streamingText || generatedResult) && !errorState && (
          <div className="border-border bg-muted space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-brand-orange text-3xs font-bold tracking-wider uppercase">
                {t("editor.aiGenerate.resultLabel")}
              </span>
              {isGenerating && (
                <span className="text-3xs text-muted-foreground font-mono">
                  {t("editor.aiGenerate.estimateLabel", {
                    seconds: estimatedSeconds,
                  })}
                </span>
              )}
            </div>

            {/* Skeleton Loading State */}
            {isGenerating && !streamingText && (
              <div className="animate-pulse space-y-2.5 py-2">
                <div className="bg-muted size-3/4 rounded-full" />
                <div className="bg-muted h-3 w-full rounded-full" />
                <div className="bg-muted h-3 w-5/6 rounded-full" />
                <div className="bg-muted mt-2 h-20 w-full rounded-xl" />
              </div>
            )}

            {/* Streaming Caption */}
            {streamingText && (
              <Textarea
                rows={4}
                value={streamingText}
                onChange={(e) => setStreamingText(e.target.value)}
                className="border-border bg-card text-foreground rounded-xl font-sans text-xs leading-relaxed"
              />
            )}

            {/* Generated AI Image Thumbnail with Lightbox */}
            {generatedResult?.imageUrl && (
              <div className="space-y-1.5 pt-1">
                <span className="text-3xs text-muted-foreground block font-semibold">
                  {t("editor.aiGenerate.imageResultLabel")}
                </span>
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="group hover:border-brand-orange border-border relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-zinc-900 shadow-2xs transition-all"
                >
                  <img
                    src={generatedResult.imageUrl}
                    alt="AI Generated"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="size-4" />
                    <span>{t("editor.aiGenerate.viewFullImage")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Hashtags Tags */}
            {generatedResult && (
              <div className="border-border/60 border-t pt-2">
                <span className="text-3xs text-muted-foreground mb-1 block font-semibold">
                  {t("editor.aiGenerate.hashtagsAttached")}
                </span>
                <div className="flex flex-wrap gap-1">
                  {generatedResult.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-brand-orange-soft text-brand-orange text-3xs rounded-xl px-2 py-0.5 font-mono font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regenerate Feedback Textarea Box */}
        {generatedResult && !isGenerating && (
          <div className="space-y-2">
            {!showFeedbackInput ? (
              <button
                type="button"
                onClick={() => setShowFeedbackInput(true)}
                className="text-brand-orange flex cursor-pointer items-center gap-1 text-xs font-medium hover:underline"
              >
                <MessageSquare className="size-3.5" />
                <span>{t("editor.aiGenerate.addFeedbackButton")}</span>
              </button>
            ) : (
              <div className="bg-brand-orange-soft/40 border-brand-orange/20 space-y-1.5 rounded-xl border p-3">
                <label className="text-brand-orange text-2xs block font-semibold">
                  {t("editor.aiGenerate.feedbackLabel")}
                </label>
                <input
                  type="text"
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder={t("editor.aiGenerate.feedbackPlaceholder")}
                  className="border-brand-orange/30 bg-card text-foreground w-full rounded-lg border p-2 text-xs focus:outline-hidden"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      {generatedResult && !isGenerating && (
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleGenerate(true)}
            className="bg-muted text-foreground hover:bg-muted/70 flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="text-brand-orange size-3.5" />
            <span>{t("editor.aiGenerate.regenerateButton")}</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
          >
            <Check className="size-4 stroke-[3]" />
            <span>{t("editor.aiGenerate.useThisButton")}</span>
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {generatedResult?.imageUrl && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          imageUrl={generatedResult.imageUrl}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
};
