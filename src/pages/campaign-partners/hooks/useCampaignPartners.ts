import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { campaignPartnerService } from "../services/campaignPartnerService";
import type {
  CampaignPartner,
  CampaignPartnerContext,
  CooperationStatus,
} from "../types";

export function useCampaignPartners(
  workspaceId: string,
  pageSize = 20,
  enabled = true,
) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    scope: string;
    data: CampaignPartnerContext | null;
    error: boolean;
  }>();
  const [busy, setBusy] = useState(false);
  const reload = () => setRevision((value) => value + 1);
  const scope = `${workspaceId}:${page}:${pageSize}`;
  const key = `${scope}:${revision}`;
  const hasScopeData = result?.scope === scope;
  const loading = enabled && !hasScopeData;
  const data = hasScopeData ? (result?.data ?? null) : null;
  const error = hasScopeData && !!result?.error;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    campaignPartnerService
      .list(workspaceId, page, pageSize)
      .then((res) => {
        if (active) setResult({ key, scope, data: res.data.data, error: false });
      })
      .catch(() => {
        if (active) setResult({ key, scope, data: null, error: true });
      });
    return () => {
      active = false;
    };
  }, [workspaceId, page, pageSize, key, scope, enabled]);

  async function mutate(operation: () => Promise<unknown>, successKey = "campaign.partners.saved") {
    setBusy(true);
    try {
      await operation();
      toast.success(t(successKey));
      reload();
      return true;
    } catch (failure) {
      const code = isAxiosError<{ error?: { code?: string } }>(failure)
        ? failure.response?.data.error?.code
        : undefined;
      toast.error(
        t(
          code === "COLLABORATOR_INACTIVE"
            ? "collaborators.inactive"
            : code === "COOPERATION_VERSION_CONFLICT"
              ? "campaign.partners.conflict"
              : code === "FORBIDDEN" || code === "WORKSPACE_ACCESS_DENIED"
                ? "campaign.partners.forbidden"
                : "campaign.partners.error",
        ),
      );
      if (code === "COOPERATION_VERSION_CONFLICT" || code === "COLLABORATOR_INACTIVE") {
        reload();
      }
      return false;
    } finally {
      setBusy(false);
    }
  }

  const assign = (id: string) => {
    const campaignId = data?.campaignId;
    if (!campaignId) return;
    return mutate(() =>
      campaignPartnerService.assign(workspaceId, campaignId, id),
    );
  };

  const assignMany = (ids: string[]) => {
    const campaignId = data?.campaignId;
    if (!campaignId || ids.length === 0) return;
    return mutate(async () => {
      for (const id of ids) {
        await campaignPartnerService.assign(workspaceId, campaignId, id);
      }
    });
  };

  const update = (partner: CampaignPartner, status: CooperationStatus) =>
    mutate(() =>
      campaignPartnerService.update(workspaceId, partner, status),
    );

  const unlink = (partner: CampaignPartner) =>
    mutate(
      () =>
        campaignPartnerService.unlink(
          workspaceId,
          partner.mediaCampaignId,
          partner.id,
        ),
      "campaign.partners.removed",
    );

  return {
    data,
    page,
    setPage,
    loading,
    error,
    busy,
    reload,
    assign,
    assignMany,
    update,
    unlink,
  };
}
