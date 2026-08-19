import {
  FileText,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { AnalyticsOverview } from "@/types/analytics";

interface KpiCardsSectionProps {
  data: AnalyticsOverview | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function KpiCardsSection({
  data,
  isLoading,
  isError,
  onRetry,
}: KpiCardsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-border bg-card space-y-3 rounded-xl border p-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-5 text-center">
        <div className="text-destructive flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="size-4" />
          <span>Không thể tải dữ liệu KPI Analytics</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="cursor-pointer gap-2 text-xs"
        >
          <RefreshCw className="size-3.5" /> Thử lại
        </Button>
      </div>
    );
  }

  const cards = [
    {
      title: "Tổng số bài đăng (Tháng này)",
      value: data.totalPosts.toLocaleString("vi-VN"),
      change: "+12.4% so với tháng trước",
      icon: FileText,
      iconBg: "bg-brand-orange/10 text-brand-orange",
      accentColor: "border-l-brand-orange",
    },
    {
      title: "Đã xuất bản thành công",
      value: data.publishedCount.toLocaleString("vi-VN"),
      change: "+8.2% đúng tiến độ",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-500",
      accentColor: "border-l-emerald-500",
    },
    {
      title: "Bài đăng thất bại",
      value: data.failedCount.toLocaleString("vi-VN"),
      change: "-2 bài so với tuần trước",
      icon: XCircle,
      iconBg: "bg-rose-500/10 text-rose-500",
      accentColor: "border-l-rose-500",
    },
    {
      title: "Tỷ lệ thành công",
      value: `${data.successRate}%`,
      change: "Đạt mục tiêu hệ thống",
      icon: TrendingUp,
      iconBg: "bg-[#f05a28]/10 text-[#f05a28]",
      accentColor: "border-l-[#f05a28]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`group border-border bg-card relative overflow-hidden rounded-xl border border-l-4 p-5 transition-all duration-200 hover:shadow-md ${card.accentColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {card.title}
              </span>
              <div
                className={`flex size-9 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <Icon className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {card.value}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-2xs">
              {card.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
