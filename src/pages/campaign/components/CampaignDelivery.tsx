import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type {
  Campaign,
  CampaignDeployment,
  CampaignTask,
} from "@/pages/campaign/types";

export function CampaignDelivery({
  workspaceId,
  campaign,
  canManage,
  onChanged,
}: {
  workspaceId: string;
  campaign: Campaign;
  canManage: boolean;
  onChanged: (value?: Campaign) => void;
}) {
  const { t, i18n } = useTranslation();
  const [deployment, setDeployment] = useState<CampaignDeployment | null>(null);
  const [tasks, setTasks] = useState<CampaignTask[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (campaign.status === "DRAFT") return;
    let active = true;
    async function refresh() {
      try {
        const state = await campaignService.deployment(
          workspaceId,
          campaign.id,
        );
        if (active) setDeployment(state.data.data);
        if (
          state.data.data.status === "SUCCEEDED" ||
          campaign.status !== "APPROVED"
        ) {
          const list = await campaignService.tasks(workspaceId, campaign.id);
          if (active) setTasks(list.data.data);
        }
        if (
          active &&
          campaign.status === "APPROVED" &&
          state.data.data.status === "SUCCEEDED"
        )
          onChanged();
      } catch (error) {
        if (active && (!isAxiosError(error) || error.response?.status !== 404))
          toast.error(t("campaign.error"));
      }
    }
    void refresh();
    const timer = window.setInterval(() => {
      if (deployment?.status === "PENDING") void refresh();
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
    t,
  ]);
  async function deploy() {
    setBusy(true);
    try {
      const result = await campaignService.deploy(workspaceId, campaign);
      setDeployment(result.data.data);
      toast.success(t("campaign.delivery.queued"));
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }
  async function complete() {
    setBusy(true);
    try {
      const result = await campaignService.complete(
        workspaceId,
        campaign,
        reason.trim(),
      );
      onChanged(result.data.data);
      toast.success(t("campaign.delivery.completed"));
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }
  function showError(error: unknown) {
    const code = isAxiosError(error)
      ? error.response?.data?.error?.code
      : undefined;
    const known = [
      "CAMPAIGN_VERSION_CONFLICT",
      "CAMPAIGN_COMPLETION_REASON_REQUIRED",
      "CAMPAIGN_DEPLOYMENT_INCOMPLETE",
    ];
    toast.error(
      t(known.includes(code) ? `campaign.errors.${code}` : "campaign.error"),
    );
  }
  if (campaign.status === "DRAFT") return null;
  const unfinished = tasks.some((task) => task.status !== "COMPLETED");
  const done = tasks.filter((task) => task.status === "COMPLETED").length;
  return (
    <section className="border-border bg-card space-y-5 rounded-xl border p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {t("campaign.delivery.title")}
          </h3>
          {deployment && (
            <p role="status" className="text-muted-foreground mt-2 text-sm">
              {t(`campaign.delivery.${deployment.status}`)} ·{" "}
              {t("campaign.delivery.attempts", {
                count: deployment.attemptCount,
              })}
            </p>
          )}
        </div>
        {canManage &&
          campaign.status === "APPROVED" &&
          (!deployment || deployment.status === "FAILED") && (
            <Button
              variant="orange"
              loading={busy}
              onClick={() => void deploy()}
            >
              {t(
                deployment
                  ? "campaign.delivery.retry"
                  : "campaign.delivery.deploy",
              )}
            </Button>
          )}
      </div>
      {deployment?.lastErrorCode && (
        <details className="border-destructive/30 bg-destructive/5 rounded-lg border p-3 text-sm">
          <summary className="focus-visible:ring-ring cursor-pointer rounded-sm outline-none focus-visible:ring-2">
            {t("campaign.ui.deploymentError")}
          </summary>
          <p className="mt-2 font-mono text-xs break-words">
            {deployment.lastErrorCode}
          </p>
        </details>
      )}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">
              {t("campaign.delivery.progress", { done, total: tasks.length })}
            </p>
            <div
              role="progressbar"
              aria-label={t("campaign.ui.taskProgress")}
              aria-valuenow={done}
              aria-valuemin={0}
              aria-valuemax={tasks.length}
              className="bg-muted h-2 overflow-hidden rounded-full"
            >
              <div
                className="bg-brand-orange h-full rounded-full"
                style={{ width: `${(done / tasks.length) * 100}%` }}
              />
            </div>
          </div>
          <ul className="divide-border divide-y">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium break-words">{task.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {t(`campaign.types.${task.type}`)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant={
                      task.status === "COMPLETED" ? "APPROVED" : "outline"
                    }
                  >
                    {t(
                      `campaign.ui.taskStatuses.${task.status.toUpperCase()}`,
                      { defaultValue: task.status },
                    )}
                  </Badge>
                  {canManage && task.type === "POST" && (
                    <Link
                      className="focus-visible:ring-ring rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2"
                      to={`/workspaces/${workspaceId}/content-writing?taskId=${task.id}`}
                    >
                      {t("campaign.delivery.openEditor")}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {canManage && campaign.status === "IN_PROGRESS" && (
        <div className="border-border space-y-3 border-t pt-5">
          <label
            htmlFor="campaign-completion-reason"
            className="block text-sm font-medium"
          >
            {t("campaign.delivery.reason")}
          </label>
          {unfinished && (
            <p
              id="campaign-completion-hint"
              className="text-muted-foreground text-sm leading-6"
            >
              {t("campaign.delivery.reasonHint")}
            </p>
          )}
          <Textarea
            id="campaign-completion-reason"
            aria-describedby={
              unfinished ? "campaign-completion-hint" : undefined
            }
            rows={3}
            disabled={busy}
            maxLength={2000}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("campaign.delivery.reason")}
          />
          <Button
            variant="outline"
            loading={busy}
            disabled={unfinished && !reason.trim()}
            onClick={() => void complete()}
          >
            {t("campaign.delivery.complete")}
          </Button>
        </div>
      )}
      {campaign.status === "COMPLETED" && (
        <div className="bg-success/5 rounded-lg p-4 text-sm">
          <p className="font-medium">
            {t("campaign.delivery.completedAt", {
              date: campaign.completedAt
                ? new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(campaign.completedAt))
                : "",
            })}
          </p>
          {campaign.completionReason && (
            <p className="text-muted-foreground mt-2 break-words whitespace-pre-wrap">
              {campaign.completionReason}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
