import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Zap,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { CrawlRunsDrawer } from "@/pages/admin/components/CrawlRunsDrawer";
import { crawlConfigService } from "@/pages/admin/services/crawlConfigService";
import type { useTrendView } from "@/pages/admin/hooks/useTrendView";

export function AdminTrendSummary({
  query,
}: {
  query: ReturnType<typeof useTrendView>["summary"];
}) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const triggerMutation = useMutation({
    mutationFn: () => crawlConfigService.runNow(),
    onSuccess: () => {
      setConfirmOpen(false);
      toast.success(
        t("admin.crawlRuns.triggerSuccess", {
          defaultValue: "Crawl run triggered successfully!",
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "ai", "crawl-runs"] });
      setDrawerOpen(true);
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const message =
        axiosError?.response?.data?.error?.message ||
        axiosError?.message ||
        "";
      if (message.includes("CRAWL_ALREADY_RUNNING")) {
        toast.error(
          t("admin.crawlRuns.alreadyRunning", {
            defaultValue: "A crawl run is already in progress.",
          }),
        );
      } else {
        toast.error(
          t("admin.crawlRuns.triggerError", {
            defaultValue: "Failed to trigger crawl run. Check service connectivity.",
          }),
        );
      }
    },
  });

  const renderActionButtons = () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="default"
        size="sm"
        className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium shadow-2xs"
        onClick={() => setConfirmOpen(true)}
      >
        <Zap className="size-3.5 fill-current" aria-hidden="true" />
        {t("admin.crawlRuns.triggerCrawl", {
          defaultValue: "Kích hoạt Crawl",
        })}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs font-medium"
        onClick={() => setDrawerOpen(true)}
      >
        <History className="size-3.5" aria-hidden="true" />
        {t("admin.crawlRuns.historyButton", {
          defaultValue: "Lịch sử Crawl",
        })}
      </Button>
    </div>
  );

  const latest = query.data?.latest_run;

  return (
    <>
      <div className="w-full">
        {query.isPending && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <p role="status" className="text-muted-foreground text-sm">
              {t("admin.loading")}
            </p>
            {renderActionButtons()}
          </div>
        )}

        {query.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-card p-4">
            <p role="status" className="text-muted-foreground text-sm">
              {t("admin.trends.summaryError")}
            </p>
            {renderActionButtons()}
          </div>
        )}

        {query.isSuccess && !latest && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <p className="text-muted-foreground text-sm">
              {t("admin.trends.noPublication")}
            </p>
            {renderActionButtons()}
          </div>
        )}

        {query.isSuccess && latest && (
          (() => {
            const published = latest.published_at && new Date(latest.published_at);
            const formatted =
              published && !Number.isNaN(published.valueOf())
                ? new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Ho_Chi_Minh",
                  }).format(published)
                : undefined;

            return (
              <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xs p-4 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="size-3.5" />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("admin.trends.latest", {
                          defaultValue: "Latest published snapshot (system-wide)",
                        })}
                      </h2>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {latest.run_id}
                      </span>
                    </div>
                  </div>
                  {renderActionButtons()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="rounded-lg border border-border/50 bg-background/50 p-2.5 space-y-1">
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <Clock className="size-3" />
                      {t("admin.trends.publishedTime", {
                        defaultValue: "Thời gian công bố",
                      })}
                    </span>
                    <p className="font-medium text-foreground">
                      {formatted ? `${formatted} · Asia/Ho_Chi_Minh` : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-background/50 p-2.5 space-y-1">
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      {t("admin.trends.publicationStatus", {
                        defaultValue: "Publication status",
                      })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium capitalize text-[11px]"
                      >
                        {latest.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-background/50 p-2.5 space-y-1">
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <GitBranch className="size-3" />
                      {t("admin.trendReplay.resolution", {
                        defaultValue: "Entity Resolution",
                      })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {latest.entity_resolution ? (
                        <Badge
                          variant="secondary"
                          className="font-mono text-[11px] capitalize"
                        >
                          {latest.entity_resolution.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Crawl Runs History Drawer */}
      <CrawlRunsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* Manual Trigger Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Zap className="size-4 text-primary fill-current" />
              {t("admin.crawlRuns.confirmTitle", {
                defaultValue: "Kích hoạt Thu thập Dữ liệu (Crawl)",
              })}
            </DialogTitle>
            <DialogDescription className="text-xs pt-1.5 leading-relaxed">
              {t("admin.crawlRuns.confirmDesc", {
                defaultValue:
                  "Hành động này sẽ khởi động một tiến trình crawl xu hướng mới trong nền. Hệ thống sẽ quét qua các nguồn Facebook/TikTok đã cấu hình và cập nhật danh sách bài viết. Bạn có muốn tiếp tục?",
              })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm" disabled={triggerMutation.isPending}>
                {t("common.cancel", { defaultValue: "Hủy" })}
              </Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={() => triggerMutation.mutate()}
              loading={triggerMutation.isPending}
              className="gap-1.5"
            >
              <Zap className="size-3.5 fill-current" />
              {t("admin.crawlRuns.confirmAction", {
                defaultValue: "Bắt đầu Crawl",
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
