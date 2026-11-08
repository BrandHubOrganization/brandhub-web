import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Target, Clock, Calendar, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HelpHint } from "@/components/shared/HelpHint";
import { CampaignStrategyInput } from "@/pages/campaign/components/CampaignStrategyInput";
import { startDateChange } from "@/pages/campaign/campaignDates";
import { DiscardChangesDialog } from "@/pages/media-package/components/DiscardChangesDialog";
import { useDraftUnloadWarning } from "@/pages/media-package/hooks/useDraftUnloadWarning";
import { WorkItemsEditor } from "@/pages/campaign/components/WorkItemsEditor";
import {
  PlannedTaskDetails,
  TaskDrawerSheet,
} from "@/pages/campaign/components/PlannedTaskDetails";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type { Campaign, CampaignPlan, Timeline } from "@/pages/campaign/types";
import type { PackageDeliverable } from "@/pages/media-package/types/mediaPackage";

export function CampaignForm({
  campaign,
  workspaceId,
  manageTasks,
  deliverables,
  durationWeeks,
  saving,
  onSave,
  onCancel,
}: {
  campaign: Campaign | null;
  workspaceId: string;
  manageTasks: boolean;
  deliverables: PackageDeliverable[];
  durationWeeks?: number | null;
  saving: boolean;
  onSave: (plan: CampaignPlan) => Promise<void>;
  onCancel: () => void;
}) {
  const { t, i18n } = useTranslation();
  const formId = useId();
  const campaignId = campaign?.id ?? "";
  const showTaskDetails = manageTasks && campaign?.packageDriven === true;
  const plannedTasks = useQuery({
    queryKey: ["campaign-planned-tasks", workspaceId, campaignId],
    queryFn: async () =>
      (await campaignService.tasks(workspaceId, campaignId)).data.data,
    enabled: showTaskDetails,
  });
  const taskIds = new Map(
    plannedTasks.data?.map((task) => [task.campaignWorkItemId, task.id]),
  );
  const [plan, setPlan] = useState<CampaignPlan>({
    name: campaign?.name ?? "",
    strategyDetail: campaign?.strategyDetail ?? "",
    timeline: JSON.stringify(
      (() => {
        const existing = JSON.parse(campaign?.timeline || "{}") as Timeline;
        return existing.startDate
          ? existing
          : startDateChange(
              existing,
              format(new Date(), "yyyy-MM-dd"),
              durationWeeks,
            );
      })(),
    ),
    workItems: campaign?.workItems ?? [],
  });
  const [initial] = useState(() => JSON.stringify(plan));
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [activeSheetTaskId, setActiveSheetTaskId] = useState<string | null>(
    null,
  );
  const dirty = JSON.stringify(plan) !== initial;
  useDraftUnloadWarning(dirty);
  const timeline = JSON.parse(plan.timeline) as Timeline;
  const patch = (value: Partial<CampaignPlan>) =>
    setPlan((current) => ({ ...current, ...value }));
  const patchTimeline = (value: Partial<Timeline>) =>
    patch({ timeline: JSON.stringify({ ...timeline, ...value }) });

  return (
    <>
      <article
        id="campaign-form"
        className="border-border bg-card min-w-0 scroll-mt-6 space-y-6 rounded-2xl border p-4 shadow-xs sm:p-6"
      >
        {/* Header with status badge, title, and quick action buttons */}
        <header className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="outline" className="font-medium">
                {t("campaign.edit", "Chỉnh sửa kế hoạch")}
              </Badge>
              {campaign && (
                <span className="text-muted-foreground/80 text-xs">
                  {t("campaign.version", {
                    version: campaign.contentVersion,
                    packageVersion: campaign.packageTermsVersion,
                  })}
                </span>
              )}
            </div>
            <h3 className="text-foreground text-xl font-bold tracking-tight break-words sm:text-2xl">
              {plan.name || t("campaign.name")}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              form={formId}
              variant="orange"
              size="sm"
              loading={saving}
            >
              {t("campaign.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => (dirty ? setConfirmDiscard(true) : onCancel())}
            >
              {t("campaign.cancel")}
            </Button>
          </div>
        </header>

        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            const defaultDue = timeline.endDate
              ? new Date(`${timeline.endDate}T23:59:00`).toISOString()
              : null;
            void onSave({
              ...plan,
              workItems: plan.workItems.map((item) => ({
                ...item,
                dueDate: item.dueDate || defaultDue,
              })),
            });
          }}
        >
          {/* Main Responsive 2-Column Grid */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* LEFT COLUMN: Main Work Canvas */}
            <div className="space-y-5 lg:col-span-8">
              {/* Campaign Name Field */}
              <div className="border-border/70 bg-card space-y-3 rounded-xl border p-4 shadow-xs sm:p-5">
                <Input
                  form={formId}
                  required
                  maxLength={255}
                  label={t("campaign.name")}
                  placeholder={t("campaign.name")}
                  value={plan.name}
                  disabled={saving}
                  onChange={(event) => patch({ name: event.target.value })}
                />
              </div>

              {/* Task Details Status & Retries */}
              {showTaskDetails && plannedTasks.isPending && (
                <p role="status" className="text-muted-foreground text-sm">
                  {t("tasks.loading")}
                </p>
              )}
              {showTaskDetails && plannedTasks.isError && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void plannedTasks.refetch()}
                >
                  {t("tasks.retry")}
                </Button>
              )}

              {/* Work Items Editor Canvas */}
              <WorkItemsEditor
                formId={formId}
                saving={saving}
                renderTask={(workItemId) => {
                  const taskId = taskIds.get(workItemId);
                  return showTaskDetails && taskId ? (
                    <PlannedTaskDetails
                      workspaceId={workspaceId}
                      taskId={taskId}
                      onOpenDetails={(id: string) => setActiveSheetTaskId(id)}
                    />
                  ) : null;
                }}
                deliverables={deliverables}
                value={plan.workItems}
                allowMissingDeadline={campaign?.packageDriven}
                defaultDueDate={
                  timeline.endDate ? `${timeline.endDate}T23:59` : undefined
                }
                onChange={(workItems) => patch({ workItems })}
              />

              {/* Bottom Actions Bar */}
              <div className="border-border/70 flex flex-wrap items-center gap-2.5 border-t pt-4">
                <Button
                  type="submit"
                  form={formId}
                  variant="orange"
                  loading={saving}
                >
                  {t("campaign.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => (dirty ? setConfirmDiscard(true) : onCancel())}
                >
                  {t("campaign.cancel")}
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Properties Sidebar */}
            <div className="space-y-4 lg:sticky lg:top-4 lg:col-span-4">
              {/* Strategy Card */}
              <div className="border-border/70 bg-card space-y-3 rounded-xl border p-4 shadow-xs">
                <div className="text-foreground flex items-center gap-2">
                  <div className="bg-brand-orange-soft text-brand-orange flex size-7 items-center justify-center rounded-lg">
                    <Target className="size-4" />
                  </div>
                  <h4 className="text-sm font-semibold tracking-tight">
                    {t("campaign.strategy")}
                  </h4>
                </div>
                <CampaignStrategyInput
                  value={plan.strategyDetail}
                  onChange={(strategyDetail) => patch({ strategyDetail })}
                  disabled={saving}
                />
              </div>

              {/* Timeline & Dates Card */}
              <div className="border-border/70 bg-card space-y-3 rounded-xl border p-4 shadow-xs">
                <div className="text-foreground flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Clock className="size-4" />
                  </div>
                  <h4 className="text-sm font-semibold tracking-tight">
                    {i18n.language.startsWith("vi")
                      ? "Thời gian chiến dịch"
                      : "Timeline & Dates"}
                  </h4>
                </div>

                <div className="space-y-3">
                  <Input
                    form={formId}
                    disabled={saving}
                    type="date"
                    label={t("campaign.startDate")}
                    value={timeline.startDate ?? ""}
                    onChange={(event) =>
                      patchTimeline(
                        startDateChange(
                          timeline,
                          event.target.value,
                          durationWeeks,
                        ),
                      )
                    }
                  />
                  <div className="space-y-1">
                    <Input
                      form={formId}
                      disabled={saving}
                      type="date"
                      label={t("campaign.endDate")}
                      value={timeline.endDate ?? ""}
                      min={timeline.startDate}
                      onChange={(event) =>
                        patchTimeline({
                          endDate: event.target.value || undefined,
                        })
                      }
                    />
                    {durationWeeks != null && (
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        {t("campaign.compact.durationSuggestion", {
                          weeks: durationWeeks,
                        })}
                        <HelpHint label={t("campaign.endDate")}>
                          {t("campaign.compact.dateHelp")}
                        </HelpHint>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Milestones Editor Card */}
              <div className="border-border/70 bg-card space-y-3 rounded-xl border p-4 shadow-xs">
                <div className="text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <Calendar className="size-4" />
                    </div>
                    <h4 className="text-sm font-semibold tracking-tight">
                      {t("campaign.milestones")}
                    </h4>
                  </div>
                  <HelpHint label={t("campaign.milestones")}>
                    {t("campaign.ui.milestonesHint")}
                  </HelpHint>
                </div>

                {/* List of compact milestones */}
                <div className="space-y-2.5">
                  {!timeline.milestones || timeline.milestones.length === 0 ? (
                    <p className="text-muted-foreground py-1 text-xs italic">
                      {t("campaign.notSet")}
                    </p>
                  ) : (
                    timeline.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="border-border/60 bg-muted/20 focus-within:border-brand-orange/40 relative space-y-2 rounded-lg border p-2.5 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground text-2xs font-mono font-medium">
                            #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                            disabled={saving}
                            onClick={() =>
                              patchTimeline({
                                milestones: timeline.milestones?.filter(
                                  (_, position) => position !== index,
                                ),
                              })
                            }
                            aria-label={t("campaign.remove")}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                        <Input
                          form={formId}
                          disabled={saving}
                          required
                          maxLength={255}
                          className="h-8.5 text-xs"
                          placeholder={t("campaign.milestoneName")}
                          aria-label={t("campaign.milestoneName")}
                          value={milestone.name}
                          onChange={(event) =>
                            patchTimeline({
                              milestones: timeline.milestones?.map(
                                (entry, position) =>
                                  position === index
                                    ? { ...entry, name: event.target.value }
                                    : entry,
                              ),
                            })
                          }
                        />
                        <Input
                          form={formId}
                          disabled={saving}
                          required
                          type="date"
                          className="h-8.5 font-mono text-xs"
                          aria-label={t("campaign.date")}
                          value={milestone.date}
                          min={timeline.startDate}
                          max={timeline.endDate}
                          onChange={(event) =>
                            patchTimeline({
                              milestones: timeline.milestones?.map(
                                (entry, position) =>
                                  position === index
                                    ? { ...entry, date: event.target.value }
                                    : entry,
                              ),
                            })
                          }
                        />
                      </div>
                    ))
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={
                      saving || (timeline.milestones?.length ?? 0) >= 100
                    }
                    onClick={() =>
                      patchTimeline({
                        milestones: [
                          ...(timeline.milestones ?? []),
                          { name: "", date: "" },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    {t("campaign.addMilestone")}
                  </Button>
                </div>
              </div>

              {/* Form Actions Card */}
              <div className="border-border/70 bg-card space-y-2.5 rounded-xl border p-4 shadow-xs">
                <Button
                  type="submit"
                  form={formId}
                  variant="orange"
                  className="w-full justify-center"
                  loading={saving}
                >
                  {t("campaign.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center"
                  disabled={saving}
                  onClick={() => (dirty ? setConfirmDiscard(true) : onCancel())}
                >
                  {t("campaign.cancel")}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </article>

      <TaskDrawerSheet
        open={!!activeSheetTaskId}
        taskId={activeSheetTaskId}
        workspaceId={workspaceId}
        onOpenChange={(open) => !open && setActiveSheetTaskId(null)}
      />

      <DiscardChangesDialog
        open={confirmDiscard}
        onKeep={() => setConfirmDiscard(false)}
        onDiscard={onCancel}
      />
    </>
  );
}
