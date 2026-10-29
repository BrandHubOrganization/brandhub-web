import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { AtSign, Camera, Share2, Video } from "lucide-react";
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

function getPlatformIcon(platform: string, sizeClass: string) {
  const norm = platform.toUpperCase();
  switch (norm) {
    case "FACEBOOK":
      return <Share2 className={sizeClass} aria-hidden="true" />;
    case "INSTAGRAM":
      return <Camera className={sizeClass} aria-hidden="true" />;
    case "TIKTOK":
      return <Video className={sizeClass} aria-hidden="true" />;
    case "THREADS":
      return <AtSign className={sizeClass} aria-hidden="true" />;
    default:
      return <Share2 className={sizeClass} aria-hidden="true" />;
  }
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
          "cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange/40 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {getPlatformIcon(norm, iconSizeClass)}
      {showLabel && <span className="truncate">{label}</span>}
    </Component>
  );
};
