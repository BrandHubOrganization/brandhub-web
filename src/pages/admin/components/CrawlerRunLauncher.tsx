import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowRight,
  Info,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTrendSettings } from "@/pages/admin/hooks/useTrendSettings";
import { crawlerManagementService as service } from "@/pages/admin/services/crawlerManagementService";
import type { TrendPlatform } from "@/pages/admin/types/trendSettings";
import type { RunPreview } from "@/pages/admin/types/crawlerManagement";

function LauncherForm({ platforms }: { platforms: TrendPlatform[] }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [, setParams] = useSearchParams();
  const [preview, setPreview] = useState<RunPreview | null>(null);
  const request = useRef(crypto.randomUUID());

  const health = useQuery({
    queryKey: ["admin", "crawler-health"],
    queryFn: ({ signal }) => service.health(signal),
    staleTime: 10_000,
    retry: false,
  });

  const prepare = useMutation({
    mutationFn: () => service.preview({ platforms, test: false }),
    onSuccess: setPreview,
    retry: false,
  });

  const start = useMutation({
    mutationFn: () =>
      service.start({
        platforms,
        test: false,
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

  const failingChecks = (health.data?.checks ?? []).filter((c) => {
    if (c.status === "OK") return false;
    if (c.platform) return platforms.includes(c.platform as TrendPlatform);
    if (c.component === "tiktok") return platforms.includes("tiktok");
    if (c.component === "proxy" || c.component === "browser")
      return platforms.some((p) => p !== "tiktok");
    return c.required;
  });

  const blocked = !health.data || failingChecks.length > 0;

  const navigateToFix = (component: string, platform?: string | null) => {
    if (component === "configuration") {
      setParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("crawlerTab", "settings");
        return next;
      });
      return;
    }
    const targetKind =
      component === "session" && (platform === "facebook" || platform === "threads")
        ? platform
        : component === "proxy" || component === "tiktok"
          ? component
          : null;
    if (targetKind) {
      document
        .getElementById(`crawler-credential-${targetKind}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section className="border-border bg-card flex h-full flex-col justify-between space-y-3 rounded-xl border p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Rocket className="text-brand-orange size-4 shrink-0" />
          <h2 className="text-foreground text-sm font-semibold tracking-tight">
            {t("admin.crawler.runTitle")}
          </h2>
        </div>

        <Button
          variant="orange"
          size="sm"
          className="h-9 font-medium shadow-xs"
          disabled={pending || !platforms.length || blocked}
          loading={prepare.isPending}
          onClick={() => prepare.mutate()}
        >
          <Sparkles className="size-4" />
          {t("admin.crawler.preview")}
        </Button>
      </div>

      {/* Unmet configuration checks with direct navigation */}
      {failingChecks.length > 0 && (
        <div
          role="status"
          className="border-destructive/30 bg-destructive/5 space-y-2 rounded-lg border p-3 text-xs"
        >
          <div className="text-destructive flex items-center justify-between gap-2 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>{t("admin.crawler.fixChecks")}</span>
            </span>
          </div>

          <ul className="grid gap-1.5 sm:grid-cols-2">
            {failingChecks.map((check) => {
              const title =
                t(`admin.crawler.components.${check.component}`, {
                  defaultValue: check.component,
                }) +
                (check.platform
                  ? ` · ${t(`admin.trendSettings.platform.${check.platform}`)}`
                  : "");
              const message = t(`admin.crawler.codes.${check.code}`, {
                defaultValue: t("admin.crawler.checkUnavailable"),
              });
              return (
                <li key={`${check.component}-${check.platform ?? ""}`}>
                  <button
                    type="button"
                    onClick={() => navigateToFix(check.component, check.platform)}
                    className="border-border/80 bg-card hover:border-brand-orange/40 flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-foreground block truncate font-semibold">
                        {title}
                      </span>
                      <span className="text-muted-foreground block truncate text-[11px]">
                        {message}
                      </span>
                    </div>
                    <ArrowRight className="text-brand-orange size-3.5 shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Action error */}
      {(prepare.isError || start.isError) && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border p-3 text-xs font-medium"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p className="leading-relaxed">{t("admin.crawler.commandError")}</p>
        </div>
      )}

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
              {preview.publishesLive ? (
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
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
      <div className="border-border bg-card flex items-center justify-between gap-4 rounded-xl border p-4 shadow-xs">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    );
  }

  return query.data ? <LauncherForm platforms={query.data.platforms} /> : null;
}
