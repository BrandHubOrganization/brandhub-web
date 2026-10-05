import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertTriangle, FlaskConical, Loader2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { errorCode } from "@/services/adminRevenueService";
import {
  adminCrawlConfigService,
  type CrawlRun,
} from "@/services/adminCrawlConfigService";

const STATUS_STYLE: Record<string, string> = {
  RUNNING: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  SUCCESS: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PARTIAL: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  FAILED: "bg-destructive/10 text-destructive",
};

/** Shared by the log and the live card so both read one poll. */
function useCrawlRuns() {
  return useQuery({
    queryKey: ["admin-crawl-runs"],
    queryFn: adminCrawlConfigService.runs,
    // Poll only while a run is in progress.
    refetchInterval: (query) => (query.state.data?.running ? 3000 : false),
  });
}

/** Side card: posts per page of the running crawl (live) or of the last one. */
export function CrawlLiveCard() {
  const { t } = useTranslation();
  const runs = useCrawlRuns();
  const run = runs.data?.running ?? runs.data?.history[0];
  if (!run) return null;
  const live = run.status === "RUNNING";
  return (
    <aside className="bg-card border-border space-y-3 rounded-xl border p-5 text-sm">
      <h2 className="flex items-center gap-2 font-semibold">
        {live ? (
          <Loader2 className="text-brand-orange size-4 animate-spin" />
        ) : (
          <ScrollText className="text-brand-orange size-4" />
        )}
        {t(live ? "admin.crawl.live.running" : "admin.crawl.live.last")}
      </h2>
      <p className="text-3xl font-semibold tabular-nums">
        {run.totalPosts}
        <span className="text-muted-foreground ml-1.5 text-xs font-normal">
          {t("admin.crawl.live.posts")}
        </span>
      </p>
      <ul className="space-y-1.5 text-xs">
        {run.pages.map((page, i) => (
          <li key={i} className="flex items-center justify-between gap-2">
            <span
              className="truncate font-mono"
              title={page.url ?? page.source}
            >
              {(page.url ?? page.source).replace(/^https:\/\/(www\.)?/, "")}
            </span>
            <span
              className={cn(
                "shrink-0 font-medium tabular-nums",
                page.error && "text-destructive",
              )}
              title={page.error ?? undefined}
            >
              {page.error ? t("admin.crawl.log.failed") : page.posts}
            </span>
          </li>
        ))}
        {(run.pending ?? []).map((url) => (
          <li
            key={url}
            className="text-muted-foreground flex items-center justify-between gap-2"
          >
            <span className="truncate font-mono">
              {url.replace(/^https:\/\/(www\.)?/, "")}
            </span>
            <Loader2 className="size-3 shrink-0 animate-spin" />
          </li>
        ))}
      </ul>
      {run.creditsRemaining != null && (
        <p className="text-muted-foreground text-xs">
          {t("admin.crawl.log.credits", { count: run.creditsRemaining })}
        </p>
      )}
    </aside>
  );
}

/** FR 3.7.9 run log: which pages each crawl visited, how many posts it got, and what failed. */
export function AdminCrawlRunLog() {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const runs = useCrawlRuns();
  const runNow = useMutation({
    mutationFn: adminCrawlConfigService.runNow,
    onSuccess: () => {
      toast.success(t("admin.crawl.log.started"));
      void client.invalidateQueries({ queryKey: ["admin-crawl-runs"] });
    },
    onError: (error) =>
      toast.error(
        t(
          errorCode(error) === "CRAWL_ALREADY_RUNNING"
            ? "admin.crawl.log.alreadyRunning"
            : "admin.crawl.log.startError",
        ),
      ),
  });
  const time = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "short",
          timeStyle: "medium",
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(new Date(iso))
      : "—";
  const running = runs.data?.running;
  const list = [...(running ? [running] : []), ...(runs.data?.history ?? [])];

  return (
    <section className="bg-card border-border max-w-5xl space-y-4 rounded-xl border p-5 lg:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ScrollText className="text-brand-orange size-4" />
          {t("admin.crawl.log.title")}
        </h2>
        {import.meta.env.DEV && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto gap-1.5 border-dashed"
            disabled={!!running || runNow.isPending}
            onClick={() => runNow.mutate()}
          >
            {running ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FlaskConical className="size-3.5" />
            )}
            {t(running ? "admin.crawl.log.running" : "admin.crawl.log.runNow")}
          </Button>
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        {t("admin.crawl.log.hint")}
      </p>

      {runs.isPending && <Skeleton className="h-32 rounded-lg" />}
      {runs.isError && (
        <p role="alert" className="text-destructive text-sm">
          {t("admin.crawl.log.loadError")}
        </p>
      )}
      {runs.isSuccess && list.length === 0 && (
        <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-8 text-center text-sm">
          {t("admin.crawl.log.empty")}
        </p>
      )}

      <ol className="space-y-3">
        {list.map((run) => (
          <RunItem key={run.id} run={run} time={time} />
        ))}
      </ol>
    </section>
  );
}

function RunItem({
  run,
  time,
}: {
  run: CrawlRun;
  time: (iso: string | null) => string;
}) {
  const { t } = useTranslation();
  const errors = [
    ...run.pages
      .filter((p) => p.error)
      .map((p) => `${p.url ?? p.source}: ${p.error}`),
    ...run.errors,
  ];
  return (
    <li className="border-border rounded-lg border">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-xs">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium",
            STATUS_STYLE[run.status],
          )}
        >
          {t(`admin.crawl.log.status.${run.status}`)}
        </span>
        <span className="font-medium">{time(run.startedAt)}</span>
        <span className="text-muted-foreground">
          {t(`admin.crawl.log.trigger.${run.trigger}`)}
        </span>
        <span className="ml-auto tabular-nums">
          {t("admin.crawl.log.totals", {
            pages: run.pages.length,
            posts: run.totalPosts,
          })}
        </span>
        {run.creditsRemaining != null && (
          <span className="text-muted-foreground tabular-nums">
            {t("admin.crawl.log.credits", { count: run.creditsRemaining })}
          </span>
        )}
      </div>
      {run.pages.length > 0 && (
        <table className="border-border w-full border-t text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-normal">
                {t("admin.crawl.log.page")}
              </th>
              <th className="px-4 py-2 text-right font-normal">
                {t("admin.crawl.log.posts")}
              </th>
            </tr>
          </thead>
          <tbody>
            {run.pages.map((page, i) => (
              <tr key={i} className="border-border border-t">
                <td className="max-w-0 truncate px-4 py-2 font-mono">
                  {page.url ?? page.source}
                </td>
                <td
                  className={cn(
                    "px-4 py-2 text-right tabular-nums",
                    page.error && "text-destructive",
                  )}
                >
                  {page.error ? t("admin.crawl.log.failed") : page.posts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {errors.length > 0 && (
        <div className="bg-destructive/5 border-border space-y-1 border-t px-4 py-3">
          {errors.map((error, i) => (
            <p
              key={i}
              className="text-destructive flex gap-1.5 font-mono text-xs break-all"
            >
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}
