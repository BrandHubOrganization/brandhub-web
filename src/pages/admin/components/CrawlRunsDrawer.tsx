import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Calendar,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  crawlConfigService,
  type CrawlRunItem,
} from "@/pages/admin/services/crawlConfigService";

interface CrawlRunsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateTime(isoString?: string | null, lang = "vi") {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.valueOf())) return "—";
  return new Intl.DateTimeFormat(lang, {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

function calculateDuration(
  startedAt?: string | null,
  finishedAt?: string | null,
) {
  if (!startedAt) return undefined;
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return undefined;
  const seconds = Math.round((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  return `${minutes}m ${remainingSecs}s`;
}

function RunStatusBadge({ status }: { status: string }) {
  const norm = status.toUpperCase();
  if (norm === "RUNNING") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium animate-pulse"
      >
        <span className="mr-1.5 size-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
        {status}
      </Badge>
    );
  }
  if (norm === "COMPLETED" || norm === "SUCCESS") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
      >
        <CheckCircle2 className="mr-1 size-3" />
        {status}
      </Badge>
    );
  }
  if (norm === "FAILED" || norm === "ERROR") {
    return (
      <Badge
        variant="outline"
        className="border-destructive/40 bg-destructive/10 text-destructive font-medium"
      >
        <AlertTriangle className="mr-1 size-3" />
        {status}
      </Badge>
    );
  }
  return <Badge variant="secondary">{status}</Badge>;
}

export function CrawlRunsDrawer({ open, onOpenChange }: CrawlRunsDrawerProps) {
  const { t, i18n } = useTranslation();

  const runsQuery = useQuery({
    queryKey: ["admin", "ai", "crawl-runs"],
    queryFn: ({ signal }) => crawlConfigService.getRuns(signal),
    enabled: open,
    refetchInterval: (q) => (q.state.data?.running ? 3000 : 15000),
  });

  const running = runsQuery.data?.running;
  const history = runsQuery.data?.history ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="border-border border-b px-6 py-4">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="space-y-1">
              <SheetTitle className="text-lg font-semibold tracking-tight">
                {t("admin.crawlRuns.title", {
                  defaultValue: "Crawl Runs & History",
                })}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {t("admin.crawlRuns.description", {
                  defaultValue:
                    "Monitor ongoing pipeline crawls and historical batch executions.",
                })}
              </SheetDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runsQuery.refetch()}
              disabled={runsQuery.isFetching}
              className="shrink-0 h-8 gap-1.5"
            >
              <RefreshCw
                className={`size-3.5 ${runsQuery.isFetching ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span className="text-xs">
                {t("admin.trends.refresh", { defaultValue: "Refresh" })}
              </span>
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Active / Running Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                <Activity className="size-3.5 text-primary" />
                {t("admin.crawlRuns.activeRun", {
                  defaultValue: "Current Execution",
                })}
              </h3>
              {running && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  {t("admin.crawlRuns.inProgress", {
                    defaultValue: "Running in background",
                  })}
                </span>
              )}
            </div>

            {running ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px]">
                      Run ID
                    </span>
                    <p className="font-mono text-xs font-semibold [overflow-wrap:anywhere]">
                      {running.id}
                    </p>
                  </div>
                  <RunStatusBadge status={running.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="rounded-lg bg-card/60 border border-border/50 p-2.5">
                    <span className="text-muted-foreground text-[10px] block">
                      {t("admin.crawlRuns.trigger", { defaultValue: "Trigger" })}
                    </span>
                    <span className="font-medium font-mono text-xs">
                      {running.trigger}
                    </span>
                  </div>
                  <div className="rounded-lg bg-card/60 border border-border/50 p-2.5">
                    <span className="text-muted-foreground text-[10px] block">
                      {t("admin.crawlRuns.posts", { defaultValue: "Posts" })}
                    </span>
                    <span className="font-mono font-semibold text-xs">
                      {running.totalPosts}
                    </span>
                  </div>
                  <div className="rounded-lg bg-card/60 border border-border/50 p-2.5">
                    <span className="text-muted-foreground text-[10px] block">
                      {t("admin.crawlRuns.deduped", { defaultValue: "Deduped" })}
                    </span>
                    <span className="font-mono font-semibold text-xs">
                      {running.deduped}
                    </span>
                  </div>
                  <div className="rounded-lg bg-card/60 border border-border/50 p-2.5">
                    <span className="text-muted-foreground text-[10px] block">
                      {t("admin.crawlRuns.duration", { defaultValue: "Elapsed" })}
                    </span>
                    <span className="font-mono text-xs">
                      {calculateDuration(running.startedAt, running.finishedAt) ??
                        "—"}
                    </span>
                  </div>
                </div>

                {running.startedAt && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <Clock className="size-3" />
                    <span>
                      {t("admin.crawlRuns.startedAt", {
                        defaultValue: "Started:",
                      })}{" "}
                      {formatDateTime(running.startedAt, i18n.language)}
                    </span>
                  </div>
                )}

                {running.pages?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border/40">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {t("admin.crawlRuns.pagesCrawled", {
                        count: running.pages.length,
                        defaultValue: `Pages crawled (${running.pages.length})`,
                      })}
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1 text-xs">
                      {running.pages.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded bg-muted/40 px-2 py-1 text-[11px]"
                        >
                          <span className="truncate max-w-[240px]" title={p.url}>
                            {p.name || p.url || `Page #${idx + 1}`}
                          </span>
                          <span className="font-mono text-muted-foreground shrink-0">
                            {p.posts ?? 0} posts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {running.errors?.length > 0 && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-[11px]">
                      <AlertTriangle className="size-3.5" />
                      <span>Errors ({running.errors.length})</span>
                    </div>
                    {running.errors.map((err, idx) => (
                      <p key={idx} className="text-[11px] [overflow-wrap:anywhere]">
                        {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-4 text-center">
                <p className="text-muted-foreground text-xs">
                  {t("admin.crawlRuns.noActive", {
                    defaultValue: "No crawl is currently running in background.",
                  })}
                </p>
              </div>
            )}
          </section>

          {/* History Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              {t("admin.crawlRuns.history", {
                defaultValue: "Execution History",
              })}
            </h3>

            {runsQuery.isPending ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : runsQuery.isError ? (
              <div className="rounded-xl border border-destructive/30 bg-card p-4 space-y-2 text-center">
                <p className="text-destructive text-xs font-medium">
                  {t("admin.crawlRuns.errorLoad", {
                    defaultValue: "Failed to load crawl runs history.",
                  })}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runsQuery.refetch()}
                >
                  {t("admin.trends.retry", { defaultValue: "Retry" })}
                </Button>
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center space-y-1.5">
                <FileText className="mx-auto size-6 text-muted-foreground/60" />
                <p className="text-muted-foreground text-xs">
                  {t("admin.crawlRuns.emptyHistory", {
                    defaultValue: "No historical runs recorded.",
                  })}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((run: CrawlRunItem) => {
                  const duration = calculateDuration(
                    run.startedAt,
                    run.finishedAt,
                  );
                  return (
                    <article
                      key={run.id}
                      className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 hover:border-border/80 transition-colors shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <RunStatusBadge status={run.status} />
                          <span className="font-mono text-xs font-semibold truncate max-w-[180px] sm:max-w-[240px]">
                            {run.id}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {run.trigger}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDateTime(run.startedAt, i18n.language)}
                        </span>
                        {duration && (
                          <span className="font-mono">
                            {t("admin.crawlRuns.durationLabel", {
                              defaultValue: "Duration:",
                            })}{" "}
                            {duration}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Layers className="size-3" />
                          <strong className="text-foreground font-mono">
                            {run.totalPosts}
                          </strong>{" "}
                          posts ({run.deduped} deduped)
                        </span>
                      </div>

                      {run.pages?.length > 0 && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span>
                            {t("admin.crawlRuns.sources", {
                              defaultValue: "Sources:",
                            })}{" "}
                            <strong className="text-foreground">
                              {run.pages.length}
                            </strong>{" "}
                            pages
                          </span>
                        </div>
                      )}

                      {run.errors?.length > 0 && (
                        <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-[11px] text-destructive space-y-0.5">
                          <span className="font-medium block">
                            {run.errors.length} error(s) occurred:
                          </span>
                          <p className="truncate [overflow-wrap:anywhere]">
                            {run.errors[0]}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
