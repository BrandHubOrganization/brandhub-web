import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Handshake,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { PartnerContactCardInfo } from "@/pages/campaign-partners/components/PartnerContactCardInfo";
import { getCooperationStatusBadge } from "@/pages/campaign-partners/components/CampaignPartnersPanel";
import { campaignPartnerService } from "@/pages/campaign-partners/services/campaignPartnerService";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";
import { useWorkspaceStore } from "@/store/workspaceStore";

export function TaskPartnerContactSection({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const workflow = useTaskWorkflow(task.workspaceId, task.id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const role = useWorkspaceStore((state) => {
    const ws = state.workspaceList.find((item) => item.id === task.workspaceId);
    if (ws?.myRole) return ws.myRole;
    if (state.currentWorkspace?.id === task.workspaceId) {
      return state.currentMemberRole ?? state.currentWorkspace.myRole ?? null;
    }
    return null;
  });

  const isClient = role === "CLIENT";
  const canModifyPartners =
    !isClient &&
    (role === "OWNER" || role === "MANAGER" || role === "CREATOR") &&
    !["CANCELLED", "COMPLETED", "FINISHED"].includes(task.status) &&
    task.lockReason !== "TASK_CAMPAIGN_COMPLETED";

  const attachedPartners = task.partners ?? [];
  const attachedIdSet = new Set(
    attachedPartners.map((item) => item.collaboratorId),
  );

  const campaignPartnersQuery = useQuery({
    queryKey: ["task-campaign-partner-options", task.workspaceId],
    queryFn: async () =>
      (await campaignPartnerService.list(task.workspaceId, 0, 100)).data.data,
    enabled: pickerOpen && canModifyPartners,
  });

  const directoryOptionsQuery = useQuery({
    queryKey: ["task-directory-partner-options", task.workspaceId],
    queryFn: async () =>
      (await campaignPartnerService.options(task.workspaceId, 0, 100)).data.data,
    enabled: pickerOpen && canModifyPartners,
  });

  if (isClient) {
    return null;
  }

  async function savePartners(nextIds: string[]) {
    if (saving) return;
    setSaving(true);
    try {
      await workflow.partners(nextIds);
      toast.success(t("tasks.partners.saved"));
    } catch (error) {
      toast.error(workflowError(error, t));
    } finally {
      setSaving(false);
    }
  }

  function handleTogglePartner(collaboratorId: string) {
    const currentIds = attachedPartners.map((item) => item.collaboratorId);
    const nextIds = currentIds.includes(collaboratorId)
      ? currentIds.filter((id) => id !== collaboratorId)
      : [...currentIds, collaboratorId];
    void savePartners(nextIds);
  }

  const campaignPartners = campaignPartnersQuery.data?.partners.content ?? [];
  const campaignIdSet = new Set(
    campaignPartners.map((item) => item.collaboratorId),
  );
  const extraDirectoryOptions = (directoryOptionsQuery.data?.content ?? []).filter(
    (opt) => !campaignIdSet.has(opt.id),
  );

  return (
    <div className="space-y-2.5 pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs text-muted-foreground flex items-center gap-1.5 font-semibold">
          <Handshake className="text-brand-orange size-3.5" />
          <span>{t("tasks.partners.title")}</span>
          {attachedPartners.length > 0 && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[10px] font-semibold"
            >
              {attachedPartners.length}
            </Badge>
          )}
        </span>

        {canModifyPartners && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-brand-orange hover:bg-brand-orange/10 hover:text-brand-orange h-6 gap-1 px-2 text-[11px] font-semibold"
            onClick={() => setPickerOpen((prev) => !prev)}
            disabled={saving}
          >
            <Plus className="size-3" />
            <span>{t("tasks.partners.selectAction")}</span>
            {pickerOpen ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </Button>
        )}
      </div>

      {/* Picker danh sách đối tác để gắn vào công việc */}
      {pickerOpen && canModifyPartners && (
        <div className="border-brand-orange/35 bg-brand-orange-soft/20 space-y-2.5 rounded-lg border p-2.5">
          {campaignPartnersQuery.isLoading || directoryOptionsQuery.isLoading ? (
            <div className="flex justify-center py-3">
              <Spinner />
            </div>
          ) : campaignPartners.length === 0 && extraDirectoryOptions.length === 0 ? (
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground">
                {t("tasks.partners.noneAvailable")}
              </p>
              <Link
                to={`/workspaces/${task.workspaceId}/campaign-partners`}
                className="text-brand-orange inline-flex items-center gap-1 font-semibold hover:underline"
              >
                <span>{t("tasks.partners.openCampaignPartners")}</span>
                <ExternalLink className="size-3" />
              </Link>
            </div>
          ) : (
            <div className="max-h-52 space-y-2 overflow-y-auto pr-0.5">
              {campaignPartners.length > 0 && (
                <div className="space-y-1">
                  <div className="text-muted-foreground px-1 text-[10px] font-semibold tracking-wider uppercase">
                    {t("tasks.partners.fromCampaign")}
                  </div>
                  {campaignPartners.map((partner) => {
                    const checked = attachedIdSet.has(partner.collaboratorId);
                    return (
                      <button
                        key={partner.collaboratorId}
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          handleTogglePartner(partner.collaboratorId)
                        }
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors",
                          checked
                            ? "border-brand-orange bg-brand-orange/10 font-semibold"
                            : "border-border/80 bg-background hover:border-brand-orange/40",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "flex size-3.5 shrink-0 items-center justify-center rounded border",
                              checked
                                ? "border-brand-orange bg-brand-orange text-white"
                                : "border-border bg-background",
                            )}
                          >
                            {checked && <Check className="size-2.5" />}
                          </span>
                          <span className="truncate">{partner.partnerName}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] font-normal"
                        >
                          {t(`campaign.partners.types.${partner.partnerType}`, {
                            defaultValue: partner.partnerType,
                          })}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}

              {extraDirectoryOptions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-muted-foreground px-1 text-[10px] font-semibold tracking-wider uppercase">
                    {t("tasks.partners.fromAgencyDirectory")}
                  </div>
                  {extraDirectoryOptions.map((partner) => {
                    const checked = attachedIdSet.has(partner.id);
                    return (
                      <button
                        key={partner.id}
                        type="button"
                        disabled={saving}
                        onClick={() => handleTogglePartner(partner.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors",
                          checked
                            ? "border-brand-orange bg-brand-orange/10 font-semibold"
                            : "border-border/80 bg-background hover:border-brand-orange/40",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "flex size-3.5 shrink-0 items-center justify-center rounded border",
                              checked
                                ? "border-brand-orange bg-brand-orange text-white"
                                : "border-border bg-background",
                            )}
                          >
                            {checked && <Check className="size-2.5" />}
                          </span>
                          <span className="truncate">{partner.partnerName}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] font-normal"
                        >
                          {t(`campaign.partners.types.${partner.partnerType}`, {
                            defaultValue: partner.partnerType,
                          })}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Danh sách thẻ đối tác đã gán & thông tin liên hệ trực tiếp */}
      {attachedPartners.length === 0 ? (
        <div className="border-border/70 bg-muted/20 flex items-center justify-between gap-2 rounded-lg border border-dashed px-2.5 py-2 text-xs">
          <span className="text-muted-foreground">
            {t("tasks.partners.empty")}
          </span>
          <Link
            to={`/workspaces/${task.workspaceId}/campaign-partners`}
            className="text-brand-orange shrink-0 font-medium hover:underline"
          >
            {t("tasks.partners.openCampaignPartners")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-2" aria-label={t("tasks.partners.title")}>
          {attachedPartners.map((partner) => (
            <li
              key={partner.collaboratorId}
              className="border-border/80 bg-muted/20 space-y-2 rounded-lg border p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <Building2 className="text-brand-orange size-3.5 shrink-0" />
                  <span className="text-foreground truncate text-xs font-semibold">
                    {partner.partnerName}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {t(`campaign.partners.types.${partner.partnerType}`, {
                      defaultValue: partner.partnerType,
                    })}
                  </Badge>
                  {partner.cooperationStatus && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                        getCooperationStatusBadge(partner.cooperationStatus),
                      )}
                    >
                      {t(
                        `campaign.partners.status.${partner.cooperationStatus}`,
                        { defaultValue: partner.cooperationStatus },
                      )}
                    </span>
                  )}
                </div>

                {canModifyPartners && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleTogglePartner(partner.collaboratorId)}
                    title={t("tasks.partners.detach")}
                    aria-label={t("tasks.partners.detach")}
                    className="text-muted-foreground hover:text-destructive shrink-0 rounded p-0.5 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <PartnerContactCardInfo
                contactInfo={partner.contactInfo}
                notes={partner.notes}
                compact
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
