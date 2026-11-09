import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Share2 } from "lucide-react";
import type { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaTiktok, FaThreads } from "react-icons/fa6";
import { cn } from "@/lib/utils";

export const SOCIAL_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

interface SocialPlatformBadgeProps {
  platform: string;
  size?: "xs" | "sm" | "md";
  selected?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  showLabel?: boolean;
}

export const PLATFORM_ICON: Record<SocialPlatform, IconType> = {
  FACEBOOK: FaFacebook,
  INSTAGRAM: FaInstagram,
  TIKTOK: FaTiktok,
  THREADS: FaThreads,
};

export const PLATFORM_BRAND: Record<
  SocialPlatform,
  { icon: string; active: string }
> = {
  FACEBOOK: {
    icon: "text-[#1877F2]",
    active: "bg-[#1877F2] text-white border-[#1877F2]",
  },
  INSTAGRAM: {
    icon: "text-[#E1306C]",
    active:
      "bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white border-transparent",
  },
  TIKTOK: {
    icon: "text-black dark:text-white",
    active: "bg-black text-white border-black dark:border-zinc-600",
  },
  THREADS: {
    icon: "text-black dark:text-white",
    active:
      "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white",
  },
};

export function isSocialPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(value);
}

function getPlatformIcon(platform: string, sizeClass: string) {
  const norm = platform.toUpperCase();
  if (!isSocialPlatform(norm))
    return <Share2 className={sizeClass} aria-hidden="true" />;
  const Icon = PLATFORM_ICON[norm];
  return (
    <Icon
      className={cn(sizeClass, PLATFORM_BRAND[norm].icon)}
      aria-hidden="true"
    />
  );
}

export const SocialPlatformBadge: FC<SocialPlatformBadgeProps> = ({
  platform,
  size = "sm",
  selected = false,
  interactive = false,
  disabled = false,
  onClick,
  className,
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const norm = platform.toUpperCase();
  const label = t(`social.platforms.${norm.toLowerCase()}`, {
    defaultValue:
      norm === "FACEBOOK"
        ? "Facebook"
        : norm === "INSTAGRAM"
          ? "Instagram"
          : norm === "TIKTOK"
            ? "TikTok"
            : norm === "THREADS"
              ? "Threads"
              : platform,
  });

  const iconSizeClass =
    size === "xs" ? "size-3" : size === "md" ? "size-4" : "size-3.5";

  const sizeClass =
    size === "xs"
      ? "text-2xs px-1.5 py-0.5 gap-1 rounded"
      : size === "md"
        ? "text-sm px-3.5 py-1.5 gap-2 rounded-xl"
        : "text-xs px-2.5 py-1 gap-1.5 rounded-lg";

  const styleClass = interactive
    ? selected
      ? "bg-brand-orange-soft text-brand-orange border-brand-orange/40 font-medium shadow-2xs hover:bg-brand-orange/15"
      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground"
    : selected
      ? "bg-brand-orange-soft text-brand-orange border-brand-orange/30 font-medium"
      : "bg-muted/50 text-foreground border-border/70 font-medium";

  const Component = interactive ? "button" : "span";

  return (
    <Component
      type={interactive ? "button" : undefined}
      role={interactive ? "checkbox" : undefined}
      aria-checked={interactive ? selected : undefined}
      aria-label={label}
      disabled={interactive ? disabled : undefined}
      onClick={interactive && !disabled ? onClick : undefined}
      className={cn(
        "inline-flex items-center justify-center border transition-all select-none",
        sizeClass,
        styleClass,
        interactive &&
          "focus-visible:ring-brand-orange/40 cursor-pointer focus-visible:ring-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {getPlatformIcon(norm, iconSizeClass)}
      {showLabel && <span className="truncate">{label}</span>}
    </Component>
  );
};
