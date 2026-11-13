import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { HashtagFilter } from "@/pages/hashtag-groups/types/hashtag";
import { hashtagPurposes } from "@/pages/hashtag-groups/types/hashtag";
import { useTranslation } from "react-i18next";
import { Search, Sparkles, TrendingUp } from "lucide-react";

interface HashtagCollectionFiltersProps {
  filter: HashtagFilter;
  canAdd?: boolean;
  isFetching?: boolean;
  onFilterChange: (changes: Partial<HashtagFilter>) => void;
  onAdd?: () => void;
}

export function HashtagCollectionFilters({
  filter,
  onFilterChange,
}: HashtagCollectionFiltersProps) {
  const { t } = useTranslation();
  const prefix = "hashtagGroups.collection.";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">
              Hashtag Xu Hướng Phân Tích
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Từ khóa thịnh hành được hệ thống AI quét và phân tích tự động từ mạng xã hội
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="size-3 text-brand-orange" />
          <span>Tự động cập nhật theo trend</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-44 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter.q}
            maxLength={100}
            placeholder="Tìm kiếm hashtag xu hướng..."
            className="h-9 rounded-lg bg-background pl-9 text-xs focus-visible:ring-1 focus-visible:ring-brand-orange/60"
            onChange={(event) => onFilterChange({ q: event.target.value })}
          />
        </div>

        <Select
          aria-label={t(prefix + "purpose", "Mục đích")}
          wrapperClassName="w-full sm:w-44"
          className="h-9 rounded-lg bg-background text-xs"
          value={filter.purpose}
          onChange={(event) => onFilterChange({ purpose: event.target.value })}
        >
          <option value="">{t(prefix + "all", "Tất cả mục đích")}</option>
          {[...hashtagPurposes, "EVENT_SPECIFIC"].map((purpose) => (
            <option key={purpose} value={purpose}>
              {t(prefix + "purposes." + purpose, purpose)}
            </option>
          ))}
        </Select>

        <Select
          aria-label={t(prefix + "required", "Phân loại")}
          wrapperClassName="w-full sm:w-40"
          className="h-9 rounded-lg bg-background text-xs"
          value={filter.isRequired === undefined ? "" : String(filter.isRequired)}
          onChange={(event) =>
            onFilterChange({
              isRequired:
                event.target.value === ""
                  ? undefined
                  : event.target.value === "true",
            })
          }
        >
          <option value="">{t(prefix + "allRequirements", "Tất cả phân loại")}</option>
          <option value="true">{t(prefix + "required", "Bắt buộc")}</option>
          <option value="false">{t(prefix + "optional", "Tùy chọn")}</option>
        </Select>
      </div>
    </div>
  );
}
