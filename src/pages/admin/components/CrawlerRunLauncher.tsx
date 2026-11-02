import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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

function LauncherForm({ defaults }: { defaults: TrendPlatform[] }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [platforms, setPlatforms] = useState(defaults);
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
  return (
    <section className="border-border bg-card space-y-3 rounded-xl border p-4">
      <h2 className="font-semibold">{t("admin.crawler.runTitle")}</h2>
      <p className="text-muted-foreground text-sm">
        {t("admin.crawler.runHelp")}
      </p>
      <fieldset disabled={pending} className="flex flex-wrap gap-4">
        <legend className="sr-only">{t("admin.crawler.platforms")}</legend>
        {(["facebook", "threads", "tiktok"] as const).map((p) => (
          <label
            key={p}
            className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={platforms.includes(p)}
              onChange={(e) => {
                setPlatforms((old) =>
                  e.target.checked ? [...old, p] : old.filter((v) => v !== p),
                );
                request.current = crypto.randomUUID();
              }}
            />
            {t(`admin.trendSettings.platform.${p}`)}
          </label>
        ))}
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={test}
            onChange={(e) => {
              setTest(e.target.checked);
              request.current = crypto.randomUUID();
            }}
          />
          {t("admin.crawler.testMode")}
        </label>
      </fieldset>
      {blocked && (
        <p role="status" className="text-muted-foreground text-sm">
          {t("admin.crawler.fixChecks")}
        </p>
      )}
      {(prepare.isError || start.isError) && (
        <p role="alert" className="text-destructive">
          {t("admin.crawler.commandError")}
        </p>
      )}
      <Button
        variant="orange"
        disabled={pending || !platforms.length || blocked}
        loading={prepare.isPending}
        onClick={() => prepare.mutate()}
      >
        {t("admin.crawler.preview")}
      </Button>
      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!pending && !open) setPreview(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.crawler.confirmRun")}</DialogTitle>
            <DialogDescription>
              {t(
                preview?.publishesLive
                  ? "admin.crawler.liveWarning"
                  : "admin.crawler.testWarning",
              )}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <dl className="space-y-2 text-sm">
              <div>
                <dt>{t("admin.crawler.platforms")}</dt>
                <dd>
                  {preview.platforms
                    .map((p) => t(`admin.trendSettings.platform.${p}`))
                    .join(", ")}
                </dd>
              </div>
              <div>
                <dt>{t("admin.crawler.previewSources")}</dt>
                <dd>
                  {preview.sourceCount} × {preview.maxPostsPerSource}
                </dd>
              </div>
              {preview.platforms.includes("threads") && preview.threads && (
                <div>
                  <dt>{t("admin.trendSettings.platform.threads")}</dt>
                  <dd>
                    {t("admin.crawler.threadPreview", {
                      topics: preview.threads.maxTopics,
                      posts: preview.threads.maxPosts,
                      seconds: preview.threads.maxSeconds,
                    })}
                  </dd>
                </div>
              )}
              {preview.platforms.includes("tiktok") && preview.tiktok && (
                <div>
                  <dt>{t("admin.trendSettings.platform.tiktok")}</dt>
                  <dd>
                    {t("admin.crawler.tiktokPreview", {
                      pages: preview.tiktok.pagesPerHashtag,
                      posts: preview.tiktok.topPostsPerHashtag,
                    })}
                  </dd>
                </div>
              )}
            </dl>
          )}
          {start.isError && (
            <p role="alert" className="text-destructive">
              {t("admin.crawler.commandError")}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setPreview(null)}
            >
              {t("admin.crawler.cancel")}
            </Button>
            <Button
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
  return query.data ? <LauncherForm defaults={query.data.platforms} /> : null;
}
