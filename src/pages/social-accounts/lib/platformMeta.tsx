import type { Platform } from "@/types/post";
import { Video, AtSign, Share2, Globe, MessageSquare } from "lucide-react";

export interface PlatformMeta {
  label: string;
  icon: React.ReactNode;
  color: string;
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  FACEBOOK: {
    label: "Facebook",
    icon: <Share2 className="h-4 w-4 text-blue-600" />,
    color: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: <Globe className="h-4 w-4 text-pink-600" />,
    color: "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  },
  TIKTOK: {
    label: "TikTok",
    icon: <Video className="h-4 w-4 text-slate-900 dark:text-slate-100" />,
    color:
      "border-slate-500/30 bg-slate-500/10 text-slate-900 dark:text-slate-100",
  },
  THREADS: {
    label: "Threads",
    icon: <AtSign className="h-4 w-4 text-purple-600" />,
    color:
      "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  ZALO_OA: {
    label: "Zalo OA",
    icon: <MessageSquare className="h-4 w-4 text-sky-600" />,
    color: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  YOUTUBE: {
    label: "Youtube",
    icon: <MessageSquare className="h-4 w-4 text-red-600" />,
    color: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
};

export const ALL_PLATFORMS: Platform[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
  "ZALO_OA",
  "YOUTUBE",
];
