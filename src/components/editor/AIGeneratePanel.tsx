import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check, Loader2 } from 'lucide-react';
import { mockEditorService } from '@/services/mockEditorService';
import type { SocialPlatform } from '@/types/editor';
import { toast } from 'sonner';

interface AIGeneratePanelProps {
  topic?: string;
  targetPlatforms?: SocialPlatform[];
  onApplyAIResult: (caption: string, hashtags: string[]) => void;
}

export const AIGeneratePanel: React.FC<AIGeneratePanelProps> = ({
  topic = '',
  targetPlatforms = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'],
  onApplyAIResult,
}) => {
  const [prompt, setPrompt] = useState(
    'Viết bài đăng hấp dẫn, ngắn gọn với giọng văn hài hước và kêu gọi hành động.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [generatedResult, setGeneratedResult] = useState<{
    caption: string;
    hashtags: string[];
    reasoning?: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Vui lòng nhập yêu cầu cho AI Co-Pilot');
      return;
    }

    setIsGenerating(true);
    setStreamingText('');
    setGeneratedResult(null);

    try {
      const res = await mockEditorService.generateWithAI(
        { prompt, topic, platforms: targetPlatforms },
        (partialText) => {
          setStreamingText(partialText);
        }
      );
      setGeneratedResult(res);
      toast.success('AI Co-Pilot đã tạo xong nội dung!');
    } catch (err) {
      toast.error('Lỗi khi gọi AI Co-Pilot');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedResult) {
      onApplyAIResult(generatedResult.caption, generatedResult.hashtags);
      toast.success('Đã áp dụng nội dung AI sinh vào bài viết!');
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
              Tự động viết caption & gợi ý hashtag tối ưu tương tác
            </p>
          </div>
        </div>

        {/* Prompt Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Yêu cầu định hướng nội dung (Prompt)
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ví dụ: Viết bài đăng khuyến mãi 20% với giọng văn thân thiện..."
            className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Generate Trigger Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI đang viết bài (Streaming...)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Tạo Nội Dung Bằng AI ✨</span>
            </>
          )}
        </button>

        {/* Streaming & Result Display Box */}
        {(isGenerating || streamingText || generatedResult) && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Kết Quả AI Sinh Real-time:
            </span>

            {/* Skeleton if initializing */}
            {isGenerating && !streamingText && (
              <div className="space-y-2 py-2 animate-pulse">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-3/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-full" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-5/6" />
              </div>
            )}

            {/* Streaming Output Text */}
            {streamingText && (
              <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
                {streamingText}
                {isGenerating && <span className="inline-block w-1.5 h-4 bg-indigo-600 ml-1 animate-ping" />}
              </p>
            )}

            {/* Generated Hashtags */}
            {generatedResult && (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-[10px] font-semibold text-zinc-400 block mb-1">Hashtags gợi ý:</span>
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
      </div>

      {/* Apply Result Button */}
      {generatedResult && (
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="flex-1 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tạo lại</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Áp dụng vào Editor</span>
          </button>
        </div>
      )}
    </div>
  );
};
