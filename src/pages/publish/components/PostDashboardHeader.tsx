import { useTranslation } from "react-i18next";
import { Search, Calendar, Filter } from "lucide-react";
import type { PostDashboardFilters } from "../types/dashboard";

interface PostDashboardHeaderProps {
  filters: PostDashboardFilters;
  onFilterChange: (filters: Partial<PostDashboardFilters>) => void;
}

export function PostDashboardHeader({
  filters,
  onFilterChange,
}: PostDashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border-border flex flex-wrap items-center gap-3 rounded-xl border p-3">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          placeholder={t("publish.dashboard.searchPlaceholder", "Tìm theo tiêu đề, nội dung...")}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-ring h-9 w-full rounded-md border pl-9 pr-3 text-xs focus:outline-none focus:ring-2"
        />
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-1.5">
        <Calendar className="text-muted-foreground size-4" />
        <select
          value={filters.dateRange}
          onChange={(e) => onFilterChange({ dateRange: e.target.value as any, page: 1 })}
          className="bg-background border-border text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:outline-none focus:ring-2"
        >
          <option value="7d">{t("publish.dashboard.dateRanges.7d", "7 ngày qua")}</option>
          <option value="14d">{t("publish.dashboard.dateRanges.14d", "14 ngày qua")}</option>
          <option value="30d">{t("publish.dashboard.dateRanges.30d", "30 ngày qua")}</option>
          <option value="90d">{t("publish.dashboard.dateRanges.90d", "3 tháng qua")}</option>
          <option value="all">{t("publish.dashboard.dateRanges.all", "Tất cả thời gian")}</option>
        </select>
      </div>

      {/* Platform Selector */}
      <div className="flex items-center gap-1.5">
        <Filter className="text-muted-foreground size-4" />
        <select
          value={filters.platform}
          onChange={(e) => onFilterChange({ platform: e.target.value as any, page: 1 })}
          className="bg-background border-border text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:outline-none focus:ring-2"
        >
          <option value="ALL">{t("publish.dashboard.platforms.ALL", "Tất cả nền tảng")}</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="TIKTOK">TikTok</option>
          <option value="THREADS">Threads</option>
        </select>
      </div>

      {/* Status Selector */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ status: e.target.value as any, page: 1 })}
        className="bg-background border-border text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:outline-none focus:ring-2"
      >
        <option value="ALL">{t("publish.dashboard.statusFilters.ALL", "Tất cả trạng thái")}</option>
        <option value="PUBLISHED">{t("publish.status.PUBLISHED", "Đã đăng")}</option>
        <option value="SCHEDULED">{t("publish.status.SCHEDULED", "Đã lên lịch")}</option>
        <option value="IN_PROGRESS">{t("publish.dashboard.statusFilters.IN_PROGRESS", "Đang xử lý")}</option>
        <option value="FAILED">{t("publish.status.FAILED", "Thất bại")}</option>
      </select>
    </div>
  );
}
