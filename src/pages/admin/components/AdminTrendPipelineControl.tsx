import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock3, History, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTrendPipeline } from "@/pages/admin/hooks/useTrendPipeline";
import type { TrendPipelineRun } from "@/pages/admin/types/trendPipeline";

function PipelineRun({ run }: { run: TrendPipelineRun }) {
  const { t } = useTranslation();
  return (
    <article className="border-border bg-muted/30 space-y-2 rounded-lg border p-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <code className="break-all">{run.pipelineRunId ?? run.id}</code>
        <Badge
          className={run.status === "FAILED" ? undefined : "text-foreground"}
          variant={run.status === "FAILED" ? "destructive" : "outline"}
        >
          {t(`admin.trendPipeline.stage.${run.stage}`)}
        </Badge>
      </div>
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
    </article>
  );
}

export function AdminTrendPipelineControl() {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState(false);
  const [history, setHistory] = useState(false);
  const historyId = useId();
  const pipeline = useTrendPipeline(() => {
    setConfirm(false);
    setHistory(true);
  });
  const data = pipeline.status.data;
  const active = pipeline.runs.data
    ? pipeline.runs.data.running
    : data?.running;
  const disabled =
    pipeline.mutation.isPending ||
    !data?.ready ||
    pipeline.status.isError ||
    pipeline.runs.isPending ||
    pipeline.runs.isError ||
    Boolean(active);
  const next = data?.nextRunAt && new Date(data.nextRunAt);
  const at =
    next && !Number.isNaN(next.valueOf())
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(next)
      : null;
  return (
    <section
      aria-label={t("admin.trendPipeline.title")}
      className="bg-card border-border space-y-3 rounded-xl border p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-sm font-semibold">
            {t("admin.trendPipeline.title")}
          </h2>
          <p role="status" className="text-muted-foreground text-xs">
            {pipeline.status.isPending
              ? t("admin.loading")
              : pipeline.status.isError || pipeline.runs.isError
                ? t("admin.trendPipeline.error")
                : !data?.ready
                  ? t("admin.trendPipeline.notReady")
                  : active
                    ? t(`admin.trendPipeline.stage.${active.stage}`)
                    : t("admin.trendPipeline.ready")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={pipeline.refresh}
            aria-label={t("admin.trends.refresh")}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistory(!history)}
            aria-expanded={history}
            aria-controls={historyId}
          >
            <History className="size-4" aria-hidden="true" />
            {t("admin.trendPipeline.history")}
          </Button>
          <Button
            variant="orange"
            size="sm"
            disabled={disabled}
            loading={pipeline.mutation.isPending}
            onClick={() => setConfirm(true)}
          >
            <Play className="size-4" aria-hidden="true" />
            {t("admin.trendPipeline.runNow")}
          </Button>
        </div>
      </div>
      {data && !pipeline.status.isError && (
        <div className="bg-muted/40 text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {t("admin.trendPipeline.schedule")}:{" "}
            <code className="text-foreground">{data.cron}</code>
            <span>({data.timezone})</span>
          </span>
          <span>
            {!data.scheduleEnabled
              ? t("admin.trendPipeline.scheduleDisabled")
              : !data.schedulerRunning
                ? t("admin.trendPipeline.schedulerStopped")
                : at
                  ? t("admin.trendPipeline.next", { at })
                  : t("admin.trendPipeline.scheduleEnabled")}
          </span>
          {!data.scheduleValid && (
            <span className="text-destructive">
              {t("admin.trendPipeline.invalidSchedule")}
            </span>
          )}
        </div>
      )}
      {active && !pipeline.runs.isError && <PipelineRun run={active} />}
      {history && (
        <div id={historyId} className="space-y-2">
          <p className="text-muted-foreground text-xs">
            {t("admin.trendPipeline.historyDescription")}
          </p>
          {pipeline.runs.isError ? (
            <p role="alert" className="text-destructive text-xs">
              {t("admin.trendPipeline.error")}
            </p>
          ) : !pipeline.runs.data?.history.length ? (
            <p className="text-muted-foreground text-xs">
              {t("admin.trendPipeline.emptyHistory")}
            </p>
          ) : (
            pipeline.runs.data.history.map((run) => (
              <PipelineRun key={run.id} run={run} />
            ))
          )}
        </div>
      )}
      <Dialog
        open={confirm}
        onOpenChange={(open) => {
          if (!pipeline.mutation.isPending) setConfirm(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.trendPipeline.confirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.trendPipeline.confirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={pipeline.mutation.isPending}
              onClick={() => setConfirm(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="orange"
              disabled={disabled}
              loading={pipeline.mutation.isPending}
              onClick={() => {
                void pipeline.start().catch(() => {});
              }}
            >
              {t("admin.trendPipeline.runNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
