import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TrendPipelineRun } from "@/pages/admin/types/trendPipeline";

export function AdminTrendPipelineRun({
  run,
  recoveryDisabled = true,
  recoveryReady = false,
  onRecover,
}: {
  run: TrendPipelineRun;
  recoveryDisabled?: boolean;
  recoveryReady?: boolean;
  onRecover?: (run: TrendPipelineRun) => void;
}) {
  const { t } = useTranslation();
  const interrupted = run.status === "INTERRUPTED";
  const failed = run.status === "FAILED" || interrupted;
  return (
    <article className="border-border bg-muted/30 space-y-2 rounded-xl border p-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <code className="break-all">{run.pipelineRunId ?? run.id}</code>
        <Badge
          className={failed ? undefined : "text-foreground"}
          variant={failed ? "destructive" : "outline"}
        >
          {t(`admin.trendPipeline.stage.${run.stage}`)}
        </Badge>
      </div>
      {run.test && (
        <p className="text-muted-foreground">{t("admin.crawler.testMode")}</p>
      )}
      {run.stopRequested && run.status === "RUNNING" && (
        <p role="status">
          {t("admin.crawler.stopRequested")}. {t("admin.crawler.stopHelp")}
        </p>
      )}
      <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
        <span>{t("admin.trendPipeline.posts", { count: run.totalPosts })}</span>
        <span>
          {t("admin.trendPipeline.batches", {
            finished: run.batchFinished,
            total: run.batchTotal,
          })}
        </span>
        {run.databaseSaved && (
          <span>
            {t(
              run.liveUpdated
                ? "admin.trendPipeline.saved"
                : "admin.trendPipeline.historicalSaved",
            )}
          </span>
        )}
      </div>
      {Boolean(run.platforms?.length) && (
        <ul
          className="grid gap-2 sm:grid-cols-3"
          aria-label={t("admin.trendSettings.collection")}
        >
          {run.platforms?.map((p) => (
            <li
              key={p.platform}
              className="border-border space-y-1 rounded-lg border p-2"
            >
              <span className="font-medium">
                {t(`admin.trendSettings.platform.${p.platform}`)}
              </span>
              <p className="text-muted-foreground">
                {t(`admin.trendSettings.collectionStatus.${p.status}`)} ·{" "}
                {t("admin.trendPipeline.posts", { count: p.posts })}
              </p>
            </li>
          ))}
        </ul>
      )}
      {interrupted && (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground min-w-0 flex-1 space-y-1">
            <p>{t("admin.trendPipeline.interruptedDescription")}</p>
            {!run.canRecover && (
              <p>{t("admin.trendPipeline.recoveryUnavailable")}</p>
            )}
            {run.canRecover && !recoveryReady && (
              <p>{t("admin.trendPipeline.recoveryNotReady")}</p>
            )}
          </div>
          {run.canRecover && onRecover && (
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={recoveryDisabled}
              onClick={() => onRecover(run)}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("admin.trendPipeline.recover")}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
