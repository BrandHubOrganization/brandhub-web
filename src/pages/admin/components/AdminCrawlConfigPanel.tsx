import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CalendarClock, Info, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";
import { errorCode } from "@/services/adminRevenueService";
import { AdminCrawlRunLog, CrawlLiveCard } from "./AdminCrawlRunLog";
import {
  adminCrawlConfigService,
  type CrawlConfig,
} from "@/services/adminCrawlConfigService";

const INTERVALS = [15, 30, 60, 180, 360, 720, 1440];
const CRON = /^(\S+\s+){4}\S+$/;
const PAGE = /^https:\/\/\S{1,292}$/;

/** SCR-ADM FR 3.7.9: the only AI setting owned by ADMIN; applies from the next crawl run. */
export function AdminCrawlConfigPanel() {
  const { t } = useTranslation();
  const config = useQuery({
    queryKey: ["admin-crawl-config"],
    queryFn: adminCrawlConfigService.get,
  });
  if (config.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (config.isError)
    return (
      <p role="alert" className="text-destructive text-sm">
        {t("admin.crawl.loadError")}
      </p>
    );
  return (
    <div className="space-y-6">
      <CrawlForm key={JSON.stringify(config.data)} saved={config.data} />
      <AdminCrawlRunLog />
    </div>
  );
}

function CrawlForm({ saved }: { saved: CrawlConfig }) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const [mode, setMode] = useState<"interval" | "cron">(
    saved.cron ? "cron" : "interval",
  );
  const [intervalMinutes, setIntervalMinutes] = useState(
    String(saved.intervalMinutes ?? 60),
  );
  const [cron, setCron] = useState(saved.cron ?? "0 */6 * * *");
  const [pages, setPages] = useState(saved.sourcePages.join("\n"));
  const [posts, setPosts] = useState(String(saved.postsPerRun));
  const pageList = pages
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const badPage = pageList.find((p) => !PAGE.test(p));
  const postsNumber = Number(posts);
  const errors = {
    cron:
      mode === "cron" && !CRON.test(cron.trim())
        ? t("admin.crawl.cronRule")
        : null,
    pages: badPage
      ? t("admin.crawl.pageRule", { page: badPage.slice(0, 60) })
      : pageList.length > 50
        ? t("admin.crawl.pageLimit")
        : null,
    posts:
      !Number.isInteger(postsNumber) || postsNumber < 10 || postsNumber > 1000
        ? t("admin.crawl.postsRule")
        : null,
  };
  const save = useMutation({
    mutationFn: () =>
      adminCrawlConfigService.update({
        ...(mode === "cron"
          ? { cron: cron.trim() }
          : { intervalMinutes: Number(intervalMinutes) }),
        sourcePages: pageList,
        postsPerRun: postsNumber,
      }),
    onSuccess: (data) => {
      client.setQueryData(["admin-crawl-config"], data);
      toast.success(t("admin.crawl.saved"));
    },
  });
  const code = errorCode(save.error);
  const intervalOptions = [
    ...new Set([...INTERVALS, saved.intervalMinutes ?? 60]),
  ].sort((a, b) => a - b);
  const nextRun = saved.nextRunAt
    ? new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date(saved.nextRunAt))
    : null;
  const status = saved.running
    ? "running"
    : !saved.enabled
      ? "disabled"
      : "noSources";

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_280px]">
      <form
        className="bg-card border-border space-y-6 rounded-xl border p-5 lg:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!errors.cron && !errors.pages && !errors.posts) save.mutate();
        }}
      >
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock className="text-brand-orange size-4" />
            {t("admin.crawl.schedule")}
          </h2>
          <div
            role="group"
            aria-label={t("admin.crawl.schedule")}
            className="bg-muted inline-flex rounded-lg p-1"
          >
            {(["interval", "cron"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  mode === m
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`admin.crawl.mode.${m}`)}
              </button>
            ))}
          </div>
          {mode === "interval" ? (
            <SelectMenu
              className="h-9 w-64 text-sm"
              ariaLabel={t("admin.crawl.mode.interval")}
              value={intervalMinutes}
              onChange={setIntervalMinutes}
              options={intervalOptions.map((m) => ({
                value: String(m),
                label:
                  m % 60 === 0
                    ? t("admin.crawl.everyHours", { count: m / 60 })
                    : t("admin.crawl.everyMinutes", { count: m }),
              }))}
            />
          ) : (
            <label className="block max-w-sm space-y-1.5 text-sm">
              <Input
                aria-label={t("admin.crawl.mode.cron")}
                value={cron}
                maxLength={100}
                className="font-mono"
                onChange={(e) => setCron(e.target.value)}
              />
              <span
                className={cn(
                  "block text-xs",
                  errors.cron || code === "INVALID_SCHEDULE"
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {errors.cron ??
                  (code === "INVALID_SCHEDULE"
                    ? t("admin.crawl.cronInvalid")
                    : t("admin.crawl.cronHint"))}
              </span>
            </label>
          )}
        </section>

        <label className="block space-y-1.5 text-sm font-semibold">
          <span>{t("admin.crawl.pages")}</span>
          <Textarea
            value={pages}
            rows={6}
            placeholder="https://www.facebook.com/groups/..."
            className="font-mono text-xs"
            onChange={(e) => setPages(e.target.value)}
          />
          <span
            className={cn(
              "flex justify-between text-xs font-normal",
              errors.pages ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <span>{errors.pages ?? t("admin.crawl.pagesHint")}</span>
            <span className="tabular-nums">{pageList.length}/50</span>
          </span>
        </label>

        <label className="block max-w-xs space-y-1.5 text-sm font-semibold">
          <span>{t("admin.crawl.postsPerRun")}</span>
          <Input
            type="number"
            min={10}
            max={1000}
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
          />
          <span
            className={cn(
              "block text-xs font-normal",
              errors.posts ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {errors.posts ?? t("admin.crawl.postsHint")}
          </span>
        </label>

        <div className="bg-muted/50 border-brand-orange flex gap-2 rounded-r-lg border-l-4 px-4 py-3 text-xs leading-5">
          <Info className="text-brand-orange mt-0.5 size-4 shrink-0" />
          <span>{t("admin.crawl.nextRunNote")}</span>
        </div>
        {save.isError && code !== "INVALID_SCHEDULE" && (
          <p role="alert" className="text-destructive text-sm">
            {t("admin.crawl.saveError")}
          </p>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            disabled={save.isPending}
          >
            {t("admin.crawl.save")}
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        <aside className="bg-card border-border space-y-4 rounded-xl border p-5 text-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <Radar className="text-brand-orange size-4" />
            {t("admin.crawl.status")}
          </h2>
          <p className="flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                status === "running" ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            {t(`admin.crawl.state.${status}`)}
          </p>
          {nextRun && (
            <p className="text-muted-foreground text-xs">
              {t("admin.crawl.nextRun", { date: nextRun })}
            </p>
          )}
          <div>
            <p className="text-muted-foreground mb-2 text-xs">
              {t("admin.crawl.sources")}
            </p>
            {saved.sources.length ? (
              <div className="flex flex-wrap gap-1.5">
                {saved.sources.map((s) => (
                  <span
                    key={s}
                    className="bg-muted rounded-full px-2 py-0.5 font-mono text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs">{t("admin.crawl.noSources")}</p>
            )}
          </div>
        </aside>
        <CrawlLiveCard />
      </div>
    </div>
  );
}
