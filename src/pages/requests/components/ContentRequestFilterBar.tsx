import React, { useEffect, useState } from "react";
import type {
  ContentRequestStatus,
  SocialPlatform,
} from "@/types/contentRequest";
import { Search, Calendar, RotateCcw } from "lucide-react";

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
  label: string;
  colorClass: string;
}[] = [
  {
    key: "SUBMITTED",
    label: "Submitted",
    colorClass: "bg-zinc-100 text-zinc-700",
  },
  {
    key: "ASSIGNED",
    label: "Assigned",
    colorClass: "bg-brand-orange-soft text-brand-orange",
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
    colorClass: "bg-amber-50 text-amber-700",
  },
  {
    key: "PENDING_REVIEW",
    label: "Pending Review",
    colorClass: "bg-orange-50 text-orange-700",
  },
  {
    key: "SENT_TO_CLIENT",
    label: "Sent To Client",
    colorClass: "bg-purple-50 text-purple-700",
  },
  {
    key: "APPROVED",
    label: "Approved",
    colorClass: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "REJECTED",
    label: "Rejected",
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
    <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      {/* Search Input & Reset Button */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm kiếm chủ đề, tên khách hàng..."
            className="focus:ring-brand-orange/20 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pr-4 pl-9 text-xs text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:outline-hidden dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:text-zinc-100"
          />
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:text-zinc-300">
            <Calendar className="size-3.5 text-zinc-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="cursor-pointer bg-transparent text-xs text-zinc-800 focus:outline-hidden dark:text-zinc-200"
            />
            <span className="text-zinc-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="cursor-pointer bg-transparent text-xs text-zinc-800 focus:outline-hidden dark:text-zinc-200"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-select Status Badges Filter */}
      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-1 dark:border-zinc-800/80">
        <span className="mr-1 text-2xs font-semibold tracking-wider text-zinc-400 uppercase">
          Status:
        </span>
        {ALL_STATUSES.map(({ key, label, colorClass }) => {
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
              {label}
            </button>
          );
        })}
      </div>

      {/* Multi-select Platform Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-2xs font-semibold tracking-wider text-zinc-400 uppercase">
          Platform:
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
                  : "border-zinc-200/80 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-400"
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
