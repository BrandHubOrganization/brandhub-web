import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Check, Copy, FolderKanban, Hash } from "lucide-react";

interface HashtagInputToolbarProps {
  count: number;
  copied: boolean;
  showCollection: boolean;
  canLoadCollection: boolean;
  onCopyAll: () => void;
  onClear: () => void;
  onToggleCollection: () => void;
}

export function HashtagInputToolbar({
  count,
  copied,
  showCollection,
  canLoadCollection,
  onCopyAll,
  onClear,
  onToggleCollection,
}: HashtagInputToolbarProps) {
  const { t } = useTranslation();
  const prefix = "editor.hashtagInput.";

  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
        <Hash className="text-brand-orange size-3.5" />
        {t(prefix + "label", { count })}
      </label>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {count > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCopyAll}
            className="hover:text-brand-orange text-2xs text-muted-foreground flex items-center gap-1 px-2 py-0.5 font-medium transition-colors"
          >
            {copied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3" />
            )}
            <span>
              {copied ? t(prefix + "copied") : t(prefix + "copyAllButton")}
            </span>
          </Button>
        )}
        {count > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-2xs font-medium text-rose-500 hover:underline"
          >
            {t(prefix + "clearAllButton")}
          </Button>
        )}
        {canLoadCollection && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={showCollection}
            onClick={onToggleCollection}
            className="text-brand-orange bg-brand-orange-soft hover:bg-brand-orange/20 text-2xs flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors"
          >
            <FolderKanban className="size-3.5" />
            {t(prefix + "loadFromCollectionButton")}
          </Button>
        )}
      </div>
    </div>
  );
}
