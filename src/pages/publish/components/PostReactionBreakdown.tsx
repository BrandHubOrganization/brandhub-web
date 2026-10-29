import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { ThumbsUp, Heart, Laugh, Sparkles, Frown, Flame } from "lucide-react";
import type { ReactionBreakdown } from "@/pages/publish/types/postDetail";

interface PostReactionBreakdownProps {
  breakdown: ReactionBreakdown;
}

interface ReactionConfigItem {
  type: keyof ReactionBreakdown;
  labelKey: string;
  defaultLabel: string;
  icon: ComponentType<{ className?: string }>;
  activeIconClass: string;
  barClassName: string;
}

const REACTION_ITEMS: ReactionConfigItem[] = [
  {
    type: "LIKE",
    labelKey: "publish.detail.metrics.reactions.like",
    defaultLabel: "Thích",
    icon: ThumbsUp,
    activeIconClass: "text-brand-orange",
    barClassName: "bg-brand-orange",
  },
  {
    type: "LOVE",
    labelKey: "publish.detail.metrics.reactions.love",
    defaultLabel: "Yêu thích",
    icon: Heart,
    activeIconClass: "text-rose-500",
    barClassName: "bg-rose-500",
  },
  {
    type: "HAHA",
    labelKey: "publish.detail.metrics.reactions.haha",
    defaultLabel: "Haha",
    icon: Laugh,
    activeIconClass: "text-amber-500",
    barClassName: "bg-amber-500",
  },
  {
    type: "WOW",
    labelKey: "publish.detail.metrics.reactions.wow",
    defaultLabel: "Wow",
    icon: Sparkles,
    activeIconClass: "text-amber-500",
    barClassName: "bg-amber-400",
  },
  {
    type: "SAD",
    labelKey: "publish.detail.metrics.reactions.sad",
    defaultLabel: "Buồn",
    icon: Frown,
    activeIconClass: "text-muted-foreground",
    barClassName: "bg-muted-foreground/60",
  },
  {
    type: "ANGRY",
    labelKey: "publish.detail.metrics.reactions.angry",
    defaultLabel: "Phẫn nộ",
    icon: Flame,
    activeIconClass: "text-destructive",
    barClassName: "bg-destructive",
  },
];

function ReactionBentoCell({
  item,
  count,
  total,
}: {
  item: ReactionConfigItem;
  count: number;
  total: number;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const isActive = count > 0;

  return (
    <div
      className={`group flex items-center justify-between gap-2 px-4 py-3 transition-colors duration-500 ${
        isActive ? "text-foreground" : "text-muted-foreground/45"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={`size-4 shrink-0 transition-transform duration-500 ease-out group-hover:scale-110 ${
            isActive ? item.activeIconClass : ""
          }`}
        />
        <span className="text-xs font-medium">
          {t(item.labelKey, item.defaultLabel)}
        </span>
      </div>
      <div className="flex items-baseline gap-1 font-mono tabular-nums">
        <span className="text-sm font-bold">
          {count.toLocaleString("vi-VN")}
        </span>
        {isActive && (
          <span className="text-muted-foreground text-2xs">{pct}%</span>
        )}
      </div>
    </div>
  );
}

export function PostReactionBreakdown({
  breakdown,
}: PostReactionBreakdownProps) {
  const { t } = useTranslation();
  const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border">
      <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-3">
        <span className="text-foreground text-xs font-semibold">
          {t(
            "publish.detail.metrics.reactionBreakdown",
            "Phân bổ cảm xúc thực tế",
          )}
        </span>
        {total > 0 && (
          <div className="bg-muted flex h-2 max-w-sm flex-1 overflow-hidden rounded-full">
            {REACTION_ITEMS.map((item) => {
              const count = breakdown[item.type] ?? 0;
              return count > 0 ? (
                <div
                  key={item.type}
                  style={{ width: `${(count / total) * 100}%` }}
                  className={`${item.barClassName} transition-all duration-700 ease-out`}
                />
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="divide-border grid grid-flow-dense grid-cols-2 divide-x divide-y sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {REACTION_ITEMS.map((item) => (
          <ReactionBentoCell
            key={item.type}
            item={item}
            count={breakdown[item.type] ?? 0}
            total={total}
          />
        ))}
      </div>
    </div>
  );
}
