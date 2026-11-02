import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { crawlerManagementService as service } from "@/pages/admin/services/crawlerManagementService";

interface CrawlerHealthPanelProps {
  hideRefresh?: boolean;
}

export function CrawlerHealthPanel({
  hideRefresh = false,
}: CrawlerHealthPanelProps = {}) {
  const { t, i18n } = useTranslation();
  const query = useQuery({
    queryKey: ["admin", "crawler-health"],
    queryFn: ({ signal }) => service.health(signal),
    refetchInterval: 15_000,
    retry: false,
  });
  return (
    <section
      className="border-border bg-card space-y-4 rounded-xl border p-4"
      aria-labelledby="crawler-health-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="crawler-health-title" className="font-semibold">
          {t("admin.crawler.healthTitle")}
        </h2>
        {!hideRefresh && (
          <Button
            variant="outline"
            size="sm"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RefreshCw
              className={`size-3.5 ${query.isFetching ? "animate-spin" : ""}`}
            />
            {t("admin.crawler.refresh")}
          </Button>
        )}
      </div>
      {query.isPending && (
        <p role="status" className="text-muted-foreground text-sm">
          {t("admin.loading")}
        </p>
      )}
      {query.isError && (
        <p role="alert" className="text-destructive text-sm">
          {t("admin.crawler.loadError")}
        </p>
      )}
      {query.data && (
        <>
          <p className="text-muted-foreground text-sm">
            {t("admin.crawler.healthScope")}
          </p>
          {!!query.data.alerts?.length && (
            <div
              role="status"
              className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-lg border p-3 text-sm space-y-1.5"
            >
              <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{t("admin.crawler.warningTitle")}</span>
              </div>
              <ul className="list-inside list-disc pl-1 text-xs space-y-0.5">
                {query.data.alerts.map((alert, index) => (
                  <li key={`${alert.component}-${index}`}>
                    {t(`admin.crawler.codes.${alert.code}`, {
                      defaultValue: t("admin.crawler.checkUnavailable"),
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2.5 text-xs" role="status">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${
                query.data.manualReady
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-border bg-muted/60 text-muted-foreground"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  query.data.manualReady
                    ? "bg-emerald-500"
                    : "bg-muted-foreground"
                }`}
              />
              <span>
                {t("admin.crawler.manual")}:{" "}
                {t(
                  query.data.manualReady
                    ? "admin.crawler.ready"
                    : "admin.crawler.blocked",
                )}
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${
                query.data.schedulerHealthy
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  query.data.schedulerHealthy
                    ? "bg-emerald-500"
                    : "bg-destructive"
                }`}
              />
              <span>
                {t("admin.crawler.scheduler")}:{" "}
                {t(
                  query.data.schedulerHealthy
                    ? "admin.crawler.healthy"
                    : "admin.crawler.stopped",
                )}
              </span>
            </div>

            <div className="text-muted-foreground inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
              <Clock className="size-3 text-muted-foreground/80" />
              <span>{t("admin.crawler.checkedAt")}:</span>
              <span className="font-mono tabular-nums text-foreground">
                {new Date(query.data.checkedAt).toLocaleTimeString(
                  i18n.language,
                )}
              </span>
            </div>
          </div>

          {Boolean(query.data.nextRuns?.length) && (
            <div className="text-muted-foreground bg-muted/30 border-border/50 flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs">
              <span className="font-medium text-foreground">
                {t("admin.crawler.nextRuns")} ({query.data.timezone}):
              </span>
              <span className="font-mono tabular-nums">
                {query.data.nextRuns
                  ?.map((value) =>
                    new Date(value).toLocaleString(i18n.language, {
                      timeZone: query.data!.timezone,
                    }),
                  )
                  .join(" · ")}
              </span>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.checks.map((check) => {
              const isOk = check.status === "OK";
              const statusClasses = isOk
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                : check.required
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
              const StatusIcon = isOk
                ? CheckCircle2
                : check.required
                  ? XCircle
                  : AlertTriangle;

              return (
                <div
                  key={`${check.component}-${check.platform ?? ""}`}
                  className="border-border/70 bg-card/60 space-y-1.5 rounded-lg border p-3 transition-colors hover:border-border"
                >
                  <div className="flex items-center justify-between gap-2 text-sm font-medium">
                    <span className="truncate">
                      {t(`admin.crawler.components.${check.component}`)}
                      {check.platform
                        ? ` · ${t(`admin.trendSettings.platform.${check.platform}`)}`
                        : ""}
                    </span>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium ${statusClasses}`}
                    >
                      <StatusIcon className="size-3.5 shrink-0" />
                      <span>
                        {t(`admin.crawler.checkStates.${check.status}`)}
                      </span>
                    </span>
                  </div>
                  {check.status !== "OK" && (
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t(`admin.crawler.codes.${check.code}`, {
                        defaultValue: t("admin.crawler.checkUnavailable"),
                      })}
                    </p>
                  )}
                  {check.consumers !== undefined && (
                    <p className="text-muted-foreground font-mono tabular-nums text-xs">
                      {t("admin.crawler.queueCounts", {
                        consumers: check.consumers,
                        messages: check.messagesReady,
                      })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
