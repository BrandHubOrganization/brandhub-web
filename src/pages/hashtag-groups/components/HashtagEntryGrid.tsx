import { useState } from "react";
import { ApplyHashtagToPostButton } from "@/pages/hashtag-groups/components/ApplyHashtagToPostButton";
import type { HashtagEntry } from "@/pages/hashtag-groups/types/hashtag";
import type { MemberRole } from "@/types/workspace";
import { useTranslation } from "react-i18next";
import { Check, Clock, Copy, Hash, Megaphone, Sparkles, Tag, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface HashtagEntryGridProps {
  entries: HashtagEntry[];
  workspaceId: string;
  userId: string;
  role: MemberRole | null;
  campaignNames: Map<string, string>;
  language: string;
  onRemove?: (entry: HashtagEntry) => void;
  onEdit?: (entry: HashtagEntry) => void;
}

const purposeConfig: Record<string, { icon: typeof TrendingUp; label: string; color: string }> = {
  TRENDING: { icon: TrendingUp, label: "Xu hướng", color: "bg-brand-orange/10 text-brand-orange" },
  BRAND: { icon: Tag, label: "Thương hiệu", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  CAMPAIGN: { icon: Megaphone, label: "Chiến dịch", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  EVENT_SPECIFIC: { icon: Sparkles, label: "Sự kiện", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

export function HashtagEntryGrid({
  entries,
  workspaceId,
  role,
  campaignNames,
  language,
}: HashtagEntryGridProps) {
  const { t } = useTranslation();
  const prefix = "hashtagGroups.collection.";
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleCopy = (tag: string) => {
    void navigator.clipboard.writeText(`#${tag}`);
    setCopiedTag(tag);
    toast.success(`Đã sao chép #${tag}`);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const formatRelativeDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffDays === 0) return "Hôm nay";
      if (diffDays === 1) return "Hôm qua";
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return d.toLocaleDateString(language || "vi-VN", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => {
        const cfg = purposeConfig[entry.purpose] ?? purposeConfig.TRENDING;
        const PurposeIcon = cfg.icon;

        return (
          <article
            key={entry.id}
            onClick={() => handleCopy(entry.tag)}
            className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3.5 shadow-xs transition-all duration-150 hover:border-brand-orange/50 hover:shadow-2xs ${
              copiedTag === entry.tag ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" : ""
            }`}
          >
            {/* Hash icon */}
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange transition-colors group-hover:bg-brand-orange group-hover:text-white">
              <Hash className="size-4.5" />
            </span>

            {/* Content */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3
                  className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-brand-orange"
                  title={`#${entry.tag}`}
                >
                  #{entry.tag}
                </h3>
                {copiedTag === entry.tag && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3" />
                    Đã chép
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
                  <PurposeIcon className="size-3" />
                  {t(prefix + "purposes." + entry.purpose, cfg.label)}
                </span>
                {entry.campaignId && (
                  <span className="truncate text-[11px] text-muted-foreground">
                    {campaignNames.get(entry.campaignId) ??
                      t(prefix + "campaignScope", { id: entry.campaignId })}
                  </span>
                )}
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground/70">
                  <Clock className="size-3" />
                  {formatRelativeDate(entry.createdAt)}
                </span>
              </div>
            </div>

            {/* Copy icon (subtle) */}
            <Copy className="size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-brand-orange" />

            {role === "CREATOR" && (
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <ApplyHashtagToPostButton
                  workspaceId={workspaceId}
                  tag={entry.tag}
                  isRequired={entry.isRequired}
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
