import { useTranslation } from "react-i18next";
import type { ClientAnalyticsSummary } from "../types/client";
import { FileText, CheckCircle2, Zap, BarChart3 } from "lucide-react";

interface ClientAnalyticsCardsProps {
  analytics: ClientAnalyticsSummary;
}

export function ClientAnalyticsCards({ analytics }: ClientAnalyticsCardsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="border-border bg-card space-y-1 rounded-xl border p-4">
        <span className="text-muted-foreground text-2xs flex items-center gap-1 font-medium">
          <FileText className="text-brand-orange size-3.5" />{" "}
          {t("client.analytics.totalPosts")}
        </span>
        <span className="text-foreground text-xl font-bold">
          {analytics.totalPosts}
        </span>
      </div>

      <div className="border-border bg-card space-y-1 rounded-xl border p-4">
        <span className="text-muted-foreground text-2xs flex items-center gap-1 font-medium">
          <CheckCircle2 className="size-3.5 text-emerald-500" />{" "}
          {t("client.analytics.publishedPosts")}
        </span>
        <span className="text-foreground text-xl font-bold">
          {analytics.publishedPosts}
        </span>
      </div>

      <div className="border-border bg-card space-y-1 rounded-xl border p-4">
        <span className="text-muted-foreground text-2xs flex items-center gap-1 font-medium">
          <Zap className="size-3.5 text-amber-500" />{" "}
          {t("client.analytics.activeRequests")}
        </span>
        <span className="text-foreground text-xl font-bold">
          {analytics.activeRequests}
        </span>
      </div>

      <div className="border-border bg-card space-y-1 rounded-xl border p-4">
        <span className="text-muted-foreground text-2xs flex items-center gap-1 font-medium">
          <BarChart3 className="text-brand-orange size-3.5" />{" "}
          {t("client.analytics.engagementRate")}
        </span>
        <span className="text-foreground text-xl font-bold">
          {analytics.engagementRate}%
        </span>
      </div>
    </div>
  );
}
