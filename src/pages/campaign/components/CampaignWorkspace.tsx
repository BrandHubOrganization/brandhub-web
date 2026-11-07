import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { campaignService } from "@/pages/campaign/services/campaignService";
import { packagePlanningService } from "@/pages/media-package/services/packagePlanningService";
import { useCampaignTimeline } from "@/pages/campaign/hooks/useCampaignTimeline";
import { useCampaignPlanSave } from "@/pages/campaign/hooks/useCampaignPlanSave";
import { CampaignInlineField } from "@/pages/campaign/components/CampaignInlineField";
import { CampaignPlanEditor } from "@/pages/campaign/components/CampaignPlanEditor";
import { CampaignTimelineGrid } from "@/pages/campaign/components/CampaignTimelineGrid";
import { CampaignDeploymentPanel } from "@/pages/campaign/components/CampaignDeploymentPanel";
import { CampaignFeedbackRail } from "@/pages/campaign/components/CampaignFeedbackRail";
import { CampaignTaskDialog } from "@/pages/campaign/components/CampaignTaskDialog";
import { CampaignClosureSection } from "@/pages/campaign/components/CampaignClosureSection";
import {
  parseTimeline,
  patchTimeline,
} from "@/pages/campaign/utils/timelineDates";
import { useCampaignViewport } from "@/pages/campaign/hooks/useCampaignViewport";
import type { Campaign } from "@/pages/campaign/types";
import type { WorkspaceMediaPackage } from "@/pages/media-package/types/mediaPackage";
interface Props {
  selection: WorkspaceMediaPackage;
  canManage: boolean;
  isManager: boolean;
}
function CampaignWorkspaceLoaded({
  campaign,
  selection,
  canManage,
  isManager,
  canDeploy,
  onSaved,
  onReload,
}: Props & {
  campaign: Campaign;
  canDeploy: boolean;
  onSaved: (value: Campaign) => void;
  onReload: () => void;
}) {
  const { t } = useTranslation();
  const state = useCampaignTimeline(selection.workspaceId, campaign.id);
  const plan = useCampaignPlanSave(selection.workspaceId, campaign, onSaved);
  const { ref: workspaceRef, height: workspaceHeight } = useCampaignViewport();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const editable = canManage && campaign.status === "DRAFT";
  const role = useWorkspaceStore(
    (s) =>
      s.workspaceList.find((w) => w.id === selection.workspaceId)?.myRole ??
      s.currentMemberRole,
  );
  const { refetch: refetchTasks } = state;
  const { dirty: markDirty } = plan;
  const milestoneDirty = useCallback(
    (value: boolean) => markDirty("milestones", value),
    [markDirty],
  );
  const refreshTasks = useCallback(() => {
    void refetchTasks();
  }, [refetchTasks]);
  return (
    <section
      ref={workspaceRef}
      className="ct-workspace"
      style={
        {
          "--ct-available-height": `${workspaceHeight}px`,
        } as React.CSSProperties
      }
    >
      <header className="ct-workspace-header">
        <div className="min-w-0 flex-1">
          {editable ? (
            <CampaignInlineField
              field="name"
              hideLabel
              label={t("campaign.name")}
              value={campaign.name}
              version={campaign.contentVersion}
              busy={plan.saving}
              onDirty={plan.dirty}
              onSave={(name, version) => plan.save({ name }, version)}
              className="h-9 border-transparent bg-transparent px-0 text-lg font-semibold shadow-none md:text-xl"
            />
          ) : (
            <h1
              className="truncate text-xl font-semibold"
              title={campaign.name}
            >
              {campaign.name}
            </h1>
          )}
        </div>
        <span
          role="status"
          className="text-muted-foreground shrink-0 text-[11px]"
        >
          {plan.saving || state.busy
            ? t("campaign.timeline.saving")
            : plan.hasUnsaved
              ? t("campaign.timeline.unsaved")
              : t("campaign.timeline.saved")}
        </span>
        <Button
          variant="secondary"
          size="icon"
          className="size-8 shrink-0"
          disabled={plan.saving || plan.hasUnsaved}
          onClick={onReload}
          aria-label={t("campaign.reload")}
        >
          <RefreshCw className="size-3.5" />
        </Button>
      </header>
      <div className="ct-workspace-grid">
        {state.isPending ? (
          <Skeleton className="ct-timeline-shell min-w-0 rounded-xl" />
        ) : state.isError || !state.data ? (
          <div
            className="border-border bg-card rounded-xl border p-6"
            role="alert"
          >
            <p className="text-destructive text-sm">
              {t("campaign.timeline.loadError")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTasks}
              className="mt-3"
            >
              {t("campaign.reload")}
            </Button>
          </div>
        ) : (
          <CampaignTimelineGrid
            key={selection.workspaceId}
            workspaceId={selection.workspaceId}
            campaign={campaign}
            data={state.data}
            userId={state.userId}
            busy={state.busy || plan.saving || plan.hasUnsaved}
            edit={state.edit}
            onOpenTask={setTaskId}
            campaignDates={
              <div className="ct-campaign-dates">
                {(["startDate", "endDate"] as const).map((field) => (
                  <CampaignInlineField
                    key={field}
                    field={field}
                    label={t(`campaign.${field}`)}
                    value={parseTimeline(campaign.timeline)[field] || ""}
                    type="date"
                    version={campaign.contentVersion}
                    busy={plan.saving}
                    disabled={!editable}
                    onDirty={plan.dirty}
                    onSave={(value, version) =>
                      plan.save(
                        {
                          timeline: patchTimeline(campaign.timeline, {
                            [field]: value,
                          }),
                        },
                        version,
                      )
                    }
                  />
                ))}
              </div>
            }
            canEditMilestones={editable}
            milestoneBusy={state.busy || plan.saving}
            milestoneBlocked={[...plan.dirtyFields].some(
              (key) => key !== "milestones",
            )}
            onMilestoneDirty={milestoneDirty}
            onMilestonesChange={(milestones, version) =>
              plan.save(
                {
                  timeline: patchTimeline(campaign.timeline, { milestones }),
                },
                version,
              )
            }
          />
        )}
        <aside className="ct-workspace-rail">
          <div className="ct-strategy-panel">
            <div className="flex items-center justify-end pb-2">
              <Badge variant="outline" className="text-[10px]">
                {t(`campaign.status.${campaign.status}`)}
              </Badge>
            </div>
            <CampaignPlanEditor
              campaign={campaign}
              busy={plan.saving}
              disabled={!editable}
              onSave={plan.save}
              onDirty={plan.dirty}
            />
          </div>
          <CampaignDeploymentPanel
            workspaceId={selection.workspaceId}
            campaign={campaign}
            data={state.data}
            canDeploy={canDeploy}
            canManage={canManage}
            blocked={
              plan.hasUnsaved || plan.saving || state.busy || state.isError
            }
            canClose={isManager}
            onChanged={onReload}
            onClose={() => setClosing(true)}
          />
          <CampaignFeedbackRail
            workspaceId={selection.workspaceId}
            campaign={campaign}
            userId={state.userId}
            canComment={role === "CLIENT"}
          />
        </aside>
      </div>
      {closing && (
        <CampaignClosureSection
          workspaceId={selection.workspaceId}
          campaign={campaign}
          onClose={() => setClosing(false)}
          onCompleted={(value) => {
            setClosing(false);
            onSaved(value);
          }}
          onTasksChanged={refreshTasks}
        />
      )}
      <CampaignTaskDialog
        workspaceId={selection.workspaceId}
        taskId={taskId}
        onClose={() => setTaskId(null)}
        onUpdated={refreshTasks}
      />
    </section>
  );
}
export function CampaignWorkspace(props: Props) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const workspaceId = props.selection.workspaceId;
  const key = ["campaign-workspace", userId, workspaceId];
  const query = useQuery({
    queryKey: key,
    queryFn: async () => (await campaignService.list(workspaceId)).data.data,
  });
  const preparation = useQuery({
    queryKey: ["campaign-preparation", userId, workspaceId],
    queryFn: () => packagePlanningService.status(workspaceId),
    refetchInterval: (q) =>
      ["PENDING", "PROCESSING"].includes(q.state.data?.status || "")
        ? 2000
        : false,
  });
  const { refetch: refetchCampaign } = query;
  useEffect(() => {
    if (preparation.data?.status === "READY") void refetchCampaign();
  }, [preparation.data?.status, refetchCampaign]);
  const campaign = query.data?.[0];
  const reload = useCallback(() => {
    void client.invalidateQueries({ queryKey: ["campaign-workspace"] });
    void client.invalidateQueries({ queryKey: ["campaign-timeline"] });
    void client.invalidateQueries({ queryKey: ["campaign-preparation"] });
  }, [client]);
  const saved = useCallback(
    (value: Campaign) => {
      client.setQueryData<Campaign[]>(
        ["campaign-workspace", userId, workspaceId],
        [value],
      );
    },
    [client, userId, workspaceId],
  );
  if (query.isPending)
    return (
      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-[65vh]" />
      </div>
    );
  if (query.isError)
    return (
      <div role="alert" className="space-y-3">
        <p>{t("campaign.error")}</p>
        <Button onClick={reload}>{t("campaign.reload")}</Button>
      </div>
    );
  if (!campaign)
    return (
      <section className="border-border bg-card space-y-3 rounded-xl border p-5">
        <p>{t("campaign.empty")}</p>
        {props.canManage && (
          <Button
            disabled={
              preparation.isPending ||
              ["PENDING", "PROCESSING"].includes(preparation.data?.status || "")
            }
            onClick={() =>
              void packagePlanningService
                .retry(workspaceId, props.selection.termsVersion)
                .then(reload)
                .catch(() => toast.error(t("campaign.error")))
            }
          >
            {t("campaign.timeline.retryPreparation")}
          </Button>
        )}
      </section>
    );
  return (
    <CampaignWorkspaceLoaded
      {...props}
      campaign={campaign}
      canDeploy={preparation.data?.canDeploy === true}
      onSaved={saved}
      onReload={reload}
    />
  );
}
