import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock3, History, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTrendPipeline } from "@/pages/admin/hooks/useTrendPipeline";
import { AdminTrendPipelineRun } from "@/pages/admin/components/AdminTrendPipelineRun";
import type { TrendPipelineRun } from "@/pages/admin/types/trendPipeline";

export function AdminTrendPipelineControl({
  managed = false,
}: {
  managed?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState<TrendPipelineRun | "start" | null>(
    null,
  );
  const [history, setHistory] = useState(false);
  const historyId = useId();
  const pipeline = useTrendPipeline(() => {
    setConfirm(null);
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
  const interrupted = (pipeline.runs.data?.history ?? []).filter(
    (run) => run.status === "INTERRUPTED",
  );
  const recoveryDisabled =
    pipeline.mutation.isPending ||
    !data?.recoveryReady ||
    pipeline.status.isError ||
    pipeline.runs.isPending ||
    pipeline.runs.isError ||
    Boolean(active);
  const recoveryTarget = confirm && confirm !== "start" ? confirm : null;
  const confirmDisabled = recoveryTarget
    ? recoveryDisabled ||
      !interrupted.some((run) => run.id === recoveryTarget.id && run.canRecover)
    : disabled;
  const next = data?.nextRunAt && new Date(data.nextRunAt);
  const at =
    next && !Number.isNaN(next.valueOf())
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(next)
      : null;

  const hasActive = Boolean(active && !pipeline.runs.isError);
  const hasInterrupted = !pipeline.runs.isError && interrupted.length > 0;

  if (managed && !hasActive && !hasInterrupted) {
    return null;
  }

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
          {!managed && (
            <p role="status" className="text-muted-foreground text-xs">
              {pipeline.status.isPending
                ? t("admin.loading")
                : pipeline.status.isError || pipeline.runs.isError
                  ? t("admin.trendPipeline.error")
                  : active
                    ? t(`admin.trendPipeline.stage.${active.stage}`)
                    : !data?.ready
                      ? t(
                          data?.readinessReason === "THREADS_SESSION_MISSING"
                            ? "admin.trendSettings.threadsSessionMissing"
                            : data?.readinessReason ===
                                "TIKTOK_API_NOT_CONFIGURED"
                              ? "admin.trendSettings.tiktokApiMissing"
                              : data?.readinessReason ===
                                  "PIPELINE_CONFIG_UNAVAILABLE"
                                ? "admin.trendSettings.error"
                                : data?.readinessReason === "SESSION_MISSING"
                                  ? "admin.trendPipeline.sessionMissing"
                                  : "admin.trendPipeline.notReady",
                        )
                      : t("admin.trendPipeline.ready")}
            </p>
          )}
        </div>
        {!managed && (
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
              onClick={() => setConfirm("start")}
            >
              <Play className="size-4" aria-hidden="true" />
              {t("admin.trendPipeline.runNow")}
            </Button>
          </div>
        )}
      </div>
      {!managed && !active && data?.readinessReason === "THREADS_SESSION_MISSING" && (
        <p
          role="alert"
          className="border-border bg-muted/40 rounded-lg border p-3 text-sm"
        >
          {t("admin.trendSettings.threadsSessionRemedy")}
        </p>
      )}
      {!managed && data && !pipeline.status.isError && (
        <div className="bg-muted/40 text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-2 text-xs">
          <span>
            {data.platforms
              ?.map((p) => t(`admin.trendSettings.platform.${p}`))
              .join(" → ")}
          </span>
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {t("admin.trendPipeline.schedule")}:{" "}
            <code className="text-foreground whitespace-nowrap">
              {data.cron}
            </code>
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
      {active && !pipeline.runs.isError && (
        <AdminTrendPipelineRun run={active} />
      )}
      {!pipeline.runs.isError &&
        interrupted.map((run) => (
          <AdminTrendPipelineRun
            key={run.id}
            run={run}
            recoveryDisabled={recoveryDisabled}
            recoveryReady={data?.recoveryReady}
            onRecover={setConfirm}
          />
        ))}
      {!managed && history && (
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
            pipeline.runs.data.history
              .filter((run) => run.status !== "INTERRUPTED")
              .map((run) => <AdminTrendPipelineRun key={run.id} run={run} />)
          )}
        </div>
      )}
      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!pipeline.mutation.isPending && !open) setConfirm(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t(
                recoveryTarget
                  ? "admin.trendPipeline.confirmRecoveryTitle"
                  : "admin.trendPipeline.confirmTitle",
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                recoveryTarget
                  ? "admin.trendPipeline.confirmRecoveryDescription"
                  : "admin.trendPipeline.confirmDescription",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={pipeline.mutation.isPending}
              onClick={() => setConfirm(null)}
            >
              {t("admin.trendPipeline.cancel")}
            </Button>
            <Button
              variant="orange"
              disabled={confirmDisabled}
              loading={pipeline.mutation.isPending}
              onClick={() => {
                void (
                  recoveryTarget
                    ? pipeline.recover(recoveryTarget.id)
                    : pipeline.start()
                ).catch(() => {});
              }}
            >
              {t(
                recoveryTarget
                  ? "admin.trendPipeline.recover"
                  : "admin.trendPipeline.runNow",
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
