import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, BookOpen, Info, Building2 } from "lucide-react";
import { AiCreditBalance } from "@/components/billing/AiCreditBalance";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn } from "@/lib/utils";

export interface PageWrapperProps {
  title: string;
  description?: React.ReactNode;
  introSummary?: string; // Đoạn giới thiệu nhỏ về trang
  guideUrl?: string; // Link đến trang cẩm nang hướng dẫn (mặc định /help/guide)
  guideLabel?: string;
  showGuideButton?: boolean;
  showWorkspaceBadge?: boolean;
  avatar?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
  fullWidth?: boolean;
  bannerImage?: string;
  bannerBadge?: string;
  bannerIcon?: React.ReactNode;
  hideBanner?: boolean;
  hideHeader?: boolean;
  headerTextClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function PageWrapper({
  title,
  description,
  introSummary,
  guideUrl = "/help/guide",
  guideLabel,
  showGuideButton = true,
  showWorkspaceBadge = true,
  avatar,
  badges,
  actions,
  children,
  className,
  contentClassName,
  compact = false,
  fullWidth = true,
  bannerImage,
  bannerBadge,
  bannerIcon,
  hideBanner: _hideBanner = false,
  hideHeader = false,
  headerTextClassName,
  titleClassName,
  descriptionClassName,
}: PageWrapperProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  React.useEffect(() => {
    if (document.documentElement.dataset.seoManaged !== "true") {
      document.title = `${title} | BrandHub`;
    }
  }, [title]);

  const isPublicHelp =
    location.pathname.startsWith("/help") ||
    location.pathname.startsWith("/blog") ||
    location.pathname === "/privacy" ||
    location.pathname === "/terms";

  const isWorkspaceRoute =
    location.pathname.includes("/workspaces/") ||
    location.pathname.startsWith("/workspaces") ||
    location.pathname.startsWith("/workspace");

  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0 space-y-4 overflow-x-clip py-3 pb-20 md:py-4",
        isPublicHelp ? "px-4 sm:px-6 lg:px-8" : "px-4 md:px-6",
        !fullWidth && "mx-auto max-w-7xl",
        compact && "space-y-2.5 p-2.5 pb-16 md:px-4 md:py-3 md:pb-16",
        className,
      )}
    >
      {location.pathname.startsWith("/ai-studio/") && <AiCreditBalance />}

      {/* ── HEADER AREA: Compact Decorative Hero Banner Header ── */}
      {!hideHeader && (
        <div className="border-border/80 bg-card relative max-w-full overflow-hidden rounded-xl border shadow-xs transition-all">
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
            <div className="absolute inset-0 overflow-hidden select-none">
              {/* Subtle gradient wash */}
              <div className="from-brand-orange/[0.08] dark:from-brand-orange/[0.14] absolute inset-0 bg-gradient-to-br via-amber-500/[0.04] to-purple-600/[0.06] dark:via-zinc-900/80 dark:to-purple-500/[0.1]" />

              {/* Ambient glowing radial orbs */}
              <div className="bg-brand-orange/15 dark:bg-brand-orange/25 pointer-events-none absolute -top-12 -right-12 size-44 rounded-full blur-2xl" />
              <div className="pointer-events-none absolute right-24 -bottom-12 size-36 rounded-full bg-amber-500/10 blur-2xl dark:bg-purple-500/20" />
              <div className="bg-brand-orange/10 dark:bg-brand-orange/15 pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full blur-xl" />

              {/* Geometric pattern grid overlay */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px] opacity-[0.03] dark:opacity-[0.05]" />

              {/* Top ambient highlight line */}
              <div className="from-brand-orange/20 via-brand-orange pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r to-amber-400/40" />

              {/* Decorative abstract watermark in corner */}
              <div className="text-foreground pointer-events-none absolute right-4 -bottom-4 opacity-[0.04] select-none dark:opacity-[0.06]">
                <Sparkles className="size-24" />
              </div>
            </div>
          )}

          {/* Banner Content */}
          <div
            className={cn(
              "relative z-10 flex min-w-0 flex-col justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 md:flex-row md:items-center",
              compact && "px-3.5 py-2.5 sm:px-4 sm:py-2.5",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {avatar && <div className="shrink-0">{avatar}</div>}
              <div
                className={cn(
                  "min-w-0 flex-1 space-y-0.5",
                  headerTextClassName,
                )}
              >
                {/* Optional Badge */}
                {bannerBadge && (
                  <div
                    className={cn(
                      "mb-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-xs",
                      bannerImage
                        ? "border border-white/30 bg-white/20 text-white backdrop-blur-md"
                        : "bg-brand-orange/10 text-brand-orange border-brand-orange/25 dark:bg-brand-orange/20 border",
                    )}
                  >
                    {bannerIcon || <Sparkles className="size-3" />}
                    <span>{bannerBadge}</span>
                  </div>
                )}

                {/* Page Title & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className={cn(
                      "font-sans text-lg font-bold tracking-tight sm:text-xl",
                      bannerImage
                        ? "text-white drop-shadow-xs"
                        : "text-foreground",
                      titleClassName,
                    )}
                  >
                    {title}
                  </h1>
                  {badges}
                </div>

                {/* Description */}
                {description && (
                  <div
                    className={cn(
                      "text-xs leading-snug",
                      bannerImage
                        ? "text-zinc-200/90 drop-shadow-xs"
                        : "text-muted-foreground",
                      descriptionClassName,
                    )}
                  >
                    {description}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons & Guide Button */}
            <div className="relative z-10 flex min-w-0 flex-wrap items-center gap-2 self-start md:max-w-[60%] md:justify-end md:self-center">
              {showGuideButton && (
                <Link
                  to={guideUrl}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium shadow-xs transition-all",
                    bannerImage
                      ? "border-white/20 bg-black/35 text-white backdrop-blur-md hover:bg-black/50"
                      : "bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border",
                  )}
                  title={t("common.guideHint")}
                >
                  <BookOpen className="text-brand-orange size-3.5" />
                  <span>{guideLabel || t("common.guide")}</span>
                </Link>
              )}

              {showWorkspaceBadge && isWorkspaceRoute && currentWorkspace?.name && (
                <div className="border-border bg-card text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium shadow-xs">
                  <Building2 className="text-brand-orange size-3.5" />
                  <span>Workspace: {currentWorkspace.name}</span>
                </div>
              )}

              {actions}
            </div>
          </div>
        </div>
      )}

      {/* ── OPTIONAL INTRODUCTORY SUMMARY CALLOUT ── */}
      {introSummary && (
        <div className="border-border/80 bg-card flex items-start gap-3 rounded-xl border p-4 shadow-xs">
          <div className="bg-brand-orange/10 text-brand-orange mt-0.5 shrink-0 rounded-lg p-1.5">
            <Info className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-foreground font-semibold">
                Giới thiệu nhanh về tính năng:
              </span>
              <Link
                to={guideUrl}
                className="text-brand-orange text-3xs inline-flex items-center gap-1 font-medium hover:underline"
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
      <div className={cn("w-full min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}

export default PageWrapper;
