import type { ClientAnalyticsSummary } from "../types/client";
import { FileText, CheckCircle2, Zap, BarChart3 } from "lucide-react";

interface ClientAnalyticsCardsProps {
  analytics: ClientAnalyticsSummary;
}

export function ClientAnalyticsCards({ analytics }: ClientAnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="border-border bg-card space-y-1 rounded-xl border p-4">
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
          <FileText className="text-brand-orange size-3.5" /> Tổng số bài đăng
        </span>
        <span className="text-foreground text-xl font-bold">
          {analytics.totalPosts}
        </span>
      </div>

      <div className="border-border bg-card space-y-1 rounded-xl border p-4">
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
          <CheckCircle2 className="size-3.5 text-emerald-500" /> Đã xuất bản
        </span>
        <span className="text-foreground text-xl font-bold">
          {analytics.publishedPosts}
        </span>
      </div>

      <div className="border-border bg-card space-y-1 rounded-xl border p-4">
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
          <Zap className="size-3.5 text-amber-500" /> Yêu cầu chờ xử lý
        </span>
        <span className="text-foreground text-xl font-bold">
          {analytics.activeRequests}
        </span>
      </div>

      <div className="border-border bg-card space-y-1 rounded-xl border p-4">
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
          <BarChart3 className="text-brand-orange size-3.5" /> Tương tác trung
          bình
        </span>
        <span className="text-foreground text-xl font-bold">
          {analytics.engagementRate}%
        </span>
      </div>
    </div>
  );
}
