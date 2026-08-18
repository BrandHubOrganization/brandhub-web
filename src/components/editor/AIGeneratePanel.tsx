import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Check,
  Loader2,
  AlertTriangle,
  Maximize2,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { mockEditorService } from '@/services/mockEditorService';
import type { SocialPlatform, AIErrorType } from '@/types/editor';
import { ImageLightboxModal } from './ImageLightboxModal';
import { toast } from 'sonner';

interface AIGeneratePanelProps {
  topic?: string;
  targetPlatforms?: SocialPlatform[];
  onApplyAIResult: (caption: string, hashtags: string[], imageUrl?: string) => void;
}

export const AIGeneratePanel: React.FC<AIGeneratePanelProps> = ({
  topic = '',
  targetPlatforms = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'],
  onApplyAIResult,
}) => {
  const [prompt, setPrompt] = useState(
    'Viết bài đăng hấp dẫn, ngắn gọn với giọng văn hài hước và kêu gọi hành động.'
  );
  const [userFeedback, setUserFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  // Async States
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
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
      toast.error('Vui lòng nhập yêu cầu cho AI Co-Pilot');
      return;
    }

    setIsGenerating(true);
    setStreamingText('');
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
        }
      );

      setGeneratedResult(res);
      setUserFeedback('');
      setShowFeedbackInput(false);
      toast.success(isRegenerate ? 'Đã tái tạo nội dung theo phản hồi!' : 'AI Co-Pilot đã tạo xong nội dung!');
    } catch (err: any) {
      if (err.message === 'RATE_LIMITED') {
        setErrorState('RATE_LIMITED');
      } else if (err.message === 'SERVICE_UNAVAILABLE') {
        setErrorState('SERVICE_UNAVAILABLE');
      } else {
        setErrorState('GENERATION_FAILED');
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
        generatedResult.imageUrl
      );
      toast.success('Đã áp dụng Caption, Hashtags & Ảnh AI vào bài viết!');
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        {/* Header Title */}
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Trợ lý AI Co-Pilot
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Tạo tự động Caption, Hashtags & Ảnh AI (Stability AI)
            </p>
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
            className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={() => handleGenerate(false)}
          disabled={isGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI đang tạo (~{estimatedSeconds}s)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate with AI ✨</span>
            </>
          )}
        </button>

        {/* Error States Display */}
        {errorState && (
          <div className="p-3.5 rounded-xl border bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {errorState === 'SERVICE_UNAVAILABLE' && 'Dịch vụ AI hiện không khả dụng (503)'}
                {errorState === 'RATE_LIMITED' && 'Vượt quá giới hạn gọi AI (429 Rate Limit)'}
                {errorState === 'GENERATION_FAILED' && 'Tạo nội dung thất bại. Vui lòng thử lại'}
              </span>
            </div>
            <p className="text-[11px] text-red-600 dark:text-red-400">
              Vui lòng kiểm tra lại kết nối mạng hoặc nhập prompt khác trước khi thử lại.
            </p>
            <button
              onClick={() => handleGenerate(false)}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thử lại (Retry)</span>
            </button>
          </div>
        )}

        {/* Result & Streaming Display Box */}
        {(isGenerating || streamingText || generatedResult) && !errorState && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Kết Quả AI Sinh (Text & Stability AI):
              </span>
              {isGenerating && (
                <span className="text-[10px] font-mono text-zinc-400">
                  Ước tính: ~{estimatedSeconds}s
                </span>
              )}
            </div>

            {/* Skeleton Loading State */}
            {isGenerating && !streamingText && (
              <div className="space-y-2.5 py-2 animate-pulse">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-3/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-full" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-5/6" />
                <div className="h-20 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-full mt-2" />
              </div>
            )}

            {/* Streaming Caption */}
            {streamingText && (
              <textarea
                rows={4}
                value={streamingText}
                onChange={(e) => setStreamingText(e.target.value)}
                className="w-full text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-hidden"
              />
            )}

            {/* Generated AI Image Thumbnail with Lightbox */}
            {generatedResult?.imageUrl && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-zinc-400 block">
                  Ảnh AI Sinh (Stability AI):
                </span>
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative group rounded-xl overflow-hidden aspect-video bg-zinc-900 border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-2xs hover:border-indigo-500 transition-all"
                >
                  <img
                    src={generatedResult.imageUrl}
                    alt="AI Generated"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                    <Maximize2 className="w-4 h-4" />
                    <span>Xem Phóng To</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Hashtags Tags */}
            {generatedResult && (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-[10px] font-semibold text-zinc-400 block mb-1">Hashtags đính kèm:</span>
                <div className="flex flex-wrap gap-1">
                  {generatedResult.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
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
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>+ Phản hồi bổ sung để Regenerate ( Make it shorter, professional...)</span>
              </button>
            ) : (
              <div className="space-y-1.5 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <label className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block">
                  Ý kiến phản hồi tinh chỉnh AI (Feedback):
                </label>
                <input
                  type="text"
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder="Ví dụ: Make it more professional, shorter caption..."
                  className="w-full p-2 text-xs bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      {generatedResult && !isGenerating && (
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={() => handleGenerate(true)}
            className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Regenerate</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
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
