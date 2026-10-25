import { useTranslation } from "react-i18next";
import { Share2, ArrowRight, CheckCircle2, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostDashboard } from "@/pages/publish/hooks/usePostDashboard";

interface SocialQuickSnapshotProps {
  workspaceId: string;
  onNavigateToPublishing: () => void;
}

export function SocialQuickSnapshot({
  workspaceId,
  onNavigateToPublishing,
}: SocialQuickSnapshotProps) {
  const { t } = useTranslation();
  const { data, isLoading } = usePostDashboard(workspaceId);

  return (
    <div className="bg-card border-border/70 relative overflow-hidden rounded-2xl border p-5 shadow-2xs transition-all hover:border-border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-orange/15 text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Share2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-foreground text-sm font-bold">
                {t("workspace.dashboard.socialSnapshot.title", "Hiệu quả Xuất bản Mạng xã hội")}
              </h2>
              <span className="bg-brand-orange/10 text-brand-orange rounded-full px-2 py-0.5 text-3xs font-semibold">
                Live
              </span>
            </div>
            <p className="text-muted-foreground text-2xs mt-0.5">
              {t(
                "workspace.dashboard.socialSnapshot.subtitle",
                "Số liệu phân phối bài viết trên Facebook, Instagram, TikTok & Threads",
              )}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateToPublishing}
          className="group hover:border-brand-orange/40 hover:text-brand-orange gap-1.5 self-start text-xs font-semibold sm:self-center"
        >
          <span>{t("workspace.dashboard.socialSnapshot.viewFull", "Xem báo cáo chi tiết")}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Metric 1: Total Posts */}
          <div className="bg-muted/30 dark:bg-muted/15 border-border/40 flex items-center gap-3 rounded-xl border p-3">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <FileText className="size-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-3xs font-medium uppercase tracking-wider">
                {t("publish.dashboard.kpis.totalPosts", "Tổng bài viết")}
              </p>
              <p className="text-foreground text-base font-bold">
                {data?.kpis.totalPosts ?? 0}
              </p>
            </div>
          </div>

          {/* Metric 2: Success Rate */}
          <div className="bg-muted/30 dark:bg-muted/15 border-border/40 flex items-center gap-3 rounded-xl border p-3">
            <div className="bg-emerald-500/10 text-emerald-500 flex size-8 shrink-0 items-center justify-center rounded-lg">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-3xs font-medium uppercase tracking-wider">
                {t("publish.dashboard.kpis.successRate", "Tỉ lệ thành công")}
              </p>
              <p className="text-foreground text-base font-bold">
                {data?.kpis.successRate ?? 0}%
              </p>
            </div>
          </div>

          {/* Metric 3: Scheduled Posts */}
          <div className="bg-muted/30 dark:bg-muted/15 border-border/40 flex items-center gap-3 rounded-xl border p-3">
            <div className="bg-sky-500/10 text-sky-500 flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Calendar className="size-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-3xs font-medium uppercase tracking-wider">
                {t("publish.dashboard.kpis.scheduled", "Đã lên lịch")}
              </p>
              <p className="text-foreground text-base font-bold">
                {data?.kpis.scheduledCount ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
