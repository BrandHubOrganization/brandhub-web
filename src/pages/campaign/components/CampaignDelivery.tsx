import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
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
import { CampaignClosureDialog } from "./CampaignClosureDialog";

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
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (campaign.status === "DRAFT") return;
    let active = true;
    async function refresh() {
      try {
        const state = await campaignService.deployment(
          workspaceId,
          campaign.id,
        );
        const value = requireApiData<CampaignDeployment>(state.data);
        if (active) {
          setDeployment(value);
          setLoadError(false);
          setLoaded(true);
        }
        if (value.status === "SUCCEEDED" || campaign.status !== "APPROVED") {
          const list = await campaignService.tasks(workspaceId, campaign.id);
          if (active) setTasks(requireApiData<CampaignTask[]>(list.data));
        }
        if (
          active &&
          campaign.status === "APPROVED" &&
          value.status === "SUCCEEDED"
        )
          onChanged();
      } catch (error) {
        if (!active) return;
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
  if (campaign.status === "DRAFT") return null;
  const done = tasks.filter((task) =>
    ["FINISHED", "COMPLETED", "CANCELLED"].includes(task.status),
  ).length;
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
          loaded &&
          !loadError &&
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
      {loadError && (
        <div role="alert" className="text-destructive space-y-2 text-sm">
          <p>{t("campaign.error")}</p>
          <Button
            variant="outline"
            onClick={() => setRevision((value) => value + 1)}
          >
            {t("campaign.delivery.retry")}
          </Button>
        </div>
      )}
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
          <p className="text-sm font-medium">
            {t("campaign.closure.progress", { done, total: tasks.length })}
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
          <CampaignTaskGroups
            tasks={tasks}
            workspaceId={workspaceId}
            canManage={canManage}
          />
        </div>
      )}
      {canManage && campaign.status === "IN_PROGRESS" && (
        <div className="border-border border-t pt-5">
          <Button variant="outline" onClick={() => setClosing(true)}>
            {t("campaign.delivery.complete")}
          </Button>
        </div>
      )}
      {closing && (
        <CampaignClosureDialog
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
