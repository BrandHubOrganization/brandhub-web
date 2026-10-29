import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";
import type { Platform, PostStatus } from "@/types/post";
import type { PlatformPostDetail } from "@/pages/publish/types/postDetail";

interface PostPlatformTabsProps {
  platforms: Platform[];
  selectedPlatform: Platform;
  platformData?: Partial<Record<Platform, PlatformPostDetail>>;
  fallbackStatus: PostStatus | "IN_PROGRESS";
  onSelectPlatform: (platform: Platform) => void;
  onRetry?: () => void;
}

function PlatformStatusBadge({ status }: { status: PostStatus | "IN_PROGRESS" }) {
  const { t } = useTranslation();

  if (status === "PUBLISHED") {
    return (
      <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium">
        <CheckCircle2 className="size-3" />
        {t("publish.status.PUBLISHED", "Đã đăng")}
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium">
        <AlertTriangle className="size-3" />
        {t("publish.status.FAILED", "Thất bại")}
      </span>
    );
  }
  return (
    <span className="bg-brand-orange/10 text-brand-orange inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium">
      <Clock className="size-3" />
      {t("publish.dashboard.statusFilters.IN_PROGRESS", "Đang xử lý")}
    </span>
  );
}

function PlatformErrorBanner({
  platform,
  detail,
  onRetry,
}: {
  platform: Platform;
  detail?: PlatformPostDetail | null;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const meta = PLATFORM_META[platform];

  return (
    <div className="bg-destructive/10 border-destructive/30 flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-destructive text-xs font-semibold">
            {t("publish.detail.platformFailedTitle", {
              platform: meta?.label || platform,
              defaultValue: `Đăng bài lên ${meta?.label || platform} thất bại`,
            })}
          </p>
          <p className="text-muted-foreground text-xs">
            {detail?.errorMessage ||
              t(
                "publish.detail.platformFailedDesc",
                "Không thể xuất bản lên nền tảng này. Vui lòng kiểm tra kết nối tài khoản hoặc thử lại.",
              )}
          </p>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0 gap-1.5 text-xs">
          <RefreshCw className="size-3.5" />
          {t("publish.retry", "Thử lại")}
        </Button>
      )}
    </div>
  );
}

export function PostPlatformTabs({
  platforms,
  selectedPlatform,
  platformData,
  fallbackStatus,
  onSelectPlatform,
  onRetry,
}: PostPlatformTabsProps) {
  const activeDetail = platformData?.[selectedPlatform];
  const activeStatus = activeDetail?.status || fallbackStatus;

  return (
    <div className="space-y-3">
      {platforms.length > 1 && (
        <div className="bg-card border-border flex flex-wrap items-center gap-2 rounded-xl border p-2">
          {platforms.map((platform) => {
            const meta = PLATFORM_META[platform];
            const isSelected = platform === selectedPlatform;
            const status = platformData?.[platform]?.status || fallbackStatus;
            return (
              <Button
                key={platform}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSelectPlatform(platform)}
                className={`h-auto gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                  isSelected
                    ? "border-brand-orange text-brand-orange bg-brand-orange/10 font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <span className="flex size-4 items-center justify-center">{meta?.icon}</span>
                <span>{meta?.label || platform}</span>
                <PlatformStatusBadge status={status} />
              </Button>
            );
          })}
        </div>
      )}

      {activeStatus === "FAILED" && (
        <PlatformErrorBanner platform={selectedPlatform} detail={activeDetail} onRetry={onRetry} />
      )}
    </div>
  );
}

