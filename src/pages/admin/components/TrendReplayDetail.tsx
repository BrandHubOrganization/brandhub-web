import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Database,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trendReplayService } from "@/pages/admin/services/trendReplayService";
import type { ReplayJob, ReplayStatus } from "@/pages/admin/types/trendReplay";

function getStatusBadgeStyle(status: ReplayStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
    case "RUNNING":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse";
    case "FAILED":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
    case "INTERRUPTED":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
    case "PREVIEW":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function TrendReplayDetail({
  job,
  onStart,
  busy,
  mayStart,
}: {
  job: ReplayJob;
  onStart: () => void;
  busy: boolean;
  mayStart: boolean;
}) {
  const { t } = useTranslation();
  const [resultDay, setResultDay] = useState<string | null>(null);

  const result = useQuery({
    queryKey: ["trend-replay-result", job.id, resultDay],
    enabled: Boolean(resultDay),
    queryFn: () => trendReplayService.result(job.id, resultDay ?? ""),
  });

  const completed = job.days.filter((d) => d.status === "COMPLETED").length;
  const total = Math.max(1, job.days.length);
  const percent = Math.round((completed / total) * 100);

  return (
    <section className="bg-card/95 border-border/80 min-w-0 space-y-6 rounded-2xl border p-4 md:p-6 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
      {/* Header with Title, ID, Status and Stage Badges */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {t("admin.trendReplay.details")}
            </h2>
            <Badge
              variant="outline"
              className={cn("text-xs px-2 py-0.5 font-medium", getStatusBadgeStyle(job.status))}
            >
              {t(`admin.trendReplay.status.${job.status}`)}
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              {job.stage}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono text-xs break-all select-all">
            {job.id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {job.processing_mode && (
            <Badge variant="outline" className="text-[11px] font-mono">
              {job.processing_mode}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Card Section */}
      <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-foreground text-sm font-medium">
            {t("admin.trendReplay.progress", { completed, total: job.days.length })} · {job.stage}
          </p>
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {percent}%
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/40">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              job.status === "COMPLETED"
                ? "bg-emerald-500"
                : job.status === "FAILED"
                  ? "bg-rose-500"
                  : "bg-brand-orange",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Accessible Progress Indicator */}
        <progress
          className="accent-brand-orange h-1.5 w-full opacity-0 pointer-events-none absolute"
          aria-label={t("admin.trendReplay.details")}
          value={completed}
          max={total}
        />

        {/* S3 URI details */}
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground break-all bg-card/80 p-2.5 rounded-lg border border-border/50">
          <Database aria-hidden="true" className="size-3.5 shrink-0 text-brand-orange" />
          <span className="break-all">
            s3://{job.bucket}/{job.prefix}
          </span>
        </div>
      </div>

      {/* Warnings & Notices */}
      {job.ignored_keys > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0 mt-0.5" />
          <p>{t("admin.trendReplay.ignored", { count: job.ignored_keys })}</p>
        </div>
      )}

      {job.error && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium break-words">
          {job.error}
        </div>
      )}

      {job.processing_mode !== "NORMAL_PIPELINE_V2" && (
        <p role="status" className="text-muted-foreground text-xs bg-muted/40 p-3 rounded-lg border border-border/50">
          {t("admin.trendReplay.outdatedPreview")}
        </p>
      )}

      {/* Deploy API Usage Warning & Start/Resume Button */}
      {mayStart && job.days.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <Sparkles aria-hidden="true" className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                {t("admin.trendReplay.providerCostTitle")}
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t("admin.trendReplay.costWarning")}
              </p>
            </div>
          </div>
          <Button
            variant="orange"
            disabled={busy}
            loading={busy}
            onClick={onStart}
            className="w-full sm:w-auto font-medium shadow-sm"
          >
            {t(
              job.status === "PREVIEW"
                ? "admin.trendReplay.start"
                : "admin.trendReplay.resume",
            )}
          </Button>
        </div>
      )}

      {job.days.length === 0 && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          {t("admin.trendReplay.noFiles")}
        </div>
      )}

      {/* Days Breakdown */}
      <div className="space-y-3">
        {job.days.map((day) => (
          <details
            key={day.date}
            className="group border border-border/70 rounded-xl bg-card overflow-hidden transition-colors"
            open={day.status === "RUNNING" || day.status === "FAILED"}
          >
            <summary className="cursor-pointer text-sm font-medium p-3.5 select-none hover:bg-muted/30 flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="font-mono font-semibold text-foreground">{day.date}</span>
                <span className="text-muted-foreground">·</span>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0 font-medium", getStatusBadgeStyle(day.status))}
                >
                  {t(`admin.trendReplay.status.${day.status}`)}
                </Badge>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-xs">
                  {t("admin.trendReplay.fileCount", { count: day.files.length })}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-xs">
                  {t("admin.trendReplay.trendCount", { count: day.trends_count })}
                </span>
              </div>
              <ChevronDown
                aria-hidden="true"
                className="size-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="border-t border-border/50 p-4 space-y-3 bg-muted/10">
              {day.error && (
                <p className="text-destructive text-xs font-medium p-2 rounded bg-destructive/10 border border-destructive/20">
                  {day.error}
                </p>
              )}

              {day.persistence && (
                <div className="text-xs bg-muted/40 p-2.5 rounded-lg border border-border/40 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium text-foreground">
                      {t("admin.trendReplay.databaseSaved")}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {t(
                        day.persistence.live_updated
                          ? "admin.trendReplay.liveUpdated"
                          : "admin.trendReplay.dailyOnly",
                      )}
                    </span>
                    {day.persistence.entity_resolution?.status && (
                      <span className="text-muted-foreground">
                        {" "}· {t("admin.trendReplay.resolution")}:{" "}
                        <span className="font-semibold text-foreground">
                          {day.persistence.entity_resolution.status}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Files in Day */}
              <ul className="space-y-2">
                {day.files.map((file) => (
                  <li
                    key={file.key}
                    className="bg-card/90 border border-border/50 rounded-lg p-2.5 text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono font-medium text-foreground break-all text-[11px]">
                        {file.key}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("text-[9px] shrink-0 px-1 py-0", getStatusBadgeStyle(file.status))}
                      >
                        {t(`admin.trendReplay.status.${file.status}`)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] flex flex-wrap gap-2">
                      <span>
                        {t("admin.trendReplay.postCount", { count: file.adapted_posts })}
                      </span>
                      <span>·</span>
                      <span>
                        {t("admin.trendReplay.batchCount", { count: file.batches })}
                      </span>
                    </p>
                    {file.error && (
                      <p className="text-destructive text-[11px]">{file.error}</p>
                    )}
                  </li>
                ))}
              </ul>

              {/* Actions Footer inside Day Details */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                <Link
                  to={`/admin?view=trends&period=24h&date=${day.date}`}
                  className="text-brand-orange-fg focus-visible:outline-ring inline-flex items-center gap-1 rounded text-xs font-medium underline underline-offset-4 focus-visible:outline-2"
                >
                  <ExternalLink aria-hidden="true" className="size-3" />
                  {t("admin.trends.viewPublished")}
                </Link>

                {day.status === "COMPLETED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    onClick={() => setResultDay(day.date)}
                  >
                    {t("admin.trendReplay.results")}
                  </Button>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Daily Results Block */}
      {resultDay && (
        <section className="border-border space-y-3 border-t pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span>{t("admin.trendReplay.results")}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-brand-orange">{resultDay}</span>
            </h3>
            {result.data?.candidates && (
              <Badge variant="secondary" className="font-mono text-xs">
                {result.data.candidates.length} {t("admin.trendReplay.trendCount", { count: result.data.candidates.length })}
              </Badge>
            )}
          </div>

          {result.isPending && (
            <p role="status" className="text-sm text-muted-foreground">
              {t("admin.loading")}
            </p>
          )}

          {result.isError && (
            <p role="alert" className="text-destructive text-sm font-medium">
              {t("admin.trendReplay.error")}
            </p>
          )}

          {result.data?.candidates.length === 0 && (
            <p className="text-muted-foreground text-sm">
              {t("admin.trendReplay.noTrends")}
            </p>
          )}

          <ol className="space-y-2 text-sm">
            {result.data?.candidates.map((c) => (
              <li
                key={c.trend_id || `${c.keyword}-${c.rank}`}
                className="bg-muted/20 border border-border/60 hover:border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 transition-colors shadow-2xs"
              >
                <span className="font-semibold text-foreground">
                  {c.rank}. {c.keyword}
                </span>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs font-semibold tabular-nums bg-accent/60 px-2 py-0.5 rounded-md border border-border/40">
                    {c.final_score.toFixed(2)}
                  </span>
                  {c.trend_id && (
                    <Link
                      to={`/admin?view=trendGraph&trendId=${encodeURIComponent(c.trend_id)}`}
                      className="text-brand-orange-fg hover:underline text-xs inline-flex items-center gap-1 font-medium"
                    >
                      <Network aria-hidden="true" className="size-3.5" />
                      {t("admin.trendGraph.openGraph")}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
}