import React, { useState } from "react";
import type { PlatformType } from "@/types/calendar";
import type { InstagramFormat, PostPreviewData } from "@/types/preview";
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
  Image as ImageIcon,
  Film,
  GalleryHorizontal,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface PlatformPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PostPreviewData;
}

const PLATFORM_ICONS: Record<PlatformType, React.ReactNode> = {
  FACEBOOK: <Share2 className="size-4 text-blue-500" />,
  INSTAGRAM: <Globe className="size-4 text-pink-500" />,
  TIKTOK: <Video className="text-foreground size-4" />,
  THREADS: <AtSign className="text-muted-foreground size-4" />,
  ZALO_OA: <MessageSquare className="size-4 text-sky-500" />,
  YOUTUBE: <MessageSquare className="size-4 text-red-500" />,
};

export const PlatformPreviewModal: React.FC<PlatformPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { t } = useTranslation();
  const { targetPlatforms = ["FACEBOOK"], caption = "" } = data;
  const [activePlatform, setActivePlatform] = useState<PlatformType>(
    targetPlatforms[0] || "FACEBOOK",
  );
  const [instagramFormat, setInstagramFormat] =
    useState<InstagramFormat>("IMAGE");

  const INSTAGRAM_FORMATS: {
    key: InstagramFormat;
    icon: React.ReactNode;
  }[] = [
    { key: "IMAGE", icon: <ImageIcon className="size-3.5" /> },
    { key: "REEL", icon: <Film className="size-3.5" /> },
    { key: "CAROUSEL", icon: <GalleryHorizontal className="size-3.5" /> },
    { key: "STORY", icon: <CircleDot className="size-3.5" /> },
  ];

  if (!isOpen) return null;

  const activeConfig =
    PLATFORM_LIMITS[activePlatform] || PLATFORM_LIMITS.FACEBOOK;
  const isOverLimit = caption.length > activeConfig.maxCharacters;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    toast.success(t("editor.preview.copyCaptionSuccess"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="animate-in fade-in zoom-in-95 border-border bg-card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-2xl duration-200">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Eye className="text-brand-orange size-5" />
            <h3 className="text-foreground text-base font-semibold">
              {t("editor.preview.title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="border-border bg-muted/50 flex items-center justify-between border-b px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {targetPlatforms.map((platform) => {
              const isActive = activePlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "text-brand-orange border-border bg-card border shadow-xs"
                      : "text-muted-foreground hover:bg-accent"
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
            className="border-border text-muted-foreground hover:bg-muted flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Copy className="size-3.5" />
            <span>{t("editor.preview.copyCaptionButton")}</span>
          </button>
        </div>

        {/* Character Limit Bar */}
        <div className="border-border bg-muted flex items-center justify-between border-b px-6 py-2 text-xs">
          <span className="text-muted-foreground">
            {t("editor.preview.specLabel")}{" "}
            <strong className="text-muted-foreground">
              {activeConfig.label}
            </strong>
          </span>
          <div
            className={`flex items-center gap-1.5 rounded-xl px-2 py-0.5 font-medium ${
              isOverLimit
                ? "border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "text-muted-foreground"
            }`}
          >
            {isOverLimit && <AlertCircle className="size-3.5 text-rose-600" />}
            <span>
              {caption.length} / {activeConfig.maxCharacters}{" "}
              {t("editor.preview.charsLabel")}
            </span>
          </div>
        </div>

        {/* Instagram Format Tabs */}
        {activePlatform === "INSTAGRAM" && (
          <div className="border-border bg-muted/30 flex items-center gap-1 border-b px-6 py-2">
            {INSTAGRAM_FORMATS.map((fmt) => (
              <button
                key={fmt.key}
                onClick={() => setInstagramFormat(fmt.key)}
                className={`text-2xs flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  instagramFormat === fmt.key
                    ? "bg-brand-orange-soft text-brand-orange"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {fmt.icon}
                {t(`editor.preview.instagramFormat.${fmt.key}`)}
              </button>
            ))}
          </div>
        )}

        {/* Mockup Render Body */}
        <div className="bg-muted/50 flex-1 overflow-y-auto p-6">
          <PlatformMockup
            platform={activePlatform}
            data={{ ...data, instagramFormat }}
          />
        </div>
      </div>
    </div>
  );
};
