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
  AlertCircle,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trendReplayService } from "@/pages/admin/services/trendReplayService";
import { TrendReplayFlow } from "@/pages/admin/components/TrendReplayFlow";
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
    <section className="bg-card/95 border-border/80 min-w-0 space-y-6 rounded-2xl border p-4 shadow-xs ring-1 ring-black/[0.04] md:p-6 dark:ring-white/[0.05]">
      {/* Header with Title, ID, Status and Stage Badges */}
      <div className="border-border/50 flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-foreground text-base font-semibold">
              {t("admin.trendReplay.details")}
            </h2>
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 text-xs font-medium",
                getStatusBadgeStyle(job.status),
              )}
            >
              {t(`admin.trendReplay.status.${job.status}`)}
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              {t(`admin.trendReplay.stages.${job.stage}`, {
                defaultValue: job.stage,
              })}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono text-xs break-all select-all">
            {job.id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {job.processing_mode === "NORMAL_PIPELINE_V3" && (
            <Badge variant="outline" className="font-mono text-[11px]">
              {t("admin.trendReplay.batchSize")}
            </Badge>
          )}
        </div>
      </div>

      <TrendReplayFlow stage={job.stage} />
      {/* Progress Card Section */}
      <div className="border-border/70 bg-muted/20 space-y-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-foreground text-sm font-medium">
            {t("admin.trendReplay.progress", {
              completed,
              total: job.days.length,
            })}
          </p>
          <span className="text-foreground font-mono text-xs font-semibold tabular-nums">
            {percent}%
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="bg-muted border-border/40 h-2 w-full overflow-hidden rounded-full border">
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
          className="sr-only"
          aria-label={t("admin.trendReplay.details")}
          value={completed}
          max={total}
        />

        {/* S3 URI details */}
        <div className="text-muted-foreground bg-card/80 border-border/50 flex items-center gap-2 rounded-lg border p-2.5 font-mono text-xs break-all">
          <Database
            aria-hidden="true"
            className="text-brand-orange size-3.5 shrink-0"
          />
          <span className="break-all">
            {job.prefix
              ? `s3://${job.bucket}/${job.prefix.replace(/^\/+/, "")}`
              : `s3://${job.bucket}`}
          </span>
        </div>
      </div>

      {/* Warnings & Notices */}
      {job.ignored_keys > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          <p>{t("admin.trendReplay.ignored", { count: job.ignored_keys })}</p>
        </div>
      )}

      {job.error && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-xl border p-3.5 text-xs"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <div className="min-w-0 flex-1 space-y-1.5 break-words">
            <p className="font-semibold leading-relaxed">
              {t("admin.trendReplay.errors." + job.error, {
                defaultValue: job.error,
              })}
            </p>
            {(job.status === "FAILED" || job.status === "INTERRUPTED") && (
              <>
                <p className="font-mono text-[11px] opacity-80">
                  {t("admin.trendReplay.errors.errorCode", { code: job.error })}
                </p>
                <p className="text-foreground/80 text-[11px] leading-relaxed">
                  {t("admin.trendReplay.errors.resumeHint")}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {job.processing_mode !== "NORMAL_PIPELINE_V3" && (
        <p
          role="status"
          className="text-muted-foreground bg-muted/40 border-border/50 rounded-lg border p-3 text-xs"
        >
          {t("admin.trendReplay.outdatedPreview")}
        </p>
      )}

      {/* Deploy API Usage Warning & Start/Resume Button */}
      {mayStart && job.days.length > 0 && (
        <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2.5">
            <Sparkles
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
            />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold tracking-wide text-amber-900 uppercase dark:text-amber-200">
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
            className="w-full font-medium shadow-sm sm:w-auto"
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
        <div className="text-muted-foreground py-6 text-center text-sm">
          {t("admin.trendReplay.noFiles")}
        </div>
      )}

      {/* Days Breakdown */}
      <div className="space-y-3">
        {job.days.map((day) => (
          <details
            key={day.date}
            className="group border-border/70 bg-card overflow-hidden rounded-xl border transition-colors"
            open={day.status === "RUNNING" || day.status === "FAILED"}
          >
            <summary className="hover:bg-muted/30 flex cursor-pointer list-none items-center justify-between gap-3 p-3.5 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-foreground font-mono font-semibold">
                  {day.date}
                </span>
                <span className="text-muted-foreground">·</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-1.5 py-0 text-[10px] font-medium",
                    getStatusBadgeStyle(day.status),
                  )}
                >
                  {t(`admin.trendReplay.status.${day.status}`)}
                </Badge>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-xs">
                  {t("admin.trendReplay.fileCount", {
                    count: day.files.length,
                  })}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-xs">
                  {t("admin.trendReplay.trendCount", {
                    count: day.trends_count,
                  })}
                </span>
              </div>
              <ChevronDown
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="border-border/50 bg-muted/10 space-y-3 border-t p-4">
              {day.error && (
                <p className="text-destructive bg-destructive/10 border-destructive/20 rounded border p-2 text-xs font-medium">
                  {t("admin.trendReplay.errors." + day.error, {
                    defaultValue: day.error,
                  })}
                </p>
              )}

              {day.persistence && (
                <div className="bg-muted/40 border-border/40 space-y-1 rounded-lg border p-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-emerald-500"
                    />
                    <span className="text-foreground font-medium">
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
                        {" "}
                        · {t("admin.trendReplay.resolution")}:{" "}
                        <span className="text-foreground font-semibold">
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
                    className="bg-card/90 border-border/50 space-y-1 rounded-lg border p-2.5 text-xs shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-foreground font-mono text-[11px] font-medium break-all">
                        {file.key}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 px-1 py-0 text-[9px]",
                          getStatusBadgeStyle(file.status),
                        )}
                      >
                        {t(`admin.trendReplay.status.${file.status}`)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground flex flex-wrap gap-2 text-[11px]">
                      <span>
                        {Object.keys(file.platform_counts ?? {}).length
                          ? Object.entries(file.platform_counts ?? {})
                              .map(
                                ([platform, count]) =>
                                  `${t(`admin.trendReplay.platform.${platform}`, { defaultValue: platform })}: ${count}`,
                              )
                              .join(" · ")
                          : t(
                              `admin.trendReplay.platform.${file.platform ?? "unknown"}`,
                              {
                                defaultValue: t(
                                  "admin.trendReplay.platform.unknown",
                                ),
                              },
                            )}
                      </span>
                      <span>
                        {t("admin.trendReplay.rawPosts", {
                          count: file.raw_posts,
                        })}
                      </span>
                      <span>
                        {t("admin.trendReplay.postCount", {
                          count: file.adapted_posts,
                        })}
                      </span>
                      <span>·</span>
                      <span>
                        {t("admin.trendReplay.batchCount", {
                          count: file.batches,
                        })}
                      </span>
                    </p>
                    {file.error && (
                      <p className="text-destructive text-[11px]">
                        {file.error}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              {/* Actions Footer inside Day Details */}
              <div className="border-border/40 flex flex-wrap items-center justify-between gap-2 border-t pt-2">
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
                    className="h-7 px-2.5 text-xs"
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
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span>{t("admin.trendReplay.results")}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-brand-orange font-mono">{resultDay}</span>
            </h3>
            {result.data?.candidates && (
              <Badge variant="secondary" className="font-mono text-xs">
                {t("admin.trendReplay.trendCount", {
                  count: result.data.candidates.length,
                })}
              </Badge>
            )}
          </div>

          {result.isPending && (
            <p role="status" className="text-muted-foreground text-sm">
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
                className="bg-muted/20 border-border/60 hover:border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 shadow-2xs transition-colors"
              >
                <span className="text-foreground font-semibold">
                  {c.rank}. {c.keyword}
                </span>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="bg-accent/60 border-border/40 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums">
                    {c.final_score.toFixed(2)}
                  </span>
                  {c.trend_id && (
                    <Link
                      to={`/admin?view=trendGraph&trendId=${encodeURIComponent(c.trend_id)}`}
                      className="text-brand-orange-fg inline-flex items-center gap-1 text-xs font-medium hover:underline"
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
