import type { PlatformType } from "./calendar";

export interface PostPreviewData {
  title?: string;
  caption: string;
  mediaUrls?: string[];
  authorName?: string;
  authorAvatar?: string;
  targetPlatforms: PlatformType[];
}

export interface PlatformLimitConfig {
  maxCharacters: number;
  aspectRatioClass: string;
  label: string;
}

export const PLATFORM_LIMITS: Record<PlatformType, PlatformLimitConfig> = {
  FACEBOOK: {
    maxCharacters: 63206,
    aspectRatioClass: "aspect-[1200/630]",
    label: "Facebook (1200×630)",
  },
  INSTAGRAM: {
    maxCharacters: 2200,
    aspectRatioClass: "aspect-square",
    label: "Instagram (1:1 Square)",
  },
  TIKTOK: {
    maxCharacters: 2200,
    aspectRatioClass: "aspect-[9/16]",
    label: "TikTok (9:16 Vertical)",
  },
  THREADS: {
    maxCharacters: 500,
    aspectRatioClass: "aspect-square",
    label: "Threads (1:1 Square)",
  },
  YOUTUBE: {
    maxCharacters: 5000,
    aspectRatioClass: "aspect-video",
    label: "Youtube (16:9 Landscape)",
  },
};
