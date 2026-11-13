import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { campaignService } from "@/pages/campaign/services/campaignService";
import { patchTimeline } from "@/pages/campaign/utils/timelineDates";
import type { Campaign, CampaignBrief, CampaignPlan } from "@/pages/campaign/types";

function isVersionConflictError(error: unknown): boolean {
  if (error instanceof Error && error.message === "CAMPAIGN_VERSION_CONFLICT") {
    return true;
  }
  if (!isAxiosError(error)) return false;
  const code = error.response?.data?.error?.code as string | undefined;
  return error.response?.status === 409 || code === "CAMPAIGN_VERSION_CONFLICT";
}

function getSaveErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const apiMessage = error.response?.data?.error?.message as unknown;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }
  }
  return fallback;
}

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
  const save = useCallback(
    async (patch: Partial<CampaignPlan>, version: number) => {
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
        if (isVersionConflictError(error)) {
          toast.error(t("campaign.timeline.planSaveError"));
          void client.invalidateQueries({ queryKey: ["campaign-workspace"] });
        } else {
          toast.error(getSaveErrorMessage(error, t("campaign.timeline.saveError")));
        }
        throw error;
      } finally {
        lock.current = false;
        setSaving(false);
      }
    },
    [client, onSaved, t, workspaceId],
  );
  const saveBrief = useCallback(
    async (patch: {
      strategyDetail: string;
      brandGuideline: string;
      brief?: CampaignBrief;
    }) => {
      if (lock.current) throw new Error("SAVE_IN_PROGRESS");
      lock.current = true;
      setSaving(true);
      try {
        const current = latest.current;
        const response =
          current.status === "DRAFT"
            ? await campaignService.update(workspaceId, current, {
                name: current.name,
                strategyDetail: patch.strategyDetail,
                brandGuideline: patch.brandGuideline,
                timeline: patchTimeline(current.timeline, {
                  brief: patch.brief,
                }),
                workItems: current.workItems,
              })
            : await campaignService.updateBrief(workspaceId, current.id, {
                strategyDetail: patch.strategyDetail,
                brandGuideline: patch.brandGuideline,
                brief: patch.brief ?? {},
              });
        latest.current = response.data.data;
        onSaved(response.data.data);
      } catch (error) {
        if (isVersionConflictError(error)) {
          toast.error(t("campaign.timeline.planSaveError"));
          void client.invalidateQueries({ queryKey: ["campaign-workspace"] });
        } else {
          toast.error(getSaveErrorMessage(error, t("campaign.timeline.saveError")));
        }
        throw error;
      } finally {
        lock.current = false;
        setSaving(false);
      }
    },
    [client, onSaved, t, workspaceId],
  );
  return {
    save,
    saveBrief,
    saving,
    dirty,
    dirtyFields,
    hasUnsaved: dirtyFields.size > 0,
  };
}
