import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { HashtagFilter } from "@/pages/hashtag-groups/types/hashtag";
import { hashtagPurposes } from "@/pages/hashtag-groups/types/hashtag";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

interface HashtagCollectionFiltersProps {
  filter: HashtagFilter;
  canAdd: boolean;
  isFetching: boolean;
  onFilterChange: (changes: Partial<HashtagFilter>) => void;
  onAdd: () => void;
}

export function HashtagCollectionFilters({
  filter,
  canAdd,
  isFetching,
  onFilterChange,
  onAdd,
}: HashtagCollectionFiltersProps) {
  const { t } = useTranslation();
  const prefix = "hashtagGroups.collection.";

  return (
    <div className="border-border bg-card flex flex-wrap items-end gap-3 rounded-xl border p-4">
      <div className="min-w-40 flex-1">
        <Input
          label={t(prefix + "search")}
          value={filter.q}
          maxLength={100}
          onChange={(event) => onFilterChange({ q: event.target.value })}
        />
      </div>
      <Select
        aria-label={t(prefix + "purpose")}
        wrapperClassName="w-full sm:w-40"
        value={filter.purpose}
        onChange={(event) => onFilterChange({ purpose: event.target.value })}
      >
        <option value="">{t(prefix + "all")}</option>
        {[...hashtagPurposes, "EVENT_SPECIFIC"].map((purpose) => (
          <option key={purpose} value={purpose}>
            {t(prefix + "purposes." + purpose)}
          </option>
        ))}
      </Select>
      <Select
        aria-label={t(prefix + "required")}
        wrapperClassName="w-full sm:w-40"
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
        <option value="">{t(prefix + "allRequirements")}</option>
        <option value="true">{t(prefix + "required")}</option>
        <option value="false">{t(prefix + "optional")}</option>
      </Select>
      <Button disabled={!canAdd || isFetching} onClick={onAdd}>
        <Plus className="size-4" />
        {t(prefix + "add")}
      </Button>
    </div>
  );
}
