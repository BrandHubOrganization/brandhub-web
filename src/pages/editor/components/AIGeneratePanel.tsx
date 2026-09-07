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
} from "lucide-react";
import { mockEditorService } from "@/services/mock/mockEditorService";
import { AIImageToolsPanel } from "./AIImageToolsPanel";
import type {
  SocialPlatform,
  AIErrorType,
  AIContentType,
  BlogLength,
  AdObjective,
} from "@/types/editor";
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

const CONTENT_TYPES: AIContentType[] = ["CAPTION", "BLOG", "AD_COPY"];
const HASHTAG_COUNTS = [3, 5, 6, 10];
const BLOG_LENGTHS: BlogLength[] = ["SHORT", "MEDIUM", "LONG"];
const AD_OBJECTIVES: AdObjective[] = ["AWARENESS", "TRAFFIC", "CONVERSION"];

type BrandTone = "FRIENDLY" | "PROFESSIONAL" | "PLAYFUL" | "LUXURY";
const BRAND_TONES: BrandTone[] = [
  "FRIENDLY",
  "PROFESSIONAL",
  "PLAYFUL",
  "LUXURY",
];

export const AIGeneratePanel: React.FC<AIGeneratePanelProps> = ({
  topic = "",
  targetPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
  onApplyAIResult,
}) => {
  const { t } = useTranslation();
  const [contentType, setContentType] = useState<AIContentType>("CAPTION");
  const [brandTone, setBrandTone] = useState<BrandTone>("FRIENDLY");
  const [hashtagCount, setHashtagCount] = useState(6);
  const [blogLength, setBlogLength] = useState<BlogLength>("MEDIUM");
  const [blogKeyword, setBlogKeyword] = useState("");
  const [adObjective, setAdObjective] = useState<AdObjective>("CONVERSION");
  const [adCallToAction, setAdCallToAction] = useState("Mua ngay");
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
    blogTitle?: string;
    adHeadline?: string;
    adDescription?: string;
  } | null>(null);

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
          contentType,
          topic,
          platforms: targetPlatforms,
          userFeedback: isRegenerate ? userFeedback : undefined,
          hashtagCount: contentType === "CAPTION" ? hashtagCount : undefined,
          blogLength: contentType === "BLOG" ? blogLength : undefined,
          blogKeyword: contentType === "BLOG" ? blogKeyword : undefined,
          adObjective: contentType === "AD_COPY" ? adObjective : undefined,
          adCallToAction:
            contentType === "AD_COPY" ? adCallToAction : undefined,
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

        {/* Content Type Tabs */}
        <div className="space-y-1.5">
          <span className="text-2xs text-muted-foreground block font-semibold tracking-wider uppercase">
            {t("editor.aiGenerate.contentTypeLabel")}
          </span>
          <div className="bg-muted grid grid-cols-3 gap-1 rounded-xl p-1">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setContentType(type)}
                className={`text-2xs rounded-lg py-1.5 font-semibold transition-colors ${
                  contentType === type
                    ? "bg-card text-brand-orange shadow-xs"
                    : "text-muted-foreground hover:text-foreground cursor-pointer"
                }`}
              >
                {t(`editor.aiGenerate.contentType.${type}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Tone Selector */}
        <div className="space-y-1.5">
          <label className="text-muted-foreground text-xs font-semibold">
            {t("editor.aiGenerate.toneLabel")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BRAND_TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setBrandTone(tone)}
                className={`text-2xs cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  brandTone === tone
                    ? "bg-brand-orange-soft text-brand-orange"
                    : "bg-muted text-muted-foreground hover:opacity-80"
                }`}
              >
                {t(`editor.aiGenerate.tone.${tone}`)}
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
            rows={contentType === "BLOG" ? 5 : 3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t(
              `editor.aiGenerate.promptPlaceholders.${contentType}`,
            )}
            className="focus:ring-brand-orange/20 focus:border-brand-orange border-border bg-muted text-foreground rounded-xl text-xs"
          />
        </div>

        {/* Type-specific Parameters */}
        {contentType === "CAPTION" && (
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-semibold">
              {t("editor.aiGenerate.hashtagCountLabel")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {HASHTAG_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setHashtagCount(count)}
                  className={`text-2xs cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors ${
                    hashtagCount === count
                      ? "bg-brand-orange-soft text-brand-orange"
                      : "bg-muted text-muted-foreground hover:opacity-80"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        {contentType === "BLOG" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                {t("editor.aiGenerate.blogLengthLabel")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BLOG_LENGTHS.map((length) => (
                  <button
                    key={length}
                    type="button"
                    onClick={() => setBlogLength(length)}
                    className={`text-2xs cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors ${
                      blogLength === length
                        ? "bg-brand-orange-soft text-brand-orange"
                        : "bg-muted text-muted-foreground hover:opacity-80"
                    }`}
                  >
                    {t(`editor.aiGenerate.blogLength.${length}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                {t("editor.aiGenerate.blogKeywordLabel")}
              </label>
              <input
                type="text"
                value={blogKeyword}
                onChange={(e) => setBlogKeyword(e.target.value)}
                placeholder={t("editor.aiGenerate.blogKeywordPlaceholder")}
                className="border-border bg-muted text-foreground focus:ring-brand-orange/20 focus:border-brand-orange w-full rounded-lg border p-2 text-xs focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {contentType === "AD_COPY" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                {t("editor.aiGenerate.adObjectiveLabel")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AD_OBJECTIVES.map((objective) => (
                  <button
                    key={objective}
                    type="button"
                    onClick={() => setAdObjective(objective)}
                    className={`text-2xs cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors ${
                      adObjective === objective
                        ? "bg-brand-orange-soft text-brand-orange"
                        : "bg-muted text-muted-foreground hover:opacity-80"
                    }`}
                  >
                    {t(`editor.aiGenerate.adObjective.${objective}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                {t("editor.aiGenerate.adCtaLabel")}
              </label>
              <input
                type="text"
                value={adCallToAction}
                onChange={(e) => setAdCallToAction(e.target.value)}
                placeholder={t("editor.aiGenerate.adCtaPlaceholder")}
                className="border-border bg-muted text-foreground focus:ring-brand-orange/20 focus:border-brand-orange w-full rounded-lg border p-2 text-xs focus:outline-hidden"
              />
            </div>
          </div>
        )}

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

        <AIImageToolsPanel />

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

            {/* Blog Title (BLOG only) */}
            {contentType === "BLOG" && generatedResult?.blogTitle && (
              <div className="space-y-1">
                <span className="text-3xs text-muted-foreground block font-semibold">
                  {t("editor.aiGenerate.blogTitleLabel")}
                </span>
                <p className="text-foreground text-sm font-bold">
                  {generatedResult.blogTitle}
                </p>
              </div>
            )}

            {/* Ad Headline & Description (AD_COPY only) */}
            {contentType === "AD_COPY" &&
              (generatedResult?.adHeadline || generatedResult?.adDescription) && (
                <div className="space-y-2">
                  {generatedResult?.adHeadline && (
                    <div className="space-y-1">
                      <span className="text-3xs text-muted-foreground block font-semibold">
                        {t("editor.aiGenerate.adHeadlineLabel")}
                      </span>
                      <p className="text-foreground text-sm font-bold">
                        {generatedResult.adHeadline}
                      </p>
                    </div>
                  )}
                  {generatedResult?.adDescription && (
                    <div className="space-y-1">
                      <span className="text-3xs text-muted-foreground block font-semibold">
                        {t("editor.aiGenerate.adDescriptionLabel")}
                      </span>
                      <p className="text-foreground text-xs leading-relaxed">
                        {generatedResult.adDescription}
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* Streaming Caption */}
            {streamingText && (
              <Textarea
                rows={contentType === "BLOG" ? 8 : 4}
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
