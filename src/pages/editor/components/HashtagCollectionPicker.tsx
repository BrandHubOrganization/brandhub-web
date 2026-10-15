import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HashtagEntry } from "@/pages/hashtag-groups/types/hashtag";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

interface HashtagCollectionPickerProps {
  entries: HashtagEntry[];
  isPending: boolean;
  isError: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onApply: (entry: HashtagEntry) => void;
}

export function HashtagCollectionPicker({
  entries,
  isPending,
  isError,
  search,
  onSearchChange,
  onApply,
}: HashtagCollectionPickerProps) {
  const { t } = useTranslation();
  const prefix = "editor.hashtagInput.";
  const collectionPrefix = "hashtagGroups.collection.";

  return (
    <div
      role="region"
      aria-label={t(prefix + "collectionTitle")}
      className="border-border bg-card max-h-56 space-y-1 overflow-y-auto rounded-xl border p-2"
    >
      <Input
        label={t(prefix + "searchCollection")}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t(prefix + "searchCollection")}
      />
      {isPending && (
        <p role="status" className="text-muted-foreground p-2 text-xs">
          {t(prefix + "collectionLoading")}
        </p>
      )}
      {isError && (
        <p role="alert" className="text-destructive p-2 text-xs">
          {t(prefix + "collectionError")}
        </p>
      )}
      {!isPending && !isError && entries.length === 0 && (
        <p
          role="status"
          aria-live="polite"
          className="text-muted-foreground p-2 text-xs"
        >
          {t(prefix + "collectionEmpty")}
        </p>
      )}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
        >
          <div className="min-w-0">
            <span className="font-mono text-xs">#{entry.tag}</span>
            <span className="text-muted-foreground text-2xs ml-2">
              {t(collectionPrefix + "purposes." + entry.purpose)}
            </span>
            {entry.isRequired && (
              <p className="text-muted-foreground text-2xs">
                {t(collectionPrefix + "campaignScope", {
                  id: entry.campaignId ?? "",
                })}
                . {t(prefix + "campaignTagUnavailable")}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={entry.isRequired}
            aria-label={
              entry.isRequired
                ? t(prefix + "campaignTagUnavailable")
                : t(prefix + "applyTag", { tag: entry.tag })
            }
            onClick={() => onApply(entry)}
            className="text-brand-orange hover:bg-brand-orange-soft rounded-md p-1.5 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
