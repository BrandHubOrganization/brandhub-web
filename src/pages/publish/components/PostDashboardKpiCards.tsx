import { useTranslation } from "react-i18next";
import { Send, CheckCircle2, Calendar, AlertOctagon, TrendingUp, Loader2 } from "lucide-react";
import type { PostKpiStats } from "../types/dashboard";

interface PostDashboardKpiCardsProps {
  kpis: PostKpiStats;
}

export function PostDashboardKpiCards({ kpis }: PostDashboardKpiCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Posts */}
      <div className="bg-card border-border relative overflow-hidden rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">
            {t("publish.dashboard.kpi.totalPosts", "Tổng bài viết")}
          </p>
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <Send className="size-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-foreground text-2xl font-bold tracking-tight">
            {kpis.totalPosts}
          </span>
          <span className="text-success flex items-center text-xs font-semibold">
            <TrendingUp className="mr-0.5 size-3" />
            +{kpis.totalPostsGrowth}%
          </span>
        </div>
        <p className="text-muted-foreground text-2xs mt-1">
          {t("publish.dashboard.kpi.totalPostsDesc", "Bao gồm tất cả bài đăng trong workspace")}
        </p>
      </div>

      {/* 2. Success Rate */}
      <div className="bg-card border-border relative overflow-hidden rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">
            {t("publish.dashboard.kpi.successRate", "Tỷ lệ xuất bản thành công")}
          </p>
          <div className="bg-success/10 text-success flex size-8 items-center justify-center rounded-lg">
            <CheckCircle2 className="size-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-foreground text-2xl font-bold tracking-tight">
            {kpis.successRate}%
          </span>
        </div>
        <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-success h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(kpis.successRate, 100)}%` }}
          />
        </div>
      </div>

      {/* 3. Scheduled / In Progress */}
      <div className="bg-card border-border relative overflow-hidden rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">
            {t("publish.dashboard.kpi.scheduled", "Đã lên lịch & Đang xử lý")}
          </p>
          <div className="bg-brand-orange-soft text-brand-orange flex size-8 items-center justify-center rounded-lg">
            <Calendar className="size-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <div>
            <span className="text-foreground text-2xl font-bold tracking-tight">
              {kpis.scheduledCount}
            </span>
            <span className="text-muted-foreground text-2xs ml-1 font-medium">
              {t("publish.dashboard.kpi.scheduledUnit", "lên lịch")}
            </span>
          </div>
          {kpis.inProgressCount > 0 && (
            <div className="text-warning flex items-center text-xs font-medium">
              <Loader2 className="mr-1 size-3 animate-spin" />
              {kpis.inProgressCount} {t("publish.dashboard.kpi.inProgressUnit", "đang gửi")}
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-2xs mt-1">
          {t("publish.dashboard.kpi.scheduledDesc", "Sắp tự động đăng theo lịch đặt trước")}
        </p>
      </div>

      {/* 4. Failed Count */}
      <div className="bg-card border-border relative overflow-hidden rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">
            {t("publish.dashboard.kpi.failed", "Bài đăng thất bại")}
          </p>
          <div className="bg-destructive/10 text-destructive flex size-8 items-center justify-center rounded-lg">
            <AlertOctagon className="size-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-foreground text-2xl font-bold tracking-tight">
            {kpis.failedCount}
          </span>
          {kpis.failedCount > 0 ? (
            <span className="text-destructive text-xs font-medium">
              {t("publish.dashboard.kpi.needAttention", "Cần xử lý")}
            </span>
          ) : (
            <span className="text-success text-xs font-medium">
              {t("publish.dashboard.kpi.systemOptimal", "Hệ thống tối ưu")}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-2xs mt-1">
          {t("publish.dashboard.kpi.failedDesc", "Gặp lỗi xác thực token hoặc chính sách MXH")}
        </p>
      </div>
    </div>
  );
}
