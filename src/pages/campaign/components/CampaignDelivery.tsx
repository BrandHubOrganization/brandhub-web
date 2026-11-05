import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  RotateCw,
  ShieldCheck,
  Ban,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireApiData } from "@/lib/apiData";
import { isDeploymentNotFound } from "@/pages/campaign/deploymentErrors";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type {
  Campaign,
  CampaignDeployment,
  CampaignTask,
} from "@/pages/campaign/types";
import { CampaignTaskGroups } from "./CampaignTaskGroups";
import { CampaignClosureSection } from "./CampaignClosureSection";

export function CampaignDelivery({
  workspaceId,
  campaign,
  canManage,
  canClose,
  onChanged,
  onTasksAvailable,
  onOpenReview,
}: {
  workspaceId: string;
  campaign: Campaign;
  canManage: boolean;
  canClose: boolean;
  onChanged: (value?: Campaign) => void;
  onTasksAvailable: (campaignId: string, available: boolean) => void;
  onOpenReview: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [deployment, setDeployment] = useState<CampaignDeployment | null>(null);
  const [tasks, setTasks] = useState<CampaignTask[]>([]);
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        if (campaign.status === "DRAFT") {
          const list = await campaignService.tasks(workspaceId, campaign.id);
          if (!active) return;
          const items = requireApiData<CampaignTask[]>(list.data);
          setTasks(items);
          setLoaded(true);
          setLoadError(false);
          onTasksAvailable(campaign.id, items.length > 0);
          return;
        }
        const state = await campaignService.deployment(
          workspaceId,
          campaign.id,
        );
        const value =
          state.data.success === true && state.data.data === null
            ? null
            : requireApiData<CampaignDeployment>(state.data);
        if (active) {
          setDeployment(value);
          setLoadError(false);
          setLoaded(true);
        }
        if (value?.status === "SUCCEEDED" || campaign.status !== "APPROVED") {
          const list = await campaignService.tasks(workspaceId, campaign.id);
          if (active) {
            const items = requireApiData<CampaignTask[]>(list.data);
            setTasks(items);
            onTasksAvailable(campaign.id, items.length > 0);
          }
        } else if (active) {
          setTasks([]);
          onTasksAvailable(campaign.id, false);
        }
        if (
          active &&
          campaign.status === "APPROVED" &&
          value?.status === "SUCCEEDED"
        )
          onChanged();
      } catch (error) {
        if (!active) return;
        onTasksAvailable(campaign.id, false);
        if (isDeploymentNotFound(error) && campaign.status === "APPROVED") {
          setDeployment(null);
          setLoaded(true);
          setLoadError(false);
        } else setLoadError(true);
      }
    }
    void refresh();
    const timer = window.setInterval(() => {
      if (deployment?.status === "PENDING" || campaign.status === "IN_PROGRESS")
        void refresh();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [
    workspaceId,
    campaign.id,
    campaign.status,
    deployment?.status,
    onChanged,
    onTasksAvailable,
    t,
    revision,
  ]);

  async function deploy() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await campaignService.deploy(workspaceId, campaign);
      setDeployment(result.data.data);
      toast.success(t("campaign.delivery.queued"));
    } catch (error) {
      const code: unknown = isAxiosError(error)
        ? error.response?.data?.error?.code
        : undefined;
      const key = typeof code === "string" ? `campaign.errors.${code}` : "";
      toast.error(key && t(key) !== key ? t(key) : t("campaign.error"));
    } finally {
      setBusy(false);
    }
  }

  if (campaign.status === "DRAFT") {
    return (
      <section
        id="campaign-delivery"
        className="border-border bg-card space-y-4 rounded-xl border p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {t("campaign.tabs.delivery")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("campaign.delivery.draftHint")}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onOpenReview}>
            {t("campaign.tabs.review")}
          </Button>
        </div>
        {loadError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3">
            <p className="text-destructive text-sm">{t("campaign.error")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRevision((value) => value + 1)}
            >
              {t("campaign.reload")}
            </Button>
          </div>
        ) : !loaded ? (
          <p role="status" className="text-muted-foreground text-sm">
            {t("tasks.loading")}
          </p>
        ) : tasks.length > 0 ? (
          <CampaignTaskGroups
            tasks={tasks}
            workspaceId={workspaceId}
            canManage={false}
          />
        ) : (
          <div className="border-border space-y-2 rounded-lg border border-dashed p-4">
            <p className="text-muted-foreground text-sm">
              {t("campaign.delivery.draftEmpty")}
            </p>
            {campaign.workItems.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {campaign.workItems.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    );
  }

  if (closing)
    return (
      <CampaignClosureSection
        workspaceId={workspaceId}
        campaign={campaign}
        onClose={() => setClosing(false)}
        onTasksChanged={() => setRevision((value) => value + 1)}
        onCompleted={(value) => {
          setClosing(false);
          onChanged(value);
          toast.success(t("campaign.delivery.completed"));
        }}
      />
    );

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((task) =>
    task.status === "FINISHED",
  ).length;
  const cancelledCount = tasks.filter(
    (task) => task.status === "CANCELLED",
  ).length;
  const inProgressCount = tasks.filter(
    (task) => !["FINISHED", "CANCELLED"].includes(task.status),
  ).length;
  const done = completedCount + cancelledCount;
  const progressPercent =
    totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

  return (
    <section
      id="campaign-delivery"
      className="border-border bg-card scroll-mt-6 space-y-6 rounded-2xl border p-5 shadow-xs sm:p-7"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-foreground text-xl font-bold tracking-tight">
              {t("campaign.delivery.title")}
            </h3>
            {deployment && (
              <span
                role="status"
                className="bg-muted/80 text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              >
                <span
                  className={`size-1.5 rounded-full ${
                    deployment.status === "SUCCEEDED"
                      ? "bg-emerald-500"
                      : deployment.status === "FAILED"
                        ? "bg-rose-500"
                        : "animate-pulse bg-amber-500"
                  }`}
                />
                {t(`campaign.delivery.${deployment.status}`, {
                  defaultValue: deployment.status,
                })}
              </span>
            )}
          </div>
          {deployment && (
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              {t("campaign.delivery.attempts", {
                count: deployment.attemptCount,
              })}
            </p>
          )}
        </div>

        {/* Deploy button for initial start */}
        {canManage &&
          loaded &&
          !loadError &&
          campaign.status === "APPROVED" &&
          !deployment && (
            <Button
              variant="orange"
              loading={busy}
              onClick={() => void deploy()}
              className="gap-2 font-medium shadow-sm"
            >
              <Rocket className="size-4" />
              {t("campaign.delivery.deploy")}
            </Button>
          )}
      </div>

      {/* Deployment Telemetry: PENDING state */}
      {deployment?.status === "PENDING" && (
        <div
          role="status"
          className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 transition-all sm:p-5"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Loader2 className="size-5 animate-spin" />
              <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
              </span>
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold text-amber-950 sm:text-base dark:text-amber-200">
                {t("campaign.delivery.PENDING", {
                  defaultValue: "Đang tự động khởi tạo đầu việc...",
                })}
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
                Hệ thống đang tự động khởi tạo các nhiệm vụ từ kế hoạch ·{" "}
                {t("campaign.delivery.attempts", {
                  count: deployment.attemptCount,
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deployment Telemetry: FAILED state */}
      {deployment?.status === "FAILED" && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 relative overflow-hidden rounded-xl border p-4 transition-all sm:p-5"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3.5">
              <div className="bg-destructive/20 text-destructive ring-destructive/30 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
                <AlertCircle className="size-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-destructive text-sm font-semibold sm:text-base">
                  {t("campaign.delivery.FAILED", {
                    defaultValue: "Triển khai chưa hoàn tất",
                  })}
                </p>
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <span>
                    {t("campaign.delivery.attempts", {
                      count: deployment.attemptCount,
                    })}
                  </span>
                  {deployment.lastErrorCode && (
                    <span className="text-destructive bg-destructive/15 rounded-md px-2 py-0.5 font-mono font-semibold">
                      Mã lỗi: {deployment.lastErrorCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {canManage && campaign.status === "APPROVED" && (
              <Button
                variant="orange"
                loading={busy}
                onClick={() => void deploy()}
                className="shrink-0 gap-2 font-medium shadow-sm"
              >
                <RotateCw className="size-4" />
                {t("campaign.delivery.retry", {
                  defaultValue: "Thử lại triển khai",
                })}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* General load error alert */}
      {loadError && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 flex flex-col justify-between gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-destructive size-5 shrink-0" />
            <p className="text-destructive font-medium">
              {t("campaign.error")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevision((value) => value + 1)}
            className="shrink-0 gap-1.5"
          >
            <RotateCw className="size-3.5" />
            {t("campaign.delivery.retry")}
          </Button>
        </div>
      )}

      {/* Deployment last error details if not FAILED status */}
      {deployment?.lastErrorCode && deployment.status !== "FAILED" && (
        <details className="border-destructive/30 bg-destructive/5 rounded-xl border p-3.5 text-sm">
          <summary className="focus-visible:ring-ring text-destructive cursor-pointer rounded-sm font-medium outline-none focus-visible:ring-2">
            {t("campaign.ui.deploymentError")}
          </summary>
          <p className="text-muted-foreground bg-card/60 mt-2 rounded-md p-2 font-mono text-xs break-words">
            {deployment.lastErrorCode}
          </p>
        </details>
      )}

      {/* Metric Toolbar & Task Groups */}
      {totalTasks > 0 && (
        <div className="space-y-4 pt-1">
          {/* Horizontal Metric Toolbar */}
          <div className="border-border/70 bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2.5 shadow-2xs">
            {/* Left section: Progress Overview */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">
                {t("campaign.ui.taskProgress", {
                  defaultValue: "Tiến độ",
                })}
              </span>
              <div
                role="progressbar"
                aria-label={t("campaign.ui.taskProgress")}
                aria-valuenow={done}
                aria-valuemin={0}
                aria-valuemax={totalTasks}
                className="bg-muted ring-border/40 h-2 w-28 overflow-hidden rounded-full ring-1 sm:w-36"
              >
                <div
                  className="from-brand-orange h-full rounded-full bg-gradient-to-r to-amber-500 shadow-xs transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-foreground font-mono text-xs font-bold tabular-nums">
                {progressPercent}%
              </span>
            </div>

            {/* Right section: Status Metric Badges / Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-muted/60 text-muted-foreground inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium">
                <Layers className="size-3.5" />
                <span>
                  Tổng:{" "}
                  <b className="text-foreground tabular-nums">{totalTasks}</b>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                <Clock className="size-3.5" />
                <span>
                  {t("campaign.ui.taskStatuses.IN_PROGRESS", {
                    defaultValue: "Đang thực hiện",
                  })}
                  : <b className="tabular-nums">{inProgressCount}</b>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-3.5" />
                <span>
                  {t("campaign.ui.taskStatuses.FINISHED", {
                    defaultValue: "Đã hoàn thành",
                  })}
                  : <b className="tabular-nums">{completedCount}</b>
                </span>
              </span>
              {cancelledCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                  <Ban className="size-3.5" />
                  <span>
                    {t("campaign.ui.taskStatuses.CANCELLED", {
                      defaultValue: "Đã hủy",
                    })}
                    : <b className="tabular-nums">{cancelledCount}</b>
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Task Groups with Filters & Cards */}
          <CampaignTaskGroups
            tasks={tasks}
            workspaceId={workspaceId}
            canManage={canManage}
          />
        </div>
      )}

      {/* Closure CTA Banner: IN_PROGRESS */}
      {canClose && campaign.status === "IN_PROGRESS" && (
        <div className="border-border/80 from-card via-card to-brand-orange/5 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="bg-brand-orange/10 text-brand-orange ring-brand-orange/20 flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
                <ShieldCheck className="size-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-foreground text-base font-semibold">
                  {t("campaign.closure.title", {
                    defaultValue: "Nghiệm thu & Kết thúc chiến dịch",
                  })}
                </h4>
                <p className="text-muted-foreground max-w-xl text-xs sm:text-sm">
                  {t("campaign.delivery.reasonHint", {
                    defaultValue:
                      "Cần xử lý mọi đầu việc và yêu cầu đang xem xét trước khi kết thúc chiến dịch.",
                  })}
                </p>
              </div>
            </div>
            <Button
              data-campaign-complete
              variant="orange"
              size="lg"
              className="shrink-0 gap-2 font-medium shadow-sm"
              onClick={() => setClosing(true)}
            >
              <ShieldCheck className="size-4" />
              {t("campaign.closure.cta", {
                defaultValue: "Nghiệm thu & Đóng chiến dịch",
              })}
            </Button>
          </div>
        </div>
      )}

      {/* COMPLETED Celebration Banner */}
      {campaign.status === "COMPLETED" && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 text-sm shadow-xs sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              <div>
                <h4 className="text-base font-bold text-emerald-950 sm:text-lg dark:text-emerald-200">
                  Chiến dịch đã hoàn tất thành công
                </h4>
                <p className="mt-0.5 text-xs text-emerald-800/80 dark:text-emerald-400/80">
                  {t("campaign.delivery.completedAt", {
                    date: campaign.completedAt
                      ? new Intl.DateTimeFormat(i18n.language, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(campaign.completedAt))
                      : "",
                  })}
                </p>
              </div>
              {campaign.completionReason && (
                <div className="bg-card/60 mt-2 rounded-xl border border-emerald-500/20 p-3.5">
                  <span className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                    Lý do nghiệm thu & hoàn tất:
                  </span>
                  <p className="text-foreground text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {campaign.completionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
