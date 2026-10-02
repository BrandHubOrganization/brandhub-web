import * as React from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageWrapperProps {
  title: string;
  description?: string;
  introSummary?: string; // Đoạn giới thiệu nhỏ về trang
  guideUrl?: string; // Link đến trang cẩm nang hướng dẫn (mặc định /help/guide)
  guideLabel?: string;
  showGuideButton?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
  bannerImage?: string;
  bannerBadge?: string;
  bannerIcon?: React.ReactNode;
  hideBanner?: boolean;
}

export function PageWrapper({
  title,
  description,
  introSummary,
  guideUrl = "/help/guide",
  guideLabel,
  showGuideButton = true,
  actions,
  children,
  className,
  compact = false,
  fullWidth = true,
  bannerImage,
  bannerBadge,
  bannerIcon,
  hideBanner = false,
}: PageWrapperProps) {
  React.useEffect(() => {
    document.title = `${title} | BrandHub`;
  }, [title]);

  return (
    <div
      className={cn(
        "w-full space-y-6 px-4 py-4 pb-24 md:px-8 md:py-6",
        !fullWidth && "max-w-7xl mx-auto",
        compact &&
          "space-y-3 p-3 pb-24 md:px-5 md:py-4 md:pb-24",
        className,
      )}
    >
      {/* ── HEADER AREA ── */}
      {compact || hideBanner ? (
        // Compact / Minimal Header (for full screen editors)
        <div
          className={cn(
            "border-border flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center",
            compact && "gap-2 pb-2",
          )}
        >
          <div className="space-y-1">
            <h1
              className={cn(
                "text-foreground font-sans text-2xl font-bold tracking-tight",
                compact && "text-xl",
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "text-muted-foreground text-xs",
                  compact && "text-2xs",
                )}
              >
                {description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
            {showGuideButton && (
              <Link
                to={guideUrl}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-xs"
                title="Xem hướng dẫn chi tiết & tài liệu quản trị"
              >
                <BookOpen className="size-3.5 text-brand-orange" />
                <span>{guideLabel || "Hướng dẫn"}</span>
              </Link>
            )}
            {actions}
          </div>
        </div>
      ) : (
        // Decorative Hero Banner Header
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all">
          {/* Background Layer: Image or Abstract Gradient Mesh */}
          {bannerImage ? (
            <div className="absolute inset-0 select-none">
              <img
                src={bannerImage}
                alt=""
                className="size-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40 backdrop-blur-[0.5px]" />
            </div>
          ) : (
            <div className="absolute inset-0 select-none overflow-hidden">
              {/* Subtle gradient wash */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/[0.08] via-amber-500/[0.04] to-purple-600/[0.06] dark:from-brand-orange/[0.14] dark:via-zinc-900/80 dark:to-purple-500/[0.1]" />

              {/* Ambient glowing radial orbs */}
              <div className="pointer-events-none absolute -top-16 -right-16 size-72 rounded-full bg-brand-orange/15 dark:bg-brand-orange/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 right-36 size-60 rounded-full bg-amber-500/10 dark:bg-purple-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-brand-orange/10 dark:bg-brand-orange/15 blur-2xl" />

              {/* Geometric pattern grid overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06] bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Top ambient highlight line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-orange/20 via-brand-orange to-amber-400/40" />

              {/* Decorative abstract watermark in corner */}
              <div className="pointer-events-none absolute right-8 -bottom-6 opacity-[0.04] dark:opacity-[0.06] text-foreground select-none">
                <Sparkles className="size-48" />
              </div>
            </div>
          )}

          {/* Banner Content */}
          <div className="relative z-10 flex flex-col justify-between gap-4 p-6 sm:p-7 md:flex-row md:items-center md:p-8">
            <div className="space-y-1.5 max-w-3xl">
              {/* Optional Badge */}
              {bannerBadge && (
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold tracking-wide shadow-xs mb-1",
                    bannerImage
                      ? "bg-white/20 text-white border border-white/30 backdrop-blur-md"
                      : "bg-brand-orange/10 text-brand-orange border border-brand-orange/25 dark:bg-brand-orange/20",
                  )}
                >
                  {bannerIcon || <Sparkles className="size-3" />}
                  <span>{bannerBadge}</span>
                </div>
              )}

              {/* Page Title */}
              <h1
                className={cn(
                  "font-sans text-2xl sm:text-3xl font-bold tracking-tight",
                  bannerImage ? "text-white drop-shadow-xs" : "text-foreground",
                )}
              >
                {title}
              </h1>

              {/* Description */}
              {description && (
                <p
                  className={cn(
                    "text-xs sm:text-sm leading-relaxed",
                    bannerImage
                      ? "text-zinc-200/90 drop-shadow-xs"
                      : "text-muted-foreground",
                  )}
                >
                  {description}
                </p>
              )}
            </div>

            {/* Action Buttons & Guide Button */}
            <div className="relative z-10 flex flex-wrap shrink-0 items-center gap-2 self-start md:self-center">
              {showGuideButton && (
                <Link
                  to={guideUrl}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all shadow-xs border",
                    bannerImage
                      ? "bg-black/35 hover:bg-black/50 text-white border-white/20 backdrop-blur-md"
                      : "bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border",
                  )}
                  title="Xem hướng dẫn chi tiết & tài liệu quản trị"
                >
                  <BookOpen className="size-3.5 text-brand-orange" />
                  <span>{guideLabel || "Hướng dẫn"}</span>
                </Link>
              )}
              {actions}
            </div>
          </div>
        </div>
      )}

      {/* ── OPTIONAL INTRODUCTORY SUMMARY CALLOUT ── */}
      {introSummary && (
        <div className="border-border/80 bg-card rounded-xl border p-4 shadow-xs flex items-start gap-3">
          <div className="bg-brand-orange/10 text-brand-orange rounded-lg p-1.5 shrink-0 mt-0.5">
            <Info className="size-4" />
          </div>
          <div className="space-y-1 flex-1 min-w-0 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Giới thiệu nhanh về tính năng:</span>
              <Link
                to={guideUrl}
                className="text-brand-orange hover:underline text-3xs font-medium inline-flex items-center gap-1"
              >
                Chi tiết trong cẩm nang <BookOpen className="size-3" />
              </Link>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {introSummary}
            </p>
          </div>
        </div>
      )}

      {/* ── BODY CONTENT ── */}
      <div className="w-full">{children}</div>
    </div>
  );
}

export default PageWrapper;
