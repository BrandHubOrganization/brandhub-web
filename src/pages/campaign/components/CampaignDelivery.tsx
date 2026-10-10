import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type { Campaign, CampaignDeployment, CampaignTask } from "@/pages/campaign/types";

export function CampaignDelivery({ workspaceId, campaign, canManage, onChanged }: {
  workspaceId: string; campaign: Campaign; canManage: boolean; onChanged: (value?: Campaign) => void;
}) {
  const { t } = useTranslation();
  const [deployment, setDeployment] = useState<CampaignDeployment | null>(null);
  const [tasks, setTasks] = useState<CampaignTask[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (campaign.status === "DRAFT") return;
    let active = true;
    async function refresh() {
      try {
        const state = await campaignService.deployment(workspaceId, campaign.id);
        if (active) setDeployment(state.data.data);
        if (state.data.data.status === "SUCCEEDED" || campaign.status !== "APPROVED") {
          const list = await campaignService.tasks(workspaceId, campaign.id);
          if (active) setTasks(list.data.data);
        }
        if (active && campaign.status === "APPROVED" && state.data.data.status === "SUCCEEDED") onChanged();
      } catch (error) {
        if (active && (!isAxiosError(error) || error.response?.status !== 404))
          toast.error(t("campaign.error"));
      }
    }
    void refresh();
    const timer = window.setInterval(() => { if (deployment?.status === "PENDING") void refresh(); }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [workspaceId, campaign.id, campaign.status, deployment?.status, onChanged, t]);
  async function deploy() {
    setBusy(true);
    try {
      const result = await campaignService.deploy(workspaceId, campaign);
      setDeployment(result.data.data);
      toast.success(t("campaign.delivery.queued"));
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  }
  async function complete() {
    setBusy(true);
    try {
      const result = await campaignService.complete(workspaceId, campaign, reason.trim());
      onChanged(result.data.data);
      toast.success(t("campaign.delivery.completed"));
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  }
  function showError(error: unknown) {
    const code = isAxiosError(error) ? error.response?.data?.error?.code : undefined;
    const known = ["CAMPAIGN_VERSION_CONFLICT", "CAMPAIGN_COMPLETION_REASON_REQUIRED", "CAMPAIGN_DEPLOYMENT_INCOMPLETE"];
    toast.error(t(known.includes(code) ? `campaign.errors.${code}` : "campaign.error"));
  }
  if (campaign.status === "DRAFT") return null;
  const unfinished = tasks.some(task => task.status !== "COMPLETED");
  return <section className="space-y-3 border-t pt-4">
    <h3 className="font-semibold">{t("campaign.delivery.title")}</h3>
    {deployment && <p className="text-sm">{t(`campaign.delivery.${deployment.status}`)} · {t("campaign.delivery.attempts", { count: deployment.attemptCount })}
      {deployment.lastErrorCode && ` · ${deployment.lastErrorCode}`}</p>}
    {canManage && campaign.status === "APPROVED" && (!deployment || deployment.status === "FAILED") &&
      <Button disabled={busy} onClick={() => void deploy()}>{t(deployment ? "campaign.delivery.retry" : "campaign.delivery.deploy")}</Button>}
    {tasks.length > 0 && <div className="space-y-2"><p>{t("campaign.delivery.progress", {
      done: tasks.filter(task => task.status === "COMPLETED").length, total: tasks.length,
    })}</p>
      {tasks.map(task => <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
        <span>{task.name} · {t(`campaign.types.${task.type}`)} · {task.status}</span>
        {canManage && task.type === "POST" && <Link className="text-primary underline" to={`/workspaces/${workspaceId}/content-writing?taskId=${task.id}`}>{t("campaign.delivery.openEditor")}</Link>}
      </div>)}
    </div>}
    {canManage && campaign.status === "IN_PROGRESS" && <div className="space-y-2">
      {unfinished && <p className="text-sm text-muted-foreground">{t("campaign.delivery.reasonHint")}</p>}
      <textarea aria-label={t("campaign.delivery.reason")} className="w-full rounded-md border border-input bg-background p-2" maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} placeholder={t("campaign.delivery.reason")} />
      <Button disabled={busy || unfinished && !reason.trim()} onClick={() => void complete()}>{t("campaign.delivery.complete")}</Button>
    </div>}
    {campaign.status === "COMPLETED" && <p className="text-sm">{t("campaign.delivery.completedAt", { date: campaign.completedAt ? new Date(campaign.completedAt).toLocaleString() : "" })}
      {campaign.completionReason && ` · ${campaign.completionReason}`}</p>}
  </section>;
}
