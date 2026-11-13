import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApplyHashtagToPostButton } from "@/pages/hashtag-groups/components/ApplyHashtagToPostButton";
import type { HashtagEntry } from "@/pages/hashtag-groups/types/hashtag";
import type { MemberRole } from "@/types/workspace";
import { useTranslation } from "react-i18next";
import { Check, Clock, Copy, Cpu, Hash, Sparkles, TrendingUp } from "lucide-react";
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

  const formatRecordedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString(language || "vi-VN")} ${d.toLocaleTimeString(language || "vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="group relative flex flex-col justify-between space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-all duration-150 hover:border-brand-orange/50 hover:shadow-2xs"
        >
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                  <Hash className="size-4" />
                </span>
                <h3
                  className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-brand-orange"
                  title={`#${entry.tag}`}
                >
                  #{entry.tag}
                </h3>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground hover:bg-brand-orange/10 hover:text-brand-orange"
                onClick={() => handleCopy(entry.tag)}
                title="Sao chép hashtag"
              >
                {copiedTag === entry.tag ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Đã chép
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span className="text-[11px]">Sao chép</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-orange/10 px-2 py-0.5 text-xs font-semibold text-brand-orange">
                <TrendingUp className="size-3" />
                {t(prefix + "purposes." + entry.purpose, "Xu hướng")}
              </span>

              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3 text-brand-orange" />
                AI Trend Radar
              </span>

              {entry.campaignId && (
                <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground">
                  {campaignNames.get(entry.campaignId) ??
                    t(prefix + "campaignScope", { id: entry.campaignId })}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 border-t border-border/50 pt-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Cpu className="size-3 text-brand-orange" />
                <span>Hệ thống phân tích</span>
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="size-3" />
                <span>{formatRecordedDate(entry.createdAt)}</span>
              </span>
            </div>

            {role === "CREATOR" && (
              <div className="pt-1">
                <ApplyHashtagToPostButton
                  workspaceId={workspaceId}
                  tag={entry.tag}
                  isRequired={entry.isRequired}
                />
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
