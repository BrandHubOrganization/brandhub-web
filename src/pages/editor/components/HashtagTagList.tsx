import { Button } from "@/components/ui/button";
import {
  formatPostHashtag,
  normalizePostHashtag,
} from "@/pages/editor/utils/postHashtag";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface HashtagTagListProps {
  hashtags: string[];
  onChange: (tags: string[]) => void;
}

export function HashtagTagList({ hashtags, onChange }: HashtagTagListProps) {
  const { t } = useTranslation();
  const prefix = "editor.hashtagInput.";

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {hashtags.map((tag) => (
        <span
          key={`${normalizePostHashtag(tag)}:${tag}`}
          className="border-brand-orange/20 bg-brand-orange-soft text-brand-orange inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold"
        >
          <span>{formatPostHashtag(tag)}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(hashtags.filter((item) => item !== tag))}
            aria-label={t(prefix + "removeTag", {
              tag: tag.replace(/^#/, ""),
            })}
            className="text-brand-orange/70 hover:text-brand-orange rounded-full"
          >
            <X className="size-3" />
          </Button>
        </span>
      ))}
    </div>
  );
}
