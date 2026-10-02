import type { Platform } from "@/types/post";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";

export interface PlatformMeta {
  label: string;
  icon: React.ReactNode;
  color: string;
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  FACEBOOK: {
    label: "Facebook",
    icon: <FaFacebook className="size-4.5 text-[#1877F2]" />,
    color: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: <FaInstagram className="size-4.5 text-[#E4405F]" />,
    color: "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  },
  TIKTOK: {
    label: "TikTok",
    icon: <FaTiktok className="text-foreground size-4" />,
    color:
      "border-slate-500/30 bg-slate-500/10 text-slate-900 dark:text-slate-100",
  },
  THREADS: {
    label: "Threads",
    icon: <SiThreads className="text-foreground size-4" />,
    color:
      "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  YOUTUBE: {
    label: "Youtube",
    icon: <FaYoutube className="size-4.5 text-[#FF0000]" />,
    color: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
};

export const ALL_PLATFORMS: Platform[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
];
