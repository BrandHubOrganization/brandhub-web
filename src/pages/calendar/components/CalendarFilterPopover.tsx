import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileEdit,
  Filter,
  RotateCcw,
  Share2,
  XCircle,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaThreads } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PlatformType, PostStatus } from "@/types/calendar";

export interface CalendarFilterPopoverProps {
  selectedPlatforms: PlatformType[];
  onChangePlatforms: (platforms: PlatformType[]) => void;
  selectedStatuses: PostStatus[];
  onChangeStatuses: (statuses: PostStatus[]) => void;
  onResetFilters: () => void;
  className?: string;
}

const ALL_PLATFORMS: PlatformType[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
];
const ALL_STATUSES: PostStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "FAILED",
];

const PLATFORM_OPTIONS = [
  {
    id: "FACEBOOK" as const,
    label: "Facebook",
    icon: <FaFacebook className="size-3.5 text-[#1877F2]" />,
  },
  {
    id: "INSTAGRAM" as const,
    label: "Instagram",
    icon: <FaInstagram className="size-3.5 text-[#E1306C]" />,
  },
  {
    id: "TIKTOK" as const,
    label: "TikTok",
    icon: <FaTiktok className="text-foreground size-3.5" />,
  },
  {
    id: "THREADS" as const,
    label: "Threads",
    icon: <FaThreads className="text-foreground size-3.5" />,
  },
];

const STATUS_CONFIGS: {
  id: PostStatus;
  labelKey: string;
  defaultLabel: string;
  icon: React.ReactNode;
  badgeClass: string;
}[] = [
  {
    id: "DRAFT",
    labelKey: "publish.status.DRAFT",
    defaultLabel: "Bản nháp",
    icon: <FileEdit className="size-3.5 text-amber-600 dark:text-amber-400" />,
    badgeClass:
      "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/20",
  },
  {
    id: "SCHEDULED",
    labelKey: "publish.status.SCHEDULED",
    defaultLabel: "Đã lên lịch",
    icon: <Clock className="size-3.5 text-blue-600 dark:text-blue-400" />,
    badgeClass:
      "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20",
  },
  {
    id: "PUBLISHED",
    labelKey: "publish.status.PUBLISHED",
    defaultLabel: "Đã đăng",
    icon: (
      <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
    ),
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20",
  },
  {
    id: "FAILED",
    labelKey: "publish.status.FAILED",
    defaultLabel: "Thất bại",
    icon: <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />,
    badgeClass:
      "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/20",
  },
];

function FilterOptionRow({
  label,
  icon,
  badgeClass,
  isSelected,
  onToggle,
}: {
  label: string;
  icon: React.ReactNode;
  badgeClass?: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="hover:bg-muted/60 flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 transition-colors select-none active:scale-[0.98]"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon}
        {badgeClass ? (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium",
              badgeClass,
            )}
          >
            {label}
          </span>
        ) : (
          <span className="text-foreground truncate text-xs font-medium">
            {label}
          </span>
        )}
      </div>
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          isSelected
            ? "border-brand-orange bg-brand-orange text-white"
            : "border-border bg-background",
        )}
      >
        {isSelected && <Check className="size-3 stroke-[3]" />}
      </div>
    </div>
  );
}

export function CalendarFilterPopover({
  selectedPlatforms,
  onChangePlatforms,
  selectedStatuses,
  onChangeStatuses,
  onResetFilters,
  className,
}: CalendarFilterPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"platform" | "status">(
    "platform",
  );

  const isAllPlatforms = selectedPlatforms.length === ALL_PLATFORMS.length;
  const isAllStatuses = selectedStatuses.length === ALL_STATUSES.length;
  const hasActiveFilters = !isAllPlatforms || !isAllStatuses;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!isAllPlatforms) count += selectedPlatforms.length || 1;
    if (!isAllStatuses) count += selectedStatuses.length || 1;
    return count;
  }, [
    isAllPlatforms,
    isAllStatuses,
    selectedPlatforms.length,
    selectedStatuses.length,
  ]);

  const categories = useMemo(
    () => [
      {
        id: "platform" as const,
        label: t("calendar.filterPopover.platformCategory", {
          defaultValue: "Nền tảng",
        }),
        icon: <Share2 className="size-3.5" />,
        count: isAllPlatforms ? 0 : selectedPlatforms.length,
      },
      {
        id: "status" as const,
        label: t("calendar.filterPopover.statusCategory", {
          defaultValue: "Trạng thái",
        }),
        icon: <CheckSquare className="size-3.5" />,
        count: isAllStatuses ? 0 : selectedStatuses.length,
      },
    ],
    [
      t,
      isAllPlatforms,
      isAllStatuses,
      selectedPlatforms.length,
      selectedStatuses.length,
    ],
  );

  const togglePlatform = (id: PlatformType) => {
    onChangePlatforms(
      selectedPlatforms.includes(id)
        ? selectedPlatforms.filter((p) => p !== id)
        : [...selectedPlatforms, id],
    );
  };

  const toggleStatus = (id: PostStatus) => {
    onChangeStatuses(
      selectedStatuses.includes(id)
        ? selectedStatuses.filter((s) => s !== id)
        : [...selectedStatuses, id],
    );
  };

  const isCurrentAllSelected =
    activeCategory === "platform" ? isAllPlatforms : isAllStatuses;

  const handleToggleAll = () => {
    if (activeCategory === "platform") {
      onChangePlatforms(isAllPlatforms ? [] : ALL_PLATFORMS);
    } else {
      onChangeStatuses(isAllStatuses ? [] : ALL_STATUSES);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-border bg-card text-foreground hover:bg-muted h-8 cursor-pointer gap-1.5 rounded-lg px-2.5 text-xs font-medium shadow-2xs transition-all active:scale-[0.97]",
            hasActiveFilters &&
              "border-brand-orange/50 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/15 font-semibold",
            className,
          )}
        >
          <Filter className="size-3.5" />
          <span>
            {t("calendar.filterPopover.title", { defaultValue: "Bộ lọc" })}
          </span>
          {hasActiveFilters && (
            <span className="bg-brand-orange flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={16}
        avoidCollisions={true}
        className="border-border bg-card w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl p-0 shadow-xl sm:w-[350px]"
      >
        <div className="divide-border grid min-h-[220px] grid-cols-[120px_minmax(0,1fr)] divide-x sm:grid-cols-[130px_minmax(0,1fr)]">
          {/* Cột trái: Sidebar danh mục */}
          <div className="bg-muted/20 flex flex-col justify-between">
            <div className="flex flex-col space-y-0.5 py-1.5">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "group flex w-full cursor-pointer items-center justify-between border-y-0 border-r-0 border-l-2 px-3 py-2.5 text-left text-xs transition-colors select-none",
                      isActive
                        ? "border-l-brand-orange bg-muted/60 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border-l-transparent font-normal",
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {cat.icon}
                      <span className="truncate">{cat.label}</span>
                    </div>
                    {cat.count > 0 && (
                      <span className="bg-brand-orange inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dưới cùng cột trái: Nút Đặt lại */}
            <div className="border-border border-t p-1.5">
              <button
                type="button"
                onClick={onResetFilters}
                disabled={!hasActiveFilters}
                className={cn(
                  "flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-xs transition-colors select-none",
                  hasActiveFilters
                    ? "text-muted-foreground hover:text-brand-orange hover:bg-muted/40 cursor-pointer font-medium"
                    : "text-muted-foreground/40 cursor-not-allowed",
                )}
              >
                <RotateCcw className="size-3" />
                <span>
                  {t("calendar.filterPopover.reset", {
                    defaultValue: "Đặt lại",
                  })}
                </span>
              </button>
            </div>
          </div>

          {/* Cột phải: Options cho danh mục đang chọn */}
          <div className="flex min-w-0 flex-col justify-between">
            <div>
              <div className="border-border bg-card flex items-center justify-between border-b px-3.5 py-2.5">
                <span className="text-foreground text-xs font-semibold">
                  {activeCategory === "platform"
                    ? t("calendar.filterPopover.platformCategory", {
                        defaultValue: "Nền tảng",
                      })
                    : t("calendar.filterPopover.statusCategory", {
                        defaultValue: "Trạng thái",
                      })}
                </span>
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="text-brand-orange cursor-pointer text-xs font-semibold hover:underline"
                >
                  {isCurrentAllSelected
                    ? t("calendar.filterPopover.deselectAll", {
                        defaultValue: "Bỏ chọn tất cả",
                      })
                    : t("calendar.filterPopover.selectAll", {
                        defaultValue: "Chọn tất cả",
                      })}
                </button>
              </div>

              {/* Danh sách lựa chọn Checkbox */}
              <div className="max-h-[240px] space-y-1 overflow-y-auto p-2">
                {activeCategory === "platform"
                  ? PLATFORM_OPTIONS.map((opt) => (
                      <FilterOptionRow
                        key={opt.id}
                        label={opt.label}
                        icon={opt.icon}
                        isSelected={selectedPlatforms.includes(opt.id)}
                        onToggle={() => togglePlatform(opt.id)}
                      />
                    ))
                  : STATUS_CONFIGS.map((opt) => (
                      <FilterOptionRow
                        key={opt.id}
                        label={t(opt.labelKey, {
                          defaultValue: opt.defaultLabel,
                        })}
                        icon={opt.icon}
                        badgeClass={opt.badgeClass}
                        isSelected={selectedStatuses.includes(opt.id)}
                        onToggle={() => toggleStatus(opt.id)}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
