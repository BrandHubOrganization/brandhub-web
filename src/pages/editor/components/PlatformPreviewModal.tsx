import React, { useState } from "react";
import type { PlatformType } from "@/types/calendar";
import type { PostPreviewData } from "@/types/preview";
import { PLATFORM_LIMITS } from "@/types/preview";
import { PlatformMockup } from "./PlatformMockups";
import {
  Copy,
  Eye,
  AlertCircle,
  Share2,
  Globe,
  Video,
  AtSign,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface PlatformPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PostPreviewData;
}

const PLATFORM_ICONS: Record<PlatformType, React.ReactNode> = {
  FACEBOOK: <Share2 className="size-4 text-blue-500" />,
  INSTAGRAM: <Globe className="size-4 text-pink-500" />,
  TIKTOK: <Video className="size-4 text-slate-800 dark:text-slate-200" />,
  THREADS: <AtSign className="size-4 text-slate-700 dark:text-slate-300" />,
  YOUTUBE: <MessageSquare className="size-4 text-red-500" />,
};

export const PlatformPreviewModal: React.FC<PlatformPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { targetPlatforms = ["FACEBOOK"], caption = "" } = data;
  const [activePlatform, setActivePlatform] = useState<PlatformType>(
    targetPlatforms[0] || "FACEBOOK",
  );

  if (!isOpen) return null;

  const activeConfig =
    PLATFORM_LIMITS[activePlatform] || PLATFORM_LIMITS.FACEBOOK;
  const isOverLimit = caption.length > activeConfig.maxCharacters;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    toast.success("Caption copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="animate-in fade-in zoom-in-95 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-brand-orange" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Platform Visual Mockup Preview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {targetPlatforms.map((platform) => {
              const isActive = activePlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "border border-slate-200 bg-white text-brand-orange shadow-xs dark:border-slate-700 dark:bg-slate-800"
                      : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
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
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Copy className="size-3.5" />
            <span>Copy Caption</span>
          </button>
        </div>

        {/* Character Limit Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-2 text-xs dark:border-slate-800 dark:bg-slate-950">
          <span className="text-slate-500">
            Spec:{" "}
            <strong className="text-slate-700 dark:text-slate-300">
              {activeConfig.label}
            </strong>
          </span>
          <div
            className={`flex items-center gap-1.5 rounded-xl px-2 py-0.5 font-medium ${
              isOverLimit
                ? "border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {isOverLimit && (
              <AlertCircle className="size-3.5 text-rose-600" />
            )}
            <span>
              {caption.length} / {activeConfig.maxCharacters} chars
            </span>
          </div>
        </div>

        {/* Mockup Render Body */}
        <div className="flex-1 overflow-y-auto bg-slate-100/50 p-6 dark:bg-slate-950/50">
          <PlatformMockup platform={activePlatform} data={data} />
        </div>
      </div>
    </div>
  );
};
