import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { campaignPartnerService } from "../services/campaignPartnerService";
import type { CampaignPartnerContext, CampaignPartner, CooperationStatus } from "../types";

export function useCampaignPartners(workspaceId: string) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; data: CampaignPartnerContext | null; error: boolean }>();
  const [busy, setBusy] = useState(false);
  const reload = () => setRevision(value => value + 1);
  const key = `${workspaceId}:${page}:${revision}`;
  const loading = result?.key !== key;
  const data = loading ? null : result?.data ?? null;
  const error = !loading && !!result?.error;
  useEffect(() => {
    let active = true;
    campaignPartnerService.list(workspaceId, page).then(result => {
      if (active) setResult({ key, data: result.data.data, error: false });
    }).catch(() => { if (active) setResult({ key, data: null, error: true }); });
    return () => { active = false; };
  }, [workspaceId, page, key]);

  async function mutate(operation: () => Promise<unknown>) {
    setBusy(true);
    try {
      await operation();
      toast.success(t("campaign.partners.saved"));
      reload();
    } catch (failure) {
      const code = isAxiosError<{ error?: { code?: string } }>(failure)
        ? failure.response?.data.error?.code : undefined;
      toast.error(t(code === "COLLABORATOR_INACTIVE" ? "collaborators.inactive"
        : code === "COOPERATION_VERSION_CONFLICT" ? "campaign.partners.conflict"
        : code === "FORBIDDEN" || code === "WORKSPACE_ACCESS_DENIED"
          ? "campaign.partners.forbidden" : "campaign.partners.error"));
      if (code === "COOPERATION_VERSION_CONFLICT" || code === "COLLABORATOR_INACTIVE") reload();
    } finally { setBusy(false); }
  }
  const assign = (id: string) => {
    const campaignId = data?.campaignId;
    if (campaignId) return mutate(() => campaignPartnerService.assign(workspaceId, campaignId, id));
  };
  const update = (partner: CampaignPartner, status: CooperationStatus) => mutate(() =>
    campaignPartnerService.update(workspaceId, partner, status));
  return { data, page, setPage, loading, error, busy, reload, assign, update };
}
