import React, { useEffect, useState } from "react";
import type {
  ContentRequestStatus,
  SocialPlatform,
} from "@/types/contentRequest";
import { Search, Calendar, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ContentRequestFilterBarProps {
  searchQuery: string;
  selectedStatuses: ContentRequestStatus[];
  selectedPlatforms: SocialPlatform[];
  startDate: string;
  endDate: string;
  onSearchChange: (q: string) => void;
  onStatusToggle: (status: ContentRequestStatus) => void;
  onPlatformToggle: (platform: SocialPlatform) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onResetFilters: () => void;
}

const ALL_STATUSES: {
  key: ContentRequestStatus;
  colorClass: string;
}[] = [
  {
    key: "SUBMITTED",
    colorClass: "bg-zinc-100 text-zinc-700",
  },
  {
    key: "ASSIGNED",
    colorClass: "bg-brand-orange-soft text-brand-orange",
  },
  {
    key: "IN_PROGRESS",
    colorClass: "bg-amber-50 text-amber-700",
  },
  {
    key: "PENDING_REVIEW",
    colorClass: "bg-orange-50 text-orange-700",
  },
  {
    key: "SENT_TO_CLIENT",
    colorClass: "bg-purple-50 text-purple-700",
  },
  {
    key: "APPROVED",
    colorClass: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "REJECTED",
    colorClass: "bg-rose-50 text-rose-700",
  },
];

const ALL_PLATFORMS: SocialPlatform[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
  "YOUTUBE",
];

export const ContentRequestFilterBar: React.FC<
  ContentRequestFilterBarProps
> = ({
  searchQuery,
  selectedStatuses,
  selectedPlatforms,
  startDate,
  endDate,
  onSearchChange,
  onStatusToggle,
  onPlatformToggle,
  onStartDateChange,
  onEndDateChange,
  onResetFilters,
}) => {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search input by 300ms
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, onSearchChange]);

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedPlatforms.length > 0 ||
    startDate !== "" ||
    endDate !== "" ||
    localSearch !== "";

  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-4 shadow-xs">
      {/* Search Input & Reset Button */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t("requests.filterBar.searchPlaceholder")}
            className="focus:ring-brand-orange/20 border-border bg-muted text-foreground placeholder-muted-foreground w-full rounded-xl border py-2 pr-4 pl-9 text-xs focus:ring-2 focus:outline-hidden"
          />
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <div className="border-border bg-muted text-muted-foreground flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs">
            <Calendar className="text-muted-foreground size-3.5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="text-foreground cursor-pointer bg-transparent text-xs focus:outline-hidden"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="text-foreground cursor-pointer bg-transparent text-xs focus:outline-hidden"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
              title={t("requests.filterBar.resetFilter")}
            >
              <RotateCcw className="size-3.5" />
              <span>{t("requests.filterBar.reset")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-select Status Badges Filter */}
      <div className="border-border flex flex-wrap items-center gap-2 border-t pt-1">
        <span className="text-2xs text-muted-foreground mr-1 font-semibold tracking-wider uppercase">
          {t("requests.filterBar.statusLabel")}
        </span>
        {ALL_STATUSES.map(({ key, colorClass }) => {
          const isSelected = selectedStatuses.includes(key);
          return (
            <button
              key={key}
              onClick={() => onStatusToggle(key)}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? "border-zinc-900 bg-zinc-900 font-semibold text-white shadow-2xs dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : `${colorClass} border-transparent hover:opacity-80`
              }`}
            >
              {t(`requests.status.${key}`)}
            </button>
          );
        })}
      </div>

      {/* Multi-select Platform Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xs text-muted-foreground mr-1 font-semibold tracking-wider uppercase">
          {t("requests.filterBar.platformLabel")}
        </span>
        {ALL_PLATFORMS.map((p) => {
          const isSelected = selectedPlatforms.includes(p);
          return (
            <button
              key={p}
              onClick={() => onPlatformToggle(p)}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-xs font-medium transition-all ${
                isSelected
                  ? "border-brand-orange bg-brand-orange text-white shadow-2xs"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
};
