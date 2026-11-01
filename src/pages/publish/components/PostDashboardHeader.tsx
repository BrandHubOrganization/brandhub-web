import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter } from "lucide-react";
import type { PostDashboardFilters } from "../types/dashboard";
import { PostDashboardDatePicker } from "./PostDashboardDatePicker";

interface PostDashboardHeaderProps {
  filters: PostDashboardFilters;
  onFilterChange: (filters: Partial<PostDashboardFilters>) => void;
}

export function PostDashboardHeader({
  filters,
  onFilterChange,
}: PostDashboardHeaderProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  useEffect(() => {
    setSearchTerm(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        onFilterChange({ search: searchTerm, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, onFilterChange]);

  return (
    <div className="bg-card border-border flex flex-wrap items-center gap-3 rounded-xl border p-3">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("publish.dashboard.searchPlaceholder", "Tìm theo tiêu đề, nội dung...")}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-ring h-9 w-full rounded-md border pl-9 pr-3 text-xs focus:outline-none focus:ring-2"
        />
      </div>

      {/* Facebook-style Date Range Selector */}
      <PostDashboardDatePicker
        value={filters.dateRange}
        startDate={filters.startDate}
        endDate={filters.endDate}
        onChange={(val) =>
          onFilterChange({
            dateRange: val.dateRange,
            startDate: val.startDate,
            endDate: val.endDate,
            page: 1,
          })
        }
      />

      {/* Platform Selector */}
      <div className="flex items-center gap-1.5">
        <Filter className="text-muted-foreground size-4" />
        <select
          value={filters.platform}
          onChange={(e) =>
            onFilterChange({
              platform: e.target.value as PostDashboardFilters["platform"],
              page: 1,
            })
          }
          className="bg-background border-border text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:outline-none focus:ring-2 cursor-pointer"
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
        onChange={(e) =>
          onFilterChange({
            status: e.target.value as PostDashboardFilters["status"],
            page: 1,
          })
        }
        className="bg-background border-border text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:outline-none focus:ring-2 cursor-pointer"
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
