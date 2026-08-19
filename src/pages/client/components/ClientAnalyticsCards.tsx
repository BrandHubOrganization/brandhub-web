import type { ClientAnalyticsSummary } from "../types/client";
import { FileText, CheckCircle2, Zap, BarChart3 } from "lucide-react";

interface ClientAnalyticsCardsProps {
  analytics: ClientAnalyticsSummary;
}

export function ClientAnalyticsCards({ analytics }: ClientAnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <FileText className="size-3.5 text-brand-orange" /> Tổng số bài đăng
        </span>
        <span className="text-xl font-bold text-foreground">{analytics.totalPosts}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="size-3.5 text-emerald-500" /> Đã xuất bản
        </span>
        <span className="text-xl font-bold text-foreground">{analytics.publishedPosts}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <Zap className="size-3.5 text-amber-500" /> Yêu cầu chờ xử lý
        </span>
        <span className="text-xl font-bold text-foreground">{analytics.activeRequests}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <BarChart3 className="size-3.5 text-brand-orange" /> Tương tác trung bình
        </span>
        <span className="text-xl font-bold text-foreground">{analytics.engagementRate}%</span>
      </div>
    </div>
  );
}
