import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Eye,
  Users,
  MousePointerClick,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostReactionBreakdown } from "@/pages/publish/components/PostReactionBreakdown";
import type { PostEngagementMetrics } from "@/pages/publish/types/postDetail";

interface PostEngagementCardsProps {
  metrics: PostEngagementMetrics;
  onRefreshMetrics: () => void;
  isRefreshing: boolean;
}

interface BentoMetricItem {
  key: string;
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  spanClass: string;
  isPrimary?: boolean;
}

function BentoMetricTile({ item }: { item: BentoMetricItem }) {
  const Icon = item.icon;
  if (item.isPrimary) {
    return (
      <div
        className={`bg-card border-border group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-700 ease-out ${item.spanClass}`}
      >
        <div className="bg-brand-orange/10 pointer-events-none absolute -right-12 -bottom-12 size-44 rounded-full blur-2xl transition-transform duration-700 ease-out group-hover:scale-125" />
        <div className="relative flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-semibold">
            {item.label}
          </span>
          <span className="bg-brand-orange-soft text-brand-orange flex size-9 items-center justify-center rounded-xl">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="relative mt-6">
          <span className="text-foreground font-mono text-4xl font-bold tracking-tighter tabular-nums sm:text-5xl">
            {item.value.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border-border group hover:border-foreground/20 flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-700 ease-out ${item.spanClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground truncate text-xs font-medium">
          {item.label}
        </span>
        <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-500 ease-out group-hover:scale-105">
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="mt-4">
        <span className="text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums">
          {item.value.toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  );
}

function buildBentoItems(
  metrics: PostEngagementMetrics,
  t: (key: string, fallback: string) => string,
): BentoMetricItem[] {
  const hasReach = metrics.reach > 0;
  const items: BentoMetricItem[] = [
    {
      key: "likes",
      label: t("publish.detail.metrics.likes", "Lượt cảm xúc"),
      value: metrics.likes,
      icon: ThumbsUp,
      spanClass: "col-span-2 sm:col-span-6 lg:col-span-4 lg:row-span-2",
      isPrimary: true,
    },
    {
      key: "comments",
      label: t("publish.detail.metrics.comments", "Bình luận"),
      value: metrics.comments,
      icon: MessageSquare,
      spanClass: "col-span-1 sm:col-span-3 lg:col-span-4",
    },
    {
      key: "shares",
      label: t("publish.detail.metrics.shares", "Chia sẻ"),
      value: metrics.shares,
      icon: Share2,
      spanClass: "col-span-1 sm:col-span-3 lg:col-span-4",
    },
    {
      key: "impressions",
      label: t("publish.detail.metrics.impressions", "Hiển thị"),
      value: metrics.impressions,
      icon: Eye,
      spanClass: hasReach
        ? "col-span-1 sm:col-span-2 lg:col-span-3"
        : "col-span-1 sm:col-span-3 lg:col-span-4",
    },
  ];
  if (hasReach) {
    items.push({
      key: "reach",
      label: t("publish.detail.metrics.reach", "Tiếp cận"),
      value: metrics.reach,
      icon: Users,
      spanClass: "col-span-1 sm:col-span-2 lg:col-span-3",
    });
  }
  items.push({
    key: "clicks",
    label: t("publish.detail.metrics.clicks", "Lượt nhấp"),
    value: metrics.clicks,
    icon: MousePointerClick,
    spanClass: hasReach
      ? "col-span-2 sm:col-span-2 lg:col-span-2"
      : "col-span-1 sm:col-span-3 lg:col-span-4",
  });
  return items;
}

export function PostEngagementCards({
  metrics,
  onRefreshMetrics,
  isRefreshing,
}: PostEngagementCardsProps) {
  const { t } = useTranslation();
  const bentoItems = buildBentoItems(metrics, (key, fallback) =>
    t(key, fallback),
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-foreground text-base font-bold tracking-tight">
            {t("publish.detail.metrics.title", "Hiệu suất tương tác thực tế")}
          </h2>
          <span className="text-muted-foreground text-2xs flex items-center gap-1">
            <Clock className="size-3" />
            {t("publish.detail.metrics.lastSynced", "Cập nhật lần cuối: ")}
            <span className="font-mono tabular-nums">
              {new Date(metrics.lastSyncedAt).toLocaleTimeString("vi-VN")}
            </span>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshMetrics}
          disabled={isRefreshing}
          className="gap-1.5 text-xs"
        >
          <RefreshCw
            className={`size-3.5 ${isRefreshing ? "text-brand-orange animate-spin" : ""}`}
          />
          {t("publish.detail.metrics.syncNow", "Đồng bộ số liệu")}
        </Button>
      </div>

      <div className="grid grid-flow-dense grid-cols-2 gap-3 sm:grid-cols-6 lg:grid-cols-12">
        {bentoItems.map((item) => (
          <BentoMetricTile key={item.key} item={item} />
        ))}
        {metrics.reactionBreakdown && (
          <div className="col-span-2 sm:col-span-6 lg:col-span-12">
            <PostReactionBreakdown breakdown={metrics.reactionBreakdown} />
          </div>
        )}
      </div>
    </section>
  );
}
