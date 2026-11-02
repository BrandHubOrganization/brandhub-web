import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Check,
  FlaskConical,
  Info,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTrendSettings } from "@/pages/admin/hooks/useTrendSettings";
import { crawlerManagementService as service } from "@/pages/admin/services/crawlerManagementService";
import type { TrendPlatform } from "@/pages/admin/types/trendSettings";
import type { RunPreview } from "@/pages/admin/types/crawlerManagement";

const PLATFORM_ITEMS: Array<{
  id: TrendPlatform;
  badge: string;
}> = [
  { id: "facebook", badge: "FB" },
  { id: "threads", badge: "TH" },
  { id: "tiktok", badge: "TT" },
];

function LauncherForm({ defaults }: { defaults: TrendPlatform[] }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [platforms, setPlatforms] = useState<TrendPlatform[]>(defaults);
  const [test, setTest] = useState(true);
  const [preview, setPreview] = useState<RunPreview | null>(null);
  const request = useRef(crypto.randomUUID());

  const health = useQuery({
    queryKey: ["admin", "crawler-health"],
    queryFn: ({ signal }) => service.health(signal),
    staleTime: 10_000,
    retry: false,
  });

  const prepare = useMutation({
    mutationFn: () => service.preview({ platforms, test }),
    onSuccess: setPreview,
    retry: false,
  });

  const start = useMutation({
    mutationFn: () =>
      service.start({
        platforms,
        test,
        revision: preview!.revision,
        sourceRevision: preview!.sourceRevision,
        requestId: request.current,
      }),
    retry: false,
    onSuccess: () => {
      request.current = crypto.randomUUID();
      setPreview(null);
      void client.invalidateQueries({
        queryKey: ["admin", "ai", "trend-pipeline"],
      });
      void client.invalidateQueries({
        queryKey: ["admin", "ai", "trend-pipeline-runs"],
      });
    },
  });

  const pending = prepare.isPending || start.isPending;
  const blocked =
    !health.data ||
    health.data.checks.some((c) => {
      if (c.platform)
        return (
          platforms.includes(c.platform as TrendPlatform) && c.status !== "OK"
        );
      if (c.component === "tiktok")
        return platforms.includes("tiktok") && c.status !== "OK";
      if (c.component === "proxy" || c.component === "browser")
        return platforms.some((p) => p !== "tiktok") && c.status !== "OK";
      return c.required && c.status !== "OK";
    });

  const togglePlatform = (p: TrendPlatform) => {
    setPlatforms((old) =>
      old.includes(p) ? old.filter((v) => v !== p) : [...old, p],
    );
    request.current = crypto.randomUUID();
  };

  return (
    <section className="border-border bg-card space-y-4 rounded-xl border p-5 shadow-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Rocket className="text-brand-orange size-4 shrink-0" />
          <h2 className="font-semibold text-foreground text-sm tracking-tight">
            {t("admin.crawler.runTitle")}
          </h2>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t("admin.crawler.runHelp")}
        </p>
      </div>

      {/* Platform Toggle Chips */}
      <div className="space-y-2">
        <label className="text-muted-foreground block text-xs font-medium">
          {t("admin.crawler.platforms")}
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {PLATFORM_ITEMS.map(({ id, badge }) => {
            const isSelected = platforms.includes(id);
            return (
              <button
                key={id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                disabled={pending}
                onClick={() => togglePlatform(id)}
                className={cn(
                  "relative flex min-h-12 cursor-pointer flex-col justify-between rounded-lg border p-2.5 text-left transition-all select-none disabled:cursor-not-allowed disabled:opacity-50",
                  isSelected
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange/30 shadow-xs"
                    : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
                )}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span
                    className={cn(
                      "font-mono text-[10px] font-bold tracking-wider",
                      isSelected ? "text-brand-orange" : "text-muted-foreground/70",
                    )}
                  >
                    {badge}
                  </span>
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full transition-colors",
                      isSelected
                        ? "bg-brand-orange text-white"
                        : "border-border border bg-muted/40",
                    )}
                  >
                    {isSelected && <Check className="size-2.5 stroke-[3]" />}
                  </span>
                </div>
                <span className="mt-1 text-xs font-medium">
                  {t(`admin.trendSettings.platform.${id}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Separate Test Mode (Dry-run) Box */}
      <div className="border-border/80 bg-muted/20 flex flex-col justify-between gap-3 rounded-lg border p-3.5 sm:flex-row sm:items-center">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <FlaskConical className="text-muted-foreground size-3.5 shrink-0" />
            <span className="text-foreground text-xs font-semibold">
              {t("admin.crawler.testMode")}
            </span>
            {test ? (
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold"
              >
                DRY RUN
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-brand-orange/40 bg-brand-orange/10 text-brand-orange font-mono text-[10px] font-bold"
              >
                LIVE RUN
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            {test
              ? "Chế độ chạy thử nghiệm (không ghi vào cơ sở dữ liệu chính)."
              : "Dữ liệu cào sẽ được nạp trực tiếp vào pipeline phân tích xu hướng trực tiếp."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Switch
            id="crawler-test-mode"
            checked={test}
            disabled={pending}
            onCheckedChange={(checked) => {
              setTest(checked);
              request.current = crypto.randomUUID();
            }}
          />
        </div>
      </div>

      {/* Health check warning */}
      {blocked && (
        <div
          role="status"
          className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border p-3 text-xs"
        >
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{t("admin.crawler.fixChecks")}</p>
        </div>
      )}

      {/* Action error */}
      {(prepare.isError || start.isError) && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border p-3 text-xs font-medium"
        >
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{t("admin.crawler.commandError")}</p>
        </div>
      )}

      {/* Launch Action */}
      <Button
        variant="orange"
        className="w-full font-medium shadow-xs sm:w-auto"
        disabled={pending || !platforms.length || blocked}
        loading={prepare.isPending}
        onClick={() => prepare.mutate()}
      >
        <Sparkles className="size-4" />
        {t("admin.crawler.preview")}
      </Button>

      {/* Modern Dialog Preview */}
      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!pending && !open) setPreview(null);
        }}
      >
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="text-brand-orange size-4 shrink-0" />
              {t("admin.crawler.confirmRun")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t(
                preview?.publishesLive
                  ? "admin.crawler.liveWarning"
                  : "admin.crawler.testWarning",
              )}
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <div className="space-y-4 py-1">
              {/* Alert Warning Box */}
              {preview.publishesLive ? (
                <div className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex items-start gap-3 rounded-lg border p-3.5">
                  <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 size-5 shrink-0" />
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      Chế độ ghi dữ liệu chính thức (Live Production)
                    </p>
                    <p className="leading-relaxed opacity-95">
                      {t("admin.crawler.liveWarning")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-border bg-muted/40 text-muted-foreground flex items-start gap-3 rounded-lg border p-3">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <p className="text-xs leading-relaxed">
                    {t("admin.crawler.testWarning")}
                  </p>
                </div>
              )}

              {/* Param Cards */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="border-border/70 bg-card space-y-1.5 rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs font-medium">
                    {t("admin.crawler.platforms")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.platforms.map((p) => (
                      <span
                        key={p}
                        className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange rounded border px-2 py-0.5 text-xs font-semibold capitalize"
                      >
                        {t(`admin.trendSettings.platform.${p}`)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-border/70 bg-card space-y-1.5 rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs font-medium">
                    {t("admin.crawler.previewSources")}
                  </span>
                  <p className="text-foreground text-sm font-semibold">
                    {preview.sourceCount}{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      nguồn ×
                    </span>{" "}
                    {preview.maxPostsPerSource}{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      bài/nguồn
                    </span>
                  </p>
                </div>

                {preview.platforms.includes("threads") && preview.threads && (
                  <div className="border-border/70 bg-card space-y-1.5 rounded-lg border p-3 sm:col-span-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      {t("admin.trendSettings.platform.threads")}
                    </span>
                    <p className="text-foreground text-xs font-medium">
                      {t("admin.crawler.threadPreview", {
                        topics: preview.threads.maxTopics,
                        posts: preview.threads.maxPosts,
                        seconds: preview.threads.maxSeconds,
                      })}
                    </p>
                  </div>
                )}

                {preview.platforms.includes("tiktok") && preview.tiktok && (
                  <div className="border-border/70 bg-card space-y-1.5 rounded-lg border p-3 sm:col-span-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      {t("admin.trendSettings.platform.tiktok")}
                    </span>
                    <p className="text-foreground text-xs font-medium">
                      {t("admin.crawler.tiktokPreview", {
                        pages: preview.tiktok.pagesPerHashtag,
                        posts: preview.tiktok.topPostsPerHashtag,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {start.isError && (
            <p role="alert" className="text-destructive text-xs font-medium">
              {t("admin.crawler.commandError")}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setPreview(null)}
            >
              {t("admin.crawler.cancel")}
            </Button>
            <Button
              variant="orange"
              disabled={pending}
              loading={start.isPending}
              onClick={() => start.mutate()}
            >
              {t("admin.crawler.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function CrawlerRunLauncher() {
  const { query } = useTrendSettings();

  if (query.isPending) {
    return (
      <div className="border-border bg-card space-y-4 rounded-xl border p-5 shadow-xs">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    );
  }

  return query.data ? <LauncherForm defaults={query.data.platforms} /> : null;
}
