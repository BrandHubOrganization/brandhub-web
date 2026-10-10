import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type { Campaign, CampaignReviewEvent, CampaignVersion } from "@/pages/campaign/types";

const fields = ["name", "strategyDetail", "brandGuideline", "timeline", "workItems"] as const;

export function CampaignReview({ workspaceId, campaign, canManage, onApproved }: {
  workspaceId: string; campaign: Campaign; canManage: boolean; onApproved: (value: Campaign) => void;
}) {
  const { t } = useTranslation();
  const [events, setEvents] = useState<CampaignReviewEvent[]>([]);
  const [versions, setVersions] = useState<CampaignVersion[]>([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([campaignService.events(workspaceId, campaign.id), campaignService.versions(workspaceId, campaign.id)])
      .then(([history, snapshots]) => {
        if (active) { setEvents(history.data.data); setVersions(snapshots.data.data); }
      }).catch(() => { if (active) toast.error(t("campaign.error")); });
    return () => { active = false; };
  }, [workspaceId, campaign.id, campaign.contentVersion, t]);
  const mine = canManage ? campaign.approvedByAgencyVersion === campaign.contentVersion
    : campaign.approvedByClientVersion === campaign.contentVersion;
  const latest = versions.find(item => item.contentVersion === (selected ?? campaign.contentVersion));
  const previous = versions.find(item => item.contentVersion === (selected ?? campaign.contentVersion) - 1);
  const currentData = latest ? JSON.parse(latest.snapshot) as Record<string, unknown> : null;
  const previousData = previous ? JSON.parse(previous.snapshot) as Record<string, unknown> : null;
  async function approve() {
    setBusy(true);
    try {
      const result = await campaignService.approve(workspaceId, campaign);
      onApproved(result.data.data);
      toast.success(t("campaign.review.approved"));
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  }
  async function sendFeedback() {
    if (!comment.trim()) return;
    setBusy(true);
    try {
      const result = await campaignService.feedback(workspaceId, campaign, comment.trim());
      setEvents(items => [result.data.data, ...items]); setComment("");
      toast.success(t("campaign.review.sent"));
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  }
  function showError(error: unknown) {
    const code = isAxiosError(error) ? error.response?.data?.error?.code : undefined;
    toast.error(t(code === "CAMPAIGN_VERSION_CONFLICT" ? "campaign.errors.CAMPAIGN_VERSION_CONFLICT"
      : code === "CAMPAIGN_PLAN_INCOMPLETE" ? "campaign.errors.CAMPAIGN_PLAN_INCOMPLETE" : "campaign.error"));
  }
  return <section className="space-y-4 border-t pt-4">
    <h3 className="font-semibold">{t("campaign.review.title")}</h3>
    <p className="text-sm text-muted-foreground">{t("campaign.review.agency")}: {campaign.approvedByAgencyVersion === campaign.contentVersion ? t("campaign.review.done") : t("campaign.review.pending")} · {t("campaign.review.client")}: {campaign.approvedByClientVersion === campaign.contentVersion ? t("campaign.review.done") : t("campaign.review.pending")}</p>
    {campaign.status === "DRAFT" && <Button disabled={busy || mine} onClick={() => void approve()}>{mine ? t("campaign.review.alreadyApproved") : t("campaign.review.approve")}</Button>}
    {!canManage && campaign.status === "DRAFT" && <div className="space-y-2">
      <label htmlFor="campaign-feedback" className="block text-sm font-medium">{t("campaign.review.feedback")}</label>
      <textarea id="campaign-feedback" className="w-full rounded-md border border-input bg-background p-2" maxLength={4000} value={comment} onChange={event => setComment(event.target.value)} />
      <Button variant="outline" disabled={busy || !comment.trim()} onClick={() => void sendFeedback()}>{t("campaign.review.send")}</Button>
    </div>}
    {events.length > 0 && <div className="space-y-2"><h4 className="font-medium">{t("campaign.review.history")}</h4>
      {events.map(event => <p key={event.id} className="rounded-md border p-2 text-sm">{event.actorSide} · v{event.contentVersion} · {t(`campaign.review.${event.eventType}`)} · {event.comment ?? ""}</p>)}
    </div>}
    {versions.length > 0 && <div className="space-y-2"><h4 className="font-medium">{t("campaign.review.changes")}</h4>
      <select aria-label={t("campaign.review.changes")} className="rounded-md border border-input bg-background p-2" value={selected ?? campaign.contentVersion} onChange={event => setSelected(Number(event.target.value))}>
        {versions.map(item => <option key={item.id} value={item.contentVersion}>v{item.contentVersion}</option>)}
      </select>
      {currentData && previousData && <div className="grid gap-2 md:grid-cols-2">
        <h5>{t("campaign.review.old")}</h5><h5>{t("campaign.review.new")}</h5>
        {fields.map(field => { const oldValue = JSON.stringify(previousData[field], null, 2); const newValue = JSON.stringify(currentData[field], null, 2);
          return <div key={field} className="contents"><pre className={`whitespace-pre-wrap break-all rounded-md p-2 text-xs ${oldValue !== newValue ? "bg-destructive/10" : "bg-muted"}`}>{field}: {oldValue}</pre><pre className={`whitespace-pre-wrap break-all rounded-md p-2 text-xs ${oldValue !== newValue ? "bg-primary/10" : "bg-muted"}`}>{field}: {newValue}</pre></div>; })}
      </div>}
    </div>}
  </section>;
}
