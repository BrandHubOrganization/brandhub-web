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
import { mockEditorService } from "@/services/mockEditorService";
import type { SocialPlatform, AIErrorType } from "@/types/editor";
import { ImageLightboxModal } from "./ImageLightboxModal";
import { toast } from "sonner";

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
    label: "Hài hước / Viral",
    promptAdd: "Phong cách vui vẻ, hài hước, tạo sự chú ý.",
  },
  {
    label: "Chuyên nghiệp",
    promptAdd: "Giọng văn chuyên nghiệp, ngắn gọn, đáng tin cậy.",
  },
  {
    label: "Kêu gọi mua hàng (CTA)",
    promptAdd: "Tập trung vào ưu đãi, thúc đẩy mua hàng ngay.",
  },
];

export const AIGeneratePanel: React.FC<AIGeneratePanelProps> = ({
  topic = "",
  targetPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
  onApplyAIResult,
}) => {
  const [prompt, setPrompt] = useState(
    "Viết bài đăng hấp dẫn, ngắn gọn với giọng văn thu hút và kêu gọi hành động.",
  );
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

  const handleGenerate = async (isRegenerate: boolean = false) => {
    if (!prompt.trim()) {
      toast.error("Vui lòng nhập yêu cầu cho AI Co-Pilot");
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
          ? "Đã tái tạo nội dung theo phản hồi!"
          : "AI Co-Pilot đã tạo xong nội dung!",
      );
    } catch (err: any) {
      if (err.message === "RATE_LIMITED") {
        setErrorState("RATE_LIMITED");
      } else if (err.message === "SERVICE_UNAVAILABLE") {
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
      toast.success("Đã áp dụng Caption, Hashtags & Ảnh AI vào bài viết!");
    }
  };

  return (
    <div className="flex h-full flex-col justify-between space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-4">
        {/* Header Title */}
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-1.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              Trợ lý AI Co-Pilot
              <span className="bg-brand-orange-soft text-brand-orange rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                Pro
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Tự động tạo Caption, Hashtags & Ảnh AI (Stability AI)
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            Gợi ý phong cách:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TONE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  setPrompt((prev) => `${prev} ${preset.promptAdd}`)
                }
                className="hover:bg-brand-orange-soft hover:text-brand-orange cursor-pointer rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 transition-colors dark:bg-zinc-800 dark:text-zinc-300"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Yêu cầu định hướng (Prompt)
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ví dụ: Viết bài đăng phong cách hài hước..."
            className="focus:ring-brand-orange/20 focus:border-brand-orange w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 transition-colors focus:ring-2 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI đang tạo (~{estimatedSeconds}s)...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              <span>Generate with AI</span>
            </>
          )}
        </button>

        {/* Error States Display */}
        {errorState && (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs dark:border-red-900/60 dark:bg-red-950/40">
            <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {errorState === "SERVICE_UNAVAILABLE" &&
                  "Dịch vụ AI hiện không khả dụng (503)"}
                {errorState === "RATE_LIMITED" &&
                  "Vượt quá giới hạn gọi AI (429 Rate Limit)"}
                {errorState === "GENERATION_FAILED" &&
                  "Tạo nội dung thất bại. Vui lòng thử lại"}
              </span>
            </div>
            <p className="text-[11px] text-red-600 dark:text-red-400">
              Vui lòng kiểm tra lại kết nối mạng hoặc nhập prompt khác trước khi
              thử lại.
            </p>
            <button
              onClick={() => handleGenerate(false)}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Thử lại (Retry)</span>
            </button>
          </div>
        )}

        {/* Result & Streaming Display Box */}
        {(isGenerating || streamingText || generatedResult) && !errorState && (
          <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between">
              <span className="text-brand-orange text-[10px] font-bold tracking-wider uppercase">
                Kết Quả AI Sinh (Text & Stability AI):
              </span>
              {isGenerating && (
                <span className="font-mono text-[10px] text-zinc-400">
                  Ước tính: ~{estimatedSeconds}s
                </span>
              )}
            </div>

            {/* Skeleton Loading State */}
            {isGenerating && !streamingText && (
              <div className="animate-pulse space-y-2.5 py-2">
                <div className="h-3 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="mt-2 h-20 w-full rounded-xl bg-zinc-200 dark:bg-zinc-700" />
              </div>
            )}

            {/* Streaming Caption */}
            {streamingText && (
              <textarea
                rows={4}
                value={streamingText}
                onChange={(e) => setStreamingText(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 font-sans text-xs leading-relaxed text-zinc-800 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
            )}

            {/* Generated AI Image Thumbnail with Lightbox */}
            {generatedResult?.imageUrl && (
              <div className="space-y-1.5 pt-1">
                <span className="block text-[10px] font-semibold text-zinc-400">
                  Ảnh AI Sinh (Stability AI):
                </span>
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="group hover:border-brand-orange relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 shadow-2xs transition-all dark:border-zinc-700"
                >
                  <img
                    src={generatedResult.imageUrl}
                    alt="AI Generated"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-4 w-4" />
                    <span>Xem Phóng To</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Hashtags Tags */}
            {generatedResult && (
              <div className="border-t border-zinc-200/60 pt-2 dark:border-zinc-700/60">
                <span className="mb-1 block text-[10px] font-semibold text-zinc-400">
                  Hashtags đính kèm:
                </span>
                <div className="flex flex-wrap gap-1">
                  {generatedResult.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-brand-orange-soft text-brand-orange rounded-md px-2 py-0.5 font-mono text-[10px] font-medium"
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
                <MessageSquare className="h-3.5 w-3.5" />
                <span>
                  + Phản hồi bổ sung để Regenerate ( Make it shorter,
                  professional...)
                </span>
              </button>
            ) : (
              <div className="bg-brand-orange-soft/40 border-brand-orange/20 space-y-1.5 rounded-xl border p-3">
                <label className="text-brand-orange block text-[11px] font-semibold">
                  Ý kiến phản hồi tinh chỉnh AI (Feedback):
                </label>
                <input
                  type="text"
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder="Ví dụ: Make it more professional, shorter caption..."
                  className="border-brand-orange/30 w-full rounded-lg border bg-white p-2 text-xs text-zinc-900 focus:outline-hidden dark:bg-zinc-800 dark:text-zinc-100"
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
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <RefreshCw className="text-brand-orange h-3.5 w-3.5" />
            <span>Regenerate</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Use this</span>
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
