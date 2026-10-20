import { useTranslation } from "react-i18next";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  TrendingUp,
  MousePointerClick,
  Users,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PostEngagementMetrics } from "../types/postDetail";

interface PostEngagementCardsProps {
  metrics: PostEngagementMetrics;
  onRefreshMetrics: () => void;
  isRefreshing: boolean;
}

export function PostEngagementCards({
  metrics,
  onRefreshMetrics,
  isRefreshing,
}: PostEngagementCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-sm font-bold">
            {t("publish.detail.metrics.title", "Hiệu suất tương tác thực tế")}
          </h2>
          <p className="text-muted-foreground text-2xs mt-0.5 flex items-center gap-1">
            <Clock className="size-3" />
            {t("publish.detail.metrics.lastSynced", "Cập nhật lần cuối: ")}
            <span className="font-mono">
              {new Date(metrics.lastSyncedAt).toLocaleTimeString("vi-VN")}
            </span>
          </p>
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* 1. Reactions / Likes */}
        <div className="bg-card border-border rounded-xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-2xs font-medium">Lượt thích</span>
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 flex size-7 items-center justify-center rounded-lg">
              <ThumbsUp className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-foreground font-mono text-xl font-bold">
              {metrics.likes.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>

        {/* 2. Comments */}
        <div className="bg-card border-border rounded-xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-2xs font-medium">Bình luận</span>
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-7 items-center justify-center rounded-lg">
              <MessageSquare className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-foreground font-mono text-xl font-bold">
              {metrics.comments.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>

        {/* 3. Shares */}
        <div className="bg-card border-border rounded-xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-2xs font-medium">Chia sẻ</span>
            <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 flex size-7 items-center justify-center rounded-lg">
              <Share2 className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-foreground font-mono text-xl font-bold">
              {metrics.shares.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>

        {/* 4. Reach */}
        <div className="bg-card border-border rounded-xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-2xs font-medium">Tiếp cận</span>
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex size-7 items-center justify-center rounded-lg">
              <Users className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-foreground font-mono text-xl font-bold">
              {metrics.reach.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>

        {/* 5. Clicks */}
        <div className="bg-card border-border rounded-xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-2xs font-medium">Lượt nhấp</span>
            <div className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex size-7 items-center justify-center rounded-lg">
              <MousePointerClick className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-foreground font-mono text-xl font-bold">
              {metrics.clicks.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>

        {/* 6. Engagement Rate */}
        <div className="bg-card border-border rounded-xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-2xs font-medium">Tỷ lệ tương tác</span>
            <div className="bg-brand-orange-soft text-brand-orange flex size-7 items-center justify-center rounded-lg">
              <TrendingUp className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-foreground font-mono text-xl font-bold">
              {metrics.engagementRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
