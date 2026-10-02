import { type ReactNode } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

export interface ProfileBannerHeaderProps {
  bannerUrl: string | null;
  bannerEmptyLabel?: string;
  uploadBannerLabel?: string;
  uploadingBanner?: boolean;
  bannerInputRef?: React.RefObject<HTMLInputElement | null>;
  onBannerFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canEditBanner?: boolean;

  // Avatar / Logo
  logo?: ReactNode;
  isAvatarRound?: boolean;
  canEditLogo?: boolean;
  uploadingLogo?: boolean;
  logoInputRef?: React.RefObject<HTMLInputElement | null>;
  onLogoFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoClick?: () => void;
  uploadLogoTitle?: string;

  // Information
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  hint?: ReactNode;

  // Actions
  actions?: ReactNode;

  // Body content below the header (form, tabs, metadata)
  children?: ReactNode;

  className?: string;
}

/**
 * Unified Facebook/Zalo-style profile header component.
 * Features:
 * - Full-width cover banner with optional edit/upload button (hidden for non-owners/clients).
 * - Overlapping avatar/logo (-mt-12 to -mt-16) with card-colored border.
 * - Title, subtitle, badge and action buttons alongside avatar.
 * - Child content seamlessly integrated into the same card.
 */
export function ProfileBannerHeader({
  bannerUrl,
  bannerEmptyLabel = "Chưa có ảnh bìa",
  uploadBannerLabel = "Tải ảnh bìa lên",
  uploadingBanner = false,
  bannerInputRef,
  onBannerFileChange,
  canEditBanner = false,

  logo,
  isAvatarRound = false,
  canEditLogo = false,
  uploadingLogo = false,
  logoInputRef,
  onLogoFileChange,
  onLogoClick,
  uploadLogoTitle = "Đổi ảnh đại diện",

  title,
  subtitle,
  badges,
  hint,

  actions,
  children,
  className,
}: ProfileBannerHeaderProps) {
  const handleLogoButtonClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else if (logoInputRef?.current) {
      logoInputRef.current.click();
    }
  };

  return (
    <div
      className={clsx(
        "border-border bg-card rounded-2xl border overflow-hidden shadow-xs",
        className,
      )}
    >
      {/* 1. Cover Banner Area */}
      <div className="relative h-44 sm:h-56 md:h-64 w-full bg-muted/30 overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            className="size-full object-cover select-none"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 text-muted-foreground text-xs select-none">
            {bannerEmptyLabel}
          </div>
        )}

        {/* Upload banner button: ONLY rendered if canEditBanner is true (Hidden for clients) */}
        {canEditBanner && onBannerFileChange && (
          <>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={onBannerFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={uploadingBanner}
              className="bg-card/90 backdrop-blur-xs hover:bg-card border-border absolute right-4 bottom-4 z-10 cursor-pointer gap-1.5 shadow-sm text-xs font-medium"
              onClick={() => bannerInputRef?.current?.click()}
            >
              <Camera className="size-3.5" />
              {uploadBannerLabel}
            </Button>
          </>
        )}
      </div>

      {/* 2. Profile Info Header (Logo overlaps banner) */}
      <div className="px-6 pb-6 pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 min-w-0">
            {/* Logo / Avatar overlapping the banner */}
            <div className="relative -mt-12 sm:-mt-16 shrink-0 z-10">
              <div
                className={clsx(
                  "flex size-24 sm:size-28 items-center justify-center overflow-hidden border-4 border-card bg-card shadow-md",
                  isAvatarRound ? "rounded-full" : "rounded-2xl",
                )}
              >
                {logo}
              </div>

              {/* Logo upload overlay button if authorized to edit logo */}
              {canEditLogo && (
                <>
                  {onLogoFileChange && logoInputRef && (
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={onLogoFileChange}
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleLogoButtonClick}
                    disabled={uploadingLogo}
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white absolute -bottom-1 -right-1 z-20 flex size-7 cursor-pointer items-center justify-center rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-50"
                    title={uploadLogoTitle}
                  >
                    <Camera className="size-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Profile Title, Tagline & Badges */}
            <div className="space-y-1 mb-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {title}
                </div>
                {badges}
              </div>
              {subtitle && (
                <div className="text-muted-foreground text-sm font-medium line-clamp-2">
                  {subtitle}
                </div>
              )}
              {hint && (
                <div className="text-muted-foreground text-xs italic">
                  {hint}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons (right-aligned) */}
          {actions && (
            <div className="flex shrink-0 items-center gap-2 mb-1">
              {actions}
            </div>
          )}
        </div>

        {/* 3. Body content (Form fields, details, metadata) */}
        {children && (
          <div className="mt-6 border-t border-border pt-6">{children}</div>
        )}
      </div>
    </div>
  );
}

export default ProfileBannerHeader;
