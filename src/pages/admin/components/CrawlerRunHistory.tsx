import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { crawlerManagementService as service } from "@/pages/admin/services/crawlerManagementService";
import { trendPipelineService } from "@/pages/admin/services/trendPipelineService";
import type { RunPreview } from "@/pages/admin/types/crawlerManagement";

export function CrawlerRunHistory() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [selected, setSelected] = useState("");
  const [offset, setOffset] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [retry, setRetry] = useState<RunPreview | null>(null);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const runs = useQuery({
    queryKey: ["admin", "ai", "trend-pipeline-runs"],
    queryFn: ({ signal }) => trendPipelineService.runs(signal),
    refetchInterval: 5_000,
    retry: false,
  });
  const detail = useQuery({
    queryKey: ["admin", "crawler-detail", selected, offset],
    queryFn: ({ signal }) => service.detail(selected, offset, signal),
    enabled: Boolean(selected),
    refetchInterval: 5_000,
    retry: false,
  });
  const stop = useMutation({
    mutationFn: () => service.stop(selected),
    retry: false,
    onSuccess: () => {
      setConfirm(false);
      void client.invalidateQueries({
        queryKey: ["admin", "ai", "trend-pipeline-runs"],
      });
    },
  });
  const retryPreview = useMutation({
    mutationFn: () =>
      service.preview({
        platforms: ["facebook"],
        test: false,
        retryRunId: selected,
      }),
    retry: false,
    onSuccess: setRetry,
  });
  const retryStart = useMutation({
    mutationFn: () =>
      service.start({
        platforms: ["facebook"],
        test: false,
        retryRunId: selected,
        revision: retry!.revision,
        sourceRevision: retry!.sourceRevision,
        requestId,
      }),
    retry: false,
    onSuccess: () => {
      setRetry(null);
      setRequestId(crypto.randomUUID());
      void client.invalidateQueries({
        queryKey: ["admin", "ai", "trend-pipeline-runs"],
      });
    },
  });
  const rows = [
    ...(runs.data?.running ? [runs.data.running] : []),
    ...(runs.data?.history ?? []),
  ];
  const filtered = rows.filter(
    (r) =>
      (!search || r.platforms?.some((p) => p.platform === search)) &&
      (!status || r.status === status) &&
      (!date || r.startedAt?.startsWith(date)),
  );
  const canStop = runs.data?.running?.id === selected;
  return (
    <section className="border-border bg-card space-y-4 rounded-xl border p-5 shadow-xs">
      <div className="border-border/60 flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="text-sm font-semibold">{t("admin.crawler.historyTitle")}</h2>
        <div className="grid w-full items-end gap-3 sm:grid-cols-3 lg:max-w-2xl">
          <label className="space-y-1 text-xs font-medium">
            <span className="block">{t("admin.crawler.platforms")}</span>
            <select
              className="border-input bg-background block h-9 w-full rounded-md border px-2.5 text-xs"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHistoryPage(0);
              }}
            >
              <option value="">{t("admin.crawler.all")}</option>
              {["facebook", "threads", "tiktok"].map((p) => (
                <option key={p} value={p}>
                  {t(`admin.trendSettings.platform.${p}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium">
            <span className="block">{t("admin.crawler.status")}</span>
            <select
              className="border-input bg-background block h-9 w-full rounded-md border px-2.5 text-xs"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setHistoryPage(0);
              }}
            >
              <option value="">{t("admin.crawler.all")}</option>
              {[
                "RUNNING",
                "COMPLETED",
                "PARTIAL",
                "FAILED",
                "INTERRUPTED",
              ].map((s) => (
                <option key={s} value={s}>
                  {t(
                    `admin.trendPipeline.stage.${s === "RUNNING" ? "CRAWLING" : s}`,
                  )}
                </option>
              ))}
            </select>
          </label>
          <Input
            type="date"
            label={t("admin.crawler.date")}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setHistoryPage(0);
            }}
          />
        </div>
      </div>
      {runs.isError && <p role="alert">{t("admin.crawler.loadError")}</p>}
      {!filtered.length ? (
        <div className="border-border/60 bg-muted/20 text-muted-foreground rounded-xl border border-dashed py-10 text-center text-sm">
          {t("admin.crawler.emptyHistory")}
        </div>
      ) : (
        <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              {filtered
                .slice(historyPage * 20, (historyPage + 1) * 20)
                .map((run) => (
                  <Button
                    variant={selected === run.id ? "orange" : "outline"}
                    className="justify-between text-xs"
                    key={run.id}
                    onClick={() => {
                      setSelected(run.id);
                      setOffset(0);
                      stop.reset();
                      retryPreview.reset();
                      setRequestId(crypto.randomUUID());
                    }}
                  >
                    <span className="font-mono">
                      {run.pipelineRunId ?? run.id.slice(0, 8)}
                    </span>
                    <span className="truncate">
                      · {t(`admin.trendPipeline.stage.${run.stage}`)}
                    </span>
                  </Button>
                ))}
            </div>
            {filtered.length > 20 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!historyPage}
                  onClick={() => setHistoryPage((p) => p - 1)}
                >
                  {t("admin.crawler.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(historyPage + 1) * 20 >= filtered.length}
                  onClick={() => setHistoryPage((p) => p + 1)}
                >
                  {t("admin.crawler.next")}
                </Button>
              </div>
            )}
          </div>

          <div className="min-w-0">
            {selected ? (
              <div className="border-border/70 bg-muted/15 space-y-3 rounded-xl border p-4">
                {detail.isError && (
                  <p role="alert">{t("admin.crawler.loadError")}</p>
                )}
                {detail.data && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm">
                        {t("admin.crawler.runIdentity")}:{" "}
                        <code className="font-mono text-xs">{selected}</code>
                        {detail.data.snapshot.test &&
                          ` · ${t("admin.crawler.testMode")}`}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t("admin.crawler.sessionVersion")}:{" "}
                        {Object.entries(
                          detail.data.snapshot.credentialVersions ?? {},
                        )
                          .map(
                            ([kind, version]) =>
                              `${kind}: ${version.slice(0, 8)}`,
                          )
                          .join(" · ") || t("admin.crawler.unknown")}
                      </p>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {detail.data.run.pages.map((source) => (
                        <li
                          key={source.name}
                          className="border-border bg-card rounded-lg border p-2.5 text-xs"
                        >
                          <strong>{source.name}</strong> ·{" "}
                          {t(
                            `admin.trendSettings.collectionStatus.${source.status.toUpperCase()}`,
                            { defaultValue: t("admin.crawler.unknown") },
                          )}{" "}
                          ·{" "}
                          {t("admin.trendPipeline.posts", {
                            count: source.posts,
                          })}
                        </li>
                      ))}
                    </ul>
                    <pre
                      className="bg-muted max-h-80 overflow-auto rounded-md p-3 text-xs break-words whitespace-pre-wrap"
                      aria-label={t("admin.crawler.events")}
                    >
                      {detail.data.events.map((e) => e.message).join("\n") ||
                        t("admin.crawler.noEvents")}
                    </pre>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!offset}
                        onClick={() => setOffset(Math.max(0, offset - 100))}
                      >
                        {t("admin.crawler.previous")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={detail.data.nextOffset === null}
                        onClick={() => setOffset(detail.data!.nextOffset!)}
                      >
                        {t("admin.crawler.next")}
                      </Button>
                      {canStop && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            stop.isPending ||
                            stop.isSuccess ||
                            runs.data?.running?.stopRequested
                          }
                          onClick={() => setConfirm(true)}
                        >
                          {t(
                            stop.isSuccess || runs.data?.running?.stopRequested
                              ? "admin.crawler.stopRequested"
                              : "admin.crawler.stop",
                          )}
                        </Button>
                      )}
                      {!canStop &&
                        detail.data.run.pages.some((p) =>
                          ["failed", "interrupted", "partial"].includes(
                            p.status,
                          ),
                        ) && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              retryPreview.isPending ||
                              Boolean(runs.data?.running)
                            }
                            onClick={() => retryPreview.mutate()}
                          >
                            {t("admin.crawler.retry")}
                          </Button>
                        )}
                    </div>
                    {retryPreview.isError && (
                      <p role="alert">{t("admin.crawler.commandError")}</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="border-border/60 bg-muted/20 text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center text-xs">
                <History className="size-6 opacity-40" aria-hidden="true" />
                <p>{t("admin.crawler.events")}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.crawler.stop")}</DialogTitle>
            <DialogDescription>{t("admin.crawler.stopHelp")}</DialogDescription>
          </DialogHeader>
          {stop.isError && (
            <p role="alert">{t("admin.crawler.commandError")}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={stop.isPending}
              onClick={() => setConfirm(false)}
            >
              {t("admin.crawler.cancel")}
            </Button>
            <Button disabled={stop.isPending} onClick={() => stop.mutate()}>
              {t("admin.crawler.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={retry !== null}
        onOpenChange={(open) => {
          if (!retryStart.isPending && !open) setRetry(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.crawler.retry")}</DialogTitle>
            <DialogDescription>
              {t("admin.crawler.retryHelp")} {t("admin.crawler.liveWarning")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            {t("admin.crawler.previewSources")}: {retry?.sourceCount} ×{" "}
            {retry?.maxPostsPerSource}
          </p>
          {retryStart.isError && (
            <p role="alert">{t("admin.crawler.commandError")}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={retryStart.isPending}
              onClick={() => setRetry(null)}
            >
              {t("admin.crawler.cancel")}
            </Button>
            <Button
              disabled={retryStart.isPending}
              onClick={() => retryStart.mutate()}
            >
              {t("admin.crawler.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
