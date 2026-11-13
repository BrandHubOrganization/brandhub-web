import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CallChip } from "@/components/micro";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { campaignService } from "@/pages/campaign/services/campaignService";
import { packagePlanningService } from "@/pages/media-package/services/packagePlanningService";
import { useCampaignTimeline } from "@/pages/campaign/hooks/useCampaignTimeline";
import { useCampaignPlanSave } from "@/pages/campaign/hooks/useCampaignPlanSave";
import { CampaignInlineField } from "@/pages/campaign/components/CampaignInlineField";
import { CampaignBriefPanel } from "@/pages/campaign/components/CampaignBriefPanel";
import { CampaignTimelineGrid } from "@/pages/campaign/components/CampaignTimelineGrid";
import { CampaignDeploymentPanel } from "@/pages/campaign/components/CampaignDeploymentPanel";
import { CampaignFeedbackRail } from "@/pages/campaign/components/CampaignFeedbackRail";
import { CampaignTaskDialog } from "@/pages/campaign/components/CampaignTaskDialog";
import { CampaignClosureSection } from "@/pages/campaign/components/CampaignClosureSection";
import { CampaignLoadingState } from "@/pages/campaign/components/CampaignLoadingState";
import {
  CampaignProcessStepper,
  type CampaignProcessStep,
} from "@/pages/campaign/components/CampaignProcessStepper";
import { CampaignPartnersPanel } from "@/pages/campaign-partners/components/CampaignPartnersPanel";
import { useCampaignPartners } from "@/pages/campaign-partners/hooks/useCampaignPartners";
import { countFilledBriefBlocks, normalizeBrief } from "@/pages/campaign/utils/campaignBrief";
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
  const partnersState = useCampaignPartners(selection.workspaceId, 50);
  const { ref: workspaceRef, height: workspaceHeight } = useCampaignViewport();
  const [taskTarget, setTaskTarget] = useState<{
    id: string;
    subtaskId?: string | null;
  } | null>(null);
  const [excludedSubtaskIds, setExcludedSubtaskIds] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<CampaignProcessStep>(() => {
    const timeline = parseTimeline(campaign.timeline);
    const brief = countFilledBriefBlocks(
      {
        strategyDetail: campaign.strategyDetail || "",
        brandGuideline: campaign.brandGuideline || "",
      },
      normalizeBrief(timeline.brief),
    );
    return campaign.status === "DRAFT" && brief.filled === 0 ? "info" : "tasks";
  });
  const editable = canManage && campaign.status === "DRAFT";
  const briefEditable = canManage && campaign.status !== "COMPLETED";
  const selectableSubtasks =
    canManage && ["DRAFT", "APPROVED"].includes(campaign.status);
  const toggleSubtaskSelection = useCallback(
    (subtaskId: string, included: boolean) => {
      setExcludedSubtaskIds((prev) =>
        included
          ? prev.filter((id) => id !== subtaskId)
          : prev.includes(subtaskId)
            ? prev
            : [...prev, subtaskId],
      );
    },
    [],
  );
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

  const parsedTimeline = useMemo(
    () => parseTimeline(campaign.timeline),
    [campaign.timeline],
  );
  const briefProgress = useMemo(
    () =>
      countFilledBriefBlocks(
        {
          strategyDetail: campaign.strategyDetail || "",
          brandGuideline: campaign.brandGuideline || "",
        },
        normalizeBrief(parsedTimeline.brief),
      ),
    [campaign.brandGuideline, campaign.strategyDetail, parsedTimeline.brief],
  );
  const partnerCount = partnersState.data?.partners.totalElements ?? 0;
  const taskCount = state.data?.rows.length ?? campaign.workItems.length;
  const infoDone =
    Boolean(parsedTimeline.startDate && parsedTimeline.endDate) &&
    briefProgress.filled > 0;
  const tasksDone =
    campaign.status === "IN_PROGRESS" || campaign.status === "COMPLETED";
  const partnersDone = partnerCount > 0;

  const handleSelectProcessStep = useCallback((step: CampaignProcessStep) => {
    setActiveStep(step);
  }, []);

  return (
    <section
      ref={workspaceRef}
      className="ct-workspace"
      data-step={activeStep}
      style={
        {
          "--ct-available-height": `${workspaceHeight}px`,
        } as React.CSSProperties
      }
    >
      <header className="ct-workspace-header">
        <div className="flex min-w-[160px] flex-1 items-center gap-2.5">
          <span
            aria-hidden
            className="bg-brand-orange hidden h-5 w-1.5 shrink-0 rounded-full sm:inline-block"
          />
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
                className="h-8 border-transparent bg-transparent px-0 text-lg font-bold shadow-none md:text-xl"
              />
            ) : (
              <h1
                className="truncate text-xl font-bold"
                title={campaign.name}
              >
                {campaign.name}
              </h1>
            )}
          </div>
        </div>
        <div className="border-border bg-card flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5">
          {(["startDate", "endDate"] as const).map((field, idx) => (
            <div key={field} className="flex items-center gap-1">
              {idx === 1 && (
                <span className="text-muted-foreground text-xs">→</span>
              )}
              <div title={t(`campaign.${field}`)}>
                <CampaignInlineField
                  field={field}
                  hideLabel
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
                  className="h-7 w-[118px] border-0 bg-transparent px-1 text-xs tabular-nums shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          ))}
        </div>
        <CallChip
          state={
            plan.saving || state.busy
              ? "saving"
              : plan.hasUnsaved
                ? "unsaved"
                : "success"
          }
          label={
            plan.saving || state.busy
              ? t("campaign.timeline.saving")
              : plan.hasUnsaved
                ? t("campaign.timeline.unsaved")
                : t("campaign.timeline.saved")
          }
        />
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
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 gap-1.5 px-2.5 py-1 text-[11px] font-semibold",
            campaign.status === "IN_PROGRESS" &&
              "border-brand-orange/45 bg-brand-orange/15 text-brand-orange",
            campaign.status === "DRAFT" &&
              "border-amber-500/40 bg-amber-500/12 text-amber-900 dark:text-amber-200",
            campaign.status === "APPROVED" &&
              "border-sky-500/40 bg-sky-500/12 text-sky-800 dark:text-sky-300",
            campaign.status === "COMPLETED" &&
              "border-emerald-500/40 bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full bg-current",
            )}
          />
          {t(`campaign.status.${campaign.status}`)}
        </Badge>
        {isManager && campaign.status === "IN_PROGRESS" && (
          <CampaignClosureSection
            workspaceId={selection.workspaceId}
            campaign={campaign}
            onCompleted={onSaved}
            onTasksChanged={refreshTasks}
          />
        )}
        <CampaignDeploymentPanel
          workspaceId={selection.workspaceId}
          campaign={campaign}
          data={state.data}
          canDeploy={canDeploy}
          canManage={canManage}
          blocked={
            plan.hasUnsaved || plan.saving || state.busy || state.isError
          }
          excludedSubtaskIds={excludedSubtaskIds}
          onChanged={onReload}
        />
      </header>
      <CampaignProcessStepper
        activeStep={activeStep}
        onSelectStep={handleSelectProcessStep}
        infoDone={infoDone}
        infoSummary={t("campaign.process.infoSummary", {
          filled: briefProgress.filled,
          total: briefProgress.total,
        })}
        tasksDone={tasksDone}
        tasksSummary={t("campaign.process.tasksSummary", {
          count: taskCount,
          status: t(`campaign.status.${campaign.status}`),
        })}
        partnersDone={partnersDone}
        partnersSummary={
          partnerCount > 0
            ? t("campaign.process.partnersSummaryCount", { count: partnerCount })
            : t("campaign.process.partnersSummaryEmpty")
        }
      />
      {activeStep === "info" && (
        <CampaignBriefPanel
          key={campaign.id}
          campaign={campaign}
          open
          standalone
          onOpenChange={() => {}}
          busy={plan.saving}
          editable={briefEditable}
          onSaveBrief={plan.saveBrief}
          onDirty={plan.dirty}
        />
      )}

      {activeStep === "partners" && (
        <div className="pt-0.5">
          <CampaignPartnersPanel
            workspaceId={selection.workspaceId}
            externalState={partnersState}
            compact
            campaignCompleted={campaign.status === "COMPLETED"}
          />
        </div>
      )}

      {activeStep === "tasks" && (
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
              onOpenTask={(id, subtaskId) =>
                setTaskTarget({ id, subtaskId: subtaskId ?? null })
              }
              canCreateTask={canManage && campaign.status !== "COMPLETED"}
              onOutOfScopeCreated={refreshTasks}
              selectableSubtasks={selectableSubtasks}
              excludedSubtaskIds={excludedSubtaskIds}
              onToggleSubtask={toggleSubtaskSelection}
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
        </div>
      )}
      {activeStep !== "partners" && (
        <CampaignFeedbackRail
          key={`${state.userId}:${campaign.id}`}
          workspaceId={selection.workspaceId}
          campaign={campaign}
          userId={state.userId}
          canComment={role === "CLIENT" || isManager}
        />
      )}
      <CampaignTaskDialog
        workspaceId={selection.workspaceId}
        taskId={taskTarget?.id ?? null}
        initialSubtaskId={taskTarget?.subtaskId ?? null}
        onClose={() => setTaskTarget(null)}
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
  if (query.isPending) return <CampaignLoadingState />;
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>{t("campaign.empty")}</p>
          {["PENDING", "PROCESSING"].includes(preparation.data?.status || "") && (
            <CallChip
              state="pending"
              label={t("campaign.timeline.preparingPackage", {
                defaultValue: "Đang chuẩn bị gói…",
              })}
            />
          )}
        </div>
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
      key={campaign.id}
      {...props}
      campaign={campaign}
      canDeploy={preparation.data?.canDeploy === true}
      onSaved={saved}
      onReload={reload}
    />
  );
}
