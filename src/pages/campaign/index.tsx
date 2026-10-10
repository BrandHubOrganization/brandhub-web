import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CampaignForm } from "@/pages/campaign/components/CampaignForm";
import { CampaignDetail } from "@/pages/campaign/components/CampaignDetail";
import { CampaignReview } from "@/pages/campaign/components/CampaignReview";
import { CampaignDelivery } from "@/pages/campaign/components/CampaignDelivery";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type { Campaign, CampaignPlan } from "@/pages/campaign/types";
import type { PackageDeliverable, WorkspaceMediaPackage } from "@/pages/media-package/types/mediaPackage";

export default function CampaignPanel({ selection, canManage }: {
  selection: WorkspaceMediaPackage; canManage: boolean;
}) {
  const { t } = useTranslation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const terms = selection.finalTerms;
  const source = terms.offeringDetails as { deliverables?: PackageDeliverable[] } | undefined;
  const deliverables = source?.deliverables ?? [];
  const legacy = campaign ? !!campaign.allocationPeriod || !campaign.deliverablePlan.length
    : !deliverables.length || terms.offeringModel === "RETAINER" && terms.quantityBasis !== "TOTAL";
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await campaignService.list(selection.workspaceId);
        if (result.data.data.length > 1) throw new Error("Legacy duplicate campaigns require review");
        if (active) setCampaign(result.data.data[0] ?? null);
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [selection.workspaceId, reload]);
  async function save(plan: CampaignPlan) {
    setSaving(true);
    try {
      const result = campaign ? await campaignService.update(selection.workspaceId, campaign, plan)
        : await campaignService.create(selection.workspaceId, plan);
      setCampaign(result.data.data); setEditing(false); toast.success(t("campaign.saved"));
    } catch (failure) {
      const code = isAxiosError(failure) ? failure.response?.data?.error?.code : undefined;
      const known = ["CAMPAIGN_ALREADY_EXISTS", "CAMPAIGN_VERSION_CONFLICT", "CAMPAIGN_LEGACY_TERMS", "CAMPAIGN_IMMUTABLE"];
      toast.error(t(known.includes(code) ? `campaign.errors.${code}` : "campaign.error"));
    } finally { setSaving(false); }
  }
  const refreshCampaign = useCallback((value?: Campaign) => {
    if (value) setCampaign(value);
    else { setLoading(true); setReload(current => current + 1); }
  }, []);
  return <section className="mt-4 space-y-4 rounded-xl border border-border bg-card p-4 text-foreground">
    <h2 className="text-xl font-semibold">{t("campaign.title")}</h2>
    <p className="text-sm text-muted-foreground">{t("campaign.description")}</p>
    {loading && <Spinner />}
    {error && <p role="alert">{t("campaign.error")}</p>}
    {!loading && !error && <>
      {campaign && !editing && <CampaignDetail campaign={campaign} />}
      {campaign && !editing && <CampaignReview workspaceId={selection.workspaceId} campaign={campaign}
        canManage={canManage} onApproved={setCampaign} />}
      {campaign && !editing && <CampaignDelivery workspaceId={selection.workspaceId} campaign={campaign}
        canManage={canManage} onChanged={refreshCampaign} />}
      {!campaign && !editing && <p>{t("campaign.empty")}</p>}
      {legacy && <p role="alert">{t("campaign.errors.CAMPAIGN_LEGACY_TERMS")}</p>}
      {canManage && !legacy && (!campaign || campaign.status === "DRAFT") && !editing &&
        <Button onClick={() => setEditing(true)}>{t(campaign ? "campaign.edit" : "campaign.create")}</Button>}
      {editing && <CampaignForm campaign={campaign} deliverables={campaign?.deliverablePlan ?? deliverables}
        saving={saving} onSave={save} onCancel={() => setEditing(false)} />}
    </>}
    {!editing && <Button variant="outline" disabled={loading || saving} onClick={() => {
      setLoading(true); setError(false); setReload(value => value + 1);
    }}>{t("campaign.reload")}</Button>}
  </section>;
}
