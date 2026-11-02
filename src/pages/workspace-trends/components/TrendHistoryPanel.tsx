import { lazy, Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendSkeleton } from "@/pages/workspace-trends/components/TrendSkeleton";
import { getTrendHistory } from "@/pages/workspace-trends/services/trends";

const Charts = lazy(
  () => import("@/pages/workspace-trends/components/TrendHistoryCharts"),
);

export function TrendHistoryPanel({
  workspaceId,
  keyword,
  date,
  close,
}: {
  workspaceId: string;
  keyword: string;
  date: string;
  close: () => void;
}) {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const history = useQuery({
    queryKey: ["workspace-trend-history", workspaceId, keyword, date, days],
    queryFn: ({ signal }) =>
      getTrendHistory(workspaceId, keyword, date, days, signal),
    staleTime: 60_000,
  });
  return (
    <aside
      className="border-border bg-card min-w-0 rounded-xl border p-4 sm:p-5"
      aria-busy={history.isFetching}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="truncate text-lg font-semibold">{keyword}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          aria-label={t("aiStudio.workspaceTrends.close")}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label={t("aiStudio.workspaceTrends.history")}
      >
        {[7, 30, 90].map((value) => (
          <Button
            key={value}
            variant={value === days ? "default" : "outline"}
            size="sm"
            aria-pressed={value === days}
            onClick={() => setDays(value)}
          >
            {t("aiStudio.workspaceTrends.days", { count: value })}
          </Button>
        ))}
      </div>
      {history.isPending || history.isFetching ? (
        <>
          <span className="sr-only" role="status">
            {t("aiStudio.workspaceTrends.loading")}
          </span>
          <TrendSkeleton detail />
        </>
      ) : history.isError ? (
        <div role="alert">
          <p className="mb-3 text-sm">
            {t("aiStudio.workspaceTrends.historyError")}
          </p>
          <Button variant="outline" onClick={() => void history.refetch()}>
            {t("aiStudio.workspaceTrends.retry")}
          </Button>
        </div>
      ) : (
        history.data && (
          <>
            <p className="text-muted-foreground mb-4 text-xs">
              {t("aiStudio.workspaceTrends.historyNote")}
            </p>
            {history.data.truncated && (
              <p role="status" className="mb-3 text-sm">
                {t("aiStudio.workspaceTrends.truncated")}
              </p>
            )}
            <Suspense fallback={<TrendSkeleton detail />}>
              <Charts points={history.data.points} />
            </Suspense>
            <h3 className="mt-6 mb-2 font-semibold">
              {t("aiStudio.workspaceTrends.sources")}
            </h3>
            {history.data.sources.length ? (
              <ul className="space-y-2">
                {history.data.sources.map((url) => (
                  <li key={url} className="min-w-0">
                    <a
                      href={url.startsWith("https://") ? url : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-orange block truncate text-sm underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("aiStudio.workspaceTrends.noSources")}
              </p>
            )}
            {history.data.sourcesTruncated && (
              <p className="text-muted-foreground mt-2 text-xs">
                {t("aiStudio.workspaceTrends.sourceLimit")}
              </p>
            )}
          </>
        )
      )}
    </aside>
  );
}
