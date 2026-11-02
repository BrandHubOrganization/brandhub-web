import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { crawlerManagementService as service } from "@/pages/admin/services/crawlerManagementService";

export function CrawlerHealthPanel() {
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
        <Button
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw className="size-4" />
          {t("admin.crawler.refresh")}
        </Button>
      </div>
      {query.isPending && <p role="status">{t("admin.loading")}</p>}
      {query.isError && (
        <p role="alert" className="text-destructive">
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
              className="border-border rounded-lg border p-3 text-sm"
            >
              <strong>{t("admin.crawler.warningTitle")}</strong>
              <ul className="list-inside list-disc">
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
          <div className="flex flex-wrap gap-4 text-sm" role="status">
            <p>
              {t("admin.crawler.manual")}:{" "}
              <strong>
                {t(
                  query.data.manualReady
                    ? "admin.crawler.ready"
                    : "admin.crawler.blocked",
                )}
              </strong>
            </p>
            <p>
              {t("admin.crawler.scheduler")}:{" "}
              <strong>
                {t(
                  query.data.schedulerHealthy
                    ? "admin.crawler.healthy"
                    : "admin.crawler.stopped",
                )}
              </strong>
            </p>
            <p className="text-muted-foreground">
              {t("admin.crawler.checkedAt")}:{" "}
              {new Date(query.data.checkedAt).toLocaleTimeString(i18n.language)}
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            {t("admin.crawler.nextRuns")} ({query.data.timezone}):{" "}
            {query.data.nextRuns
              ?.map((value) =>
                new Date(value).toLocaleString(i18n.language, {
                  timeZone: query.data!.timezone,
                }),
              )
              .join(" · ")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.checks.map((check) => (
              <div
                key={`${check.component}-${check.platform}`}
                className="border-border space-y-1 rounded-lg border p-3"
              >
                <p className="flex justify-between gap-2 text-sm font-medium">
                  <span>
                    {t(`admin.crawler.components.${check.component}`)}
                    {check.platform
                      ? ` · ${t(`admin.trendSettings.platform.${check.platform}`)}`
                      : ""}
                  </span>
                  <span
                    className={
                      check.status !== "OK" && check.required
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {t(`admin.crawler.checkStates.${check.status}`)}
                  </span>
                </p>
                {check.status !== "OK" && (
                  <p className="text-muted-foreground text-xs">
                    {t(`admin.crawler.codes.${check.code}`, {
                      defaultValue: t("admin.crawler.checkUnavailable"),
                    })}
                  </p>
                )}
                {check.consumers !== undefined && (
                  <p className="text-muted-foreground text-xs">
                    {t("admin.crawler.queueCounts", {
                      consumers: check.consumers,
                      messages: check.messagesReady,
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
