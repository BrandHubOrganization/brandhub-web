import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type { Campaign, CampaignPlan } from "@/pages/campaign/types";
export function useCampaignPlanSave(
  workspaceId: string,
  campaign: Campaign,
  onSaved: (campaign: Campaign) => void,
) {
  const latest = useRef(campaign);
  const lock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  const client = useQueryClient();
  useEffect(() => {
    latest.current = campaign;
  }, [campaign]);
  const dirty = useCallback((key: string, value: boolean) => {
    setDirtyFields((old) => {
      const next = new Set(old);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);
  async function save(patch: Partial<CampaignPlan>, version: number) {
    if (lock.current) throw new Error("SAVE_IN_PROGRESS");
    lock.current = true;
    setSaving(true);
    try {
      const current = latest.current;
      if (current.contentVersion !== version)
        throw new Error("CAMPAIGN_VERSION_CONFLICT");
      const response = await campaignService.update(workspaceId, current, {
        name: current.name,
        strategyDetail: current.strategyDetail,
        brandGuideline: current.brandGuideline,
        timeline: current.timeline,
        workItems: current.workItems,
        ...patch,
      });
      latest.current = response.data.data;
      onSaved(response.data.data);
    } catch (error) {
      toast.error(t("campaign.timeline.planSaveError"));
      void client.invalidateQueries({ queryKey: ["campaign-workspace"] });
      throw error;
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return { save, saving, dirty, dirtyFields, hasUnsaved: dirtyFields.size > 0 };
}
