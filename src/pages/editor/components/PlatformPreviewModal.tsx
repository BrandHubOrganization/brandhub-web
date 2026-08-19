import React, { useState } from 'react';
import type { PlatformType } from "@/types/calendar";
import type { PostPreviewData } from "@/types/preview";
import { PLATFORM_LIMITS } from "@/types/preview";
import { PlatformMockup } from './PlatformMockups';
import { Copy, Eye, AlertCircle, Share2, Globe, Video, AtSign, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PostPreviewData;
}

const PLATFORM_ICONS: Record<PlatformType, React.ReactNode> = {
  FACEBOOK: <Share2 className="w-4 h-4 text-blue-500" />,
  INSTAGRAM: <Globe className="w-4 h-4 text-pink-500" />,
  TIKTOK: <Video className="w-4 h-4 text-slate-800 dark:text-slate-200" />,
  THREADS: <AtSign className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
  YOUTUBE: <MessageSquare className="w-4 h-4 text-red-500" />,
};

export const PlatformPreviewModal: React.FC<PlatformPreviewModalProps> = ({ isOpen, onClose, data }) => {
  const { targetPlatforms = ['FACEBOOK'], caption = '' } = data;
  const [activePlatform, setActivePlatform] = useState<PlatformType>(targetPlatforms[0] || 'FACEBOOK');

  if (!isOpen) return null;

  const activeConfig = PLATFORM_LIMITS[activePlatform] || PLATFORM_LIMITS.FACEBOOK;
  const isOverLimit = caption.length > activeConfig.maxCharacters;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    toast.success('Caption copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#f05a28]" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Platform Visual Mockup Preview</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none cursor-pointer">✕</button>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {targetPlatforms.map((platform) => {
              const isActive = activePlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-[#f05a28] shadow-xs border border-slate-200 dark:border-slate-700'
                      : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {PLATFORM_ICONS[platform]}
                  <span>{platform}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleCopyCaption}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Caption</span>
          </button>
        </div>

        {/* Character Limit Bar */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500">Spec: <strong className="text-slate-700 dark:text-slate-300">{activeConfig.label}</strong></span>
          <div className={`flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md ${
            isOverLimit ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'text-slate-600 dark:text-slate-400'
          }`}>
            {isOverLimit && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
            <span>{caption.length} / {activeConfig.maxCharacters} chars</span>
          </div>
        </div>

        {/* Mockup Render Body */}
        <div className="p-6 overflow-y-auto bg-slate-100/50 dark:bg-slate-950/50 flex-1">
          <PlatformMockup platform={activePlatform} data={data} />
        </div>

      </div>
    </div>
  );
};
