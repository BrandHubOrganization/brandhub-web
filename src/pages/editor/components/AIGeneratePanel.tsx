import { useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Check,
  Loader2,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Wand2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { aiGenerationService } from "@/services/aiGenerationService";
import type { AIErrorType, SocialPlatform } from "@/types/editor";

interface AIGeneratePanelProps {
  topic?: string;
  targetPlatforms?: SocialPlatform[];
  showImageTools?: boolean;
  onApplyAIResult: (caption: string, hashtags: string[]) => void;
}

const TONE_PRESETS = [
  { key: "funny", promptAdd: "Phong cách vui vẻ, hài hước và tạo sự chú ý." },
  {
    key: "professional",
    promptAdd: "Giọng văn chuyên nghiệp, ngắn gọn và đáng tin cậy.",
  },
  {
    key: "cta",
    promptAdd: "Tập trung vào ưu đãi và lời kêu gọi hành động rõ ràng.",
  },
] as const;

const HASHTAG_COUNTS = [3, 5, 6, 10];
const BRAND_TONES = ["FRIENDLY", "PROFESSIONAL", "PLAYFUL", "LUXURY"] as const;

export function AIGeneratePanel({
  topic = "",
  targetPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
  onApplyAIResult,
}: AIGeneratePanelProps) {
  const { t } = useTranslation();
  const [brandTone, setBrandTone] =
    useState<(typeof BRAND_TONES)[number]>("FRIENDLY");
  const [hashtagCount, setHashtagCount] = useState(6);
  const [prompt, setPrompt] = useState(
    "Viết bài đăng hấp dẫn, ngắn gọn với giọng văn thu hút và kêu gọi hành động.",
  );
  const [userFeedback, setUserFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorState, setErrorState] = useState<AIErrorType>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    caption: string;
    hashtags: string[];
  } | null>(null);

  const handleGenerate = async (regenerate = false) => {
    if (!prompt.trim()) {
      toast.error(t("editor.aiGenerate.promptRequiredError"));
      return;
    }

    setIsGenerating(true);
    setErrorState(null);
    if (!regenerate) setGeneratedResult(null);

    try {
      const result = await aiGenerationService.generatePost({
        prompt,
        topic,
        tone: brandTone,
        platforms: targetPlatforms,
        hashtagCount,
        feedback: regenerate ? userFeedback : undefined,
        previousCaption: regenerate ? generatedResult?.caption : undefined,
      });
      setGeneratedResult(result);
      setUserFeedback("");
      setShowFeedbackInput(false);
      toast.success(
        regenerate
          ? t("editor.aiGenerate.regenerateSuccess")
          : t("editor.aiGenerate.generateSuccess"),
      );
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      if (status === 429) setErrorState("RATE_LIMITED");
      else if (status === 502 || status === 503)
        setErrorState("SERVICE_UNAVAILABLE");
      else setErrorState("GENERATION_FAILED");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult) return;
    onApplyAIResult(generatedResult.caption, generatedResult.hashtags);
    toast.success(t("editor.aiGenerate.textOnlyApplySuccess"));
  };

  return (
    <div className="border-border bg-card flex h-full flex-col justify-between space-y-4 rounded-xl border p-4 shadow-xs">
      <div className="space-y-4">
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
                  setPrompt((current) => `${current} ${preset.promptAdd}`)
                }
                className="hover:bg-brand-orange-soft hover:text-brand-orange text-2xs bg-muted text-muted-foreground cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors"
              >
                + {t(`editor.aiGenerate.presets.${preset.key}`)}
              </button>
            ))}
          </div>
        </div>

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

        <div className="space-y-1.5">
          <label className="text-muted-foreground text-xs font-semibold">
            {t("editor.aiGenerate.promptLabel")}
          </label>
          <Textarea
            rows={4}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={t("editor.aiGenerate.promptPlaceholders.CAPTION")}
            className="focus:ring-brand-orange/20 focus:border-brand-orange border-border bg-muted text-foreground rounded-xl text-xs"
          />
        </div>

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

        <button
          type="button"
          data-testid="generate-text"
          onClick={() => handleGenerate(false)}
          disabled={isGenerating}
          className="bg-brand-orange hover:bg-brand-orange/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Wand2 className="size-4" />
          )}
          <span>
            {isGenerating
              ? t("editor.aiGenerate.generating", { seconds: 10 })
              : t("editor.aiGenerate.generateButton")}
          </span>
        </button>

        {errorState && (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs dark:border-red-900/60 dark:bg-red-950/40">
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
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              <RotateCcw className="size-3.5" />
              {t("editor.aiGenerate.retryButton")}
            </button>
          </div>
        )}

        {generatedResult && !errorState && (
          <div className="border-border bg-muted space-y-3 rounded-xl border p-4">
            <span className="text-brand-orange text-3xs block font-bold tracking-wider uppercase">
              {t("editor.aiGenerate.textOnlyResultLabel")}
            </span>
            <Textarea
              data-testid="generated-caption"
              rows={6}
              value={generatedResult.caption}
              onChange={(event) =>
                setGeneratedResult((current) =>
                  current
                    ? { ...current, caption: event.target.value }
                    : current,
                )
              }
              className="border-border bg-card text-foreground rounded-xl text-xs leading-relaxed"
            />
            <div className="flex flex-wrap gap-1">
              {generatedResult.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="bg-brand-orange-soft text-brand-orange text-3xs rounded-xl px-2 py-0.5 font-mono font-medium"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {generatedResult && !isGenerating && (
          <div className="space-y-2">
            {!showFeedbackInput ? (
              <button
                type="button"
                onClick={() => setShowFeedbackInput(true)}
                className="text-brand-orange flex cursor-pointer items-center gap-1 text-xs font-medium hover:underline"
              >
                <MessageSquare className="size-3.5" />
                {t("editor.aiGenerate.addFeedbackButton")}
              </button>
            ) : (
              <input
                type="text"
                value={userFeedback}
                onChange={(event) => setUserFeedback(event.target.value)}
                placeholder={t("editor.aiGenerate.feedbackPlaceholder")}
                className="border-brand-orange/30 bg-card text-foreground w-full rounded-lg border p-2 text-xs focus:outline-hidden"
              />
            )}
          </div>
        )}
      </div>

      {generatedResult && !isGenerating && (
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            data-testid="regenerate-text"
            onClick={() => handleGenerate(true)}
            className="bg-muted text-foreground flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold"
          >
            <RefreshCw className="text-brand-orange size-3.5" />
            {t("editor.aiGenerate.regenerateButton")}
          </button>
          <button
            type="button"
            data-testid="apply-text"
            onClick={handleApply}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white"
          >
            <Check className="size-4" />
            {t("editor.aiGenerate.useThisButton")}
          </button>
        </div>
      )}
    </div>
  );
}
