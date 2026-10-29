import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Sparkles, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { useTrendView } from "@/pages/admin/hooks/useTrendView";

export function AdminTrendSummary({
  query,
}: {
  query: ReturnType<typeof useTrendView>["summary"];
}) {
  const { t, i18n } = useTranslation();
  const latest = query.data?.latest_run;
  if (query.isPending || query.isError || !latest)
    return (
      <div className="border-border bg-card rounded-xl border p-4">
        <p role="status" className="text-muted-foreground text-sm">
          {query.isPending
            ? t("admin.loading")
            : query.isError
              ? t("admin.trends.summaryError")
              : t("admin.trends.noPublication")}
        </p>
      </div>
    );
  const published = latest.published_at && new Date(latest.published_at);
  const formatted =
    published && !Number.isNaN(published.valueOf())
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(published)
      : "—";
  return (
    <div className="border-border bg-card/60 space-y-3 rounded-xl border p-4 shadow-2xs">
      <div className="flex items-center gap-2">
        <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
          <Sparkles className="size-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("admin.trends.latest")}
          </h2>
          <p className="text-foreground font-mono text-sm font-semibold break-all">
            {latest.run_id}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 pt-1 text-xs sm:grid-cols-3">
        <div className="border-border/50 bg-background/50 space-y-1 rounded-lg border p-2.5">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <Clock className="size-3" aria-hidden="true" />
            {t("admin.trends.publishedTime")}
          </span>
          <p className="text-foreground font-medium">{formatted}</p>
        </div>
        <div className="border-border/50 bg-background/50 space-y-1 rounded-lg border p-2.5">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="size-3" aria-hidden="true" />
            {t("admin.trends.publicationStatus")}
          </span>
          <Badge variant="outline" className="text-xs">
            {latest.status}
          </Badge>
        </div>
        <div className="border-border/50 bg-background/50 space-y-1 rounded-lg border p-2.5">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <GitBranch className="size-3" aria-hidden="true" />
            {t("admin.trendReplay.resolution")}
          </span>
          {latest.entity_resolution ? (
            <Badge variant="secondary" className="text-xs">
              {latest.entity_resolution.status}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
