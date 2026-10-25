import React, { useEffect, useRef, useState } from "react";
import type {
  ContentRequestStatus,
  SocialPlatform,
} from "@/types/contentRequest";
import { Search, Calendar, RotateCcw, X, Share2, Video, Globe, AtSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

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

const STATUS_CONFIGS: {
  key: ContentRequestStatus;
  pillClass: string;
}[] = [
  {
    key: "SUBMITTED",
    pillClass: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
  {
    key: "ASSIGNED",
    pillClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
  },
  {
    key: "IN_PROGRESS",
    pillClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
  },
  {
    key: "PENDING_REVIEW",
    pillClass:
      "bg-brand-orange/10 text-brand-orange border-brand-orange/20 hover:bg-brand-orange/20",
  },
  {
    key: "SENT_TO_CLIENT",
    pillClass:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
  },
  {
    key: "APPROVED",
    pillClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  {
    key: "REJECTED",
    pillClass:
      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
];

const PLATFORM_ICONS: Record<
  SocialPlatform,
  { label: string; icon: React.ReactNode; activeClass: string }
> = {
  FACEBOOK: {
    label: "Facebook",
    icon: <Share2 className="size-3.5" />,
    activeClass: "bg-blue-600 text-white border-blue-600",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: <Globe className="size-3.5" />,
    activeClass: "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500",
  },
  TIKTOK: {
    label: "TikTok",
    icon: <Video className="size-3.5" />,
    activeClass: "bg-foreground text-background border-foreground",
  },
  THREADS: {
    label: "Threads",
    icon: <AtSign className="size-3.5" />,
    activeClass: "bg-foreground text-background border-foreground",
  },
};

const ALL_PLATFORMS: SocialPlatform[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
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
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

  // Phím tắt '/' để focus vào ô tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedPlatforms.length > 0 ||
    startDate !== "" ||
    endDate !== "" ||
    localSearch !== "";

  return (
    <div className="border-border bg-card space-y-3.5 rounded-xl border p-4 shadow-xs">
      {/* Search Input & Date Range & Reset */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t("requests.filterBar.searchPlaceholder")}
            className="focus:border-brand-orange focus:ring-brand-orange/20 border-border bg-muted/50 text-foreground placeholder-muted-foreground w-full rounded-xl border py-2 pr-12 pl-9 text-xs transition-colors focus:ring-2 focus:outline-hidden"
          />
          {localSearch ? (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              aria-label="Xóa tìm kiếm"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-0.5"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="border-border bg-card text-muted-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded border px-1.5 py-0.5 text-[10px] font-mono shadow-2xs">
              /
            </kbd>
          )}
        </div>

        {/* Date Range Picker & Reset */}
        <div className="flex items-center gap-2">
          <div className="border-border bg-muted/50 text-muted-foreground flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs">
            <Calendar className="text-muted-foreground size-3.5 shrink-0" />
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
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-muted-foreground hover:text-foreground h-8 cursor-pointer rounded-xl text-xs font-medium"
              title={t("requests.filterBar.resetFilter")}
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>{t("requests.filterBar.reset")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Multi-select Status Badges Filter */}
      <div className="border-border/60 flex flex-wrap items-center gap-1.5 border-t pt-3">
        <span className="text-2xs text-muted-foreground mr-1.5 font-bold tracking-wider uppercase">
          {t("requests.filterBar.statusLabel")}
        </span>
        {STATUS_CONFIGS.map(({ key, pillClass }) => {
          const isSelected = selectedStatuses.includes(key);
          return (
            <button
              type="button"
              key={key}
              onClick={() => onStatusToggle(key)}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? "border-foreground bg-foreground text-background font-semibold shadow-2xs scale-[1.02]"
                  : `${pillClass} border`
              }`}
            >
              {t(`requests.status.${key}`)}
            </button>
          );
        })}
      </div>

      {/* Multi-select Platform Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-2xs text-muted-foreground mr-1.5 font-bold tracking-wider uppercase">
          {t("requests.filterBar.platformLabel")}
        </span>
        {ALL_PLATFORMS.map((p) => {
          const isSelected = selectedPlatforms.includes(p);
          const pInfo = PLATFORM_ICONS[p];
          return (
            <button
              type="button"
              key={p}
              onClick={() => onPlatformToggle(p)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? `${pInfo.activeClass} font-semibold shadow-2xs scale-[1.02]`
                  : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {pInfo.icon}
              <span>{pInfo.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
