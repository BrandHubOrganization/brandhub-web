import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, CheckCircle2, Copy, RotateCcw } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const interrupted = run.status === "INTERRUPTED";
  const failed = run.status === "FAILED" || interrupted;
  const isRunning = run.status === "RUNNING";

  const rawId = run.pipelineRunId ?? run.id;
  const shortId =
    rawId.length > 20 ? `${rawId.slice(0, 8)}...${rawId.slice(-6)}` : rawId;

  const handleCopy = () => {
    if (navigator?.clipboard) {
      void navigator.clipboard.writeText(rawId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const progress =
    run.batchTotal > 0
      ? Math.min(100, Math.round((run.batchFinished / run.batchTotal) * 100))
      : 0;

  return (
    <article className="border-border bg-card/60 hover:bg-card/90 space-y-2.5 rounded-xl border p-3.5 text-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <code
            className="font-mono text-xs bg-muted/60 hover:bg-muted px-2 py-0.5 rounded border border-border/60 text-foreground transition-colors cursor-pointer select-all"
            title={rawId}
            onClick={handleCopy}
          >
            {shortId}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            aria-label="Copy run ID"
            title="Copy run ID"
          >
            {copied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3" />
            )}
          </Button>
        </div>
        <Badge
          variant={failed ? "destructive" : "outline"}
          className={
            isRunning
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1.5 font-medium"
              : failed
                ? "gap-1.5 font-medium"
                : "text-foreground font-medium"
          }
        >
          {isRunning && (
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          {t(`admin.trendPipeline.stage.${run.stage}`)}
        </Badge>
      </div>

      {run.batchTotal > 0 && (
        <div className="space-y-1">
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                failed
                  ? "bg-destructive"
                  : isRunning
                    ? "bg-emerald-500"
                    : "bg-primary"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {run.test && (
        <p className="text-muted-foreground">{t("admin.crawler.testMode")}</p>
      )}

      {run.stopRequested && run.status === "RUNNING" && (
        <p
          role="status"
          className="text-amber-600 dark:text-amber-400 font-medium"
        >
          {t("admin.crawler.stopRequested")}. {t("admin.crawler.stopHelp")}
        </p>
      )}

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 font-mono tabular-nums text-xs">
        <span className="text-foreground">
          {t("admin.trendPipeline.posts", { count: run.totalPosts })}
        </span>
        <span className="text-foreground">
          {t("admin.trendPipeline.batches", {
            finished: run.batchFinished,
            total: run.batchTotal,
          })}
          {run.batchTotal > 0 && (
            <span className="text-muted-foreground ml-1.5 font-normal">
              ({progress}%)
            </span>
          )}
        </span>
        {run.databaseSaved && (
          <span className="inline-flex items-center gap-1 font-sans text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>
              {t(
                run.liveUpdated
                  ? "admin.trendPipeline.saved"
                  : "admin.trendPipeline.historicalSaved",
              )}
            </span>
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
              className="border-border/70 bg-muted/20 space-y-1 rounded-lg border p-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">
                  {t(`admin.trendSettings.platform.${p.platform}`)}
                </span>
                <span className="text-muted-foreground font-mono tabular-nums">
                  {t("admin.trendPipeline.posts", { count: p.posts })}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                {t(`admin.trendSettings.collectionStatus.${p.status}`)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {interrupted && (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/50 pt-2.5">
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
