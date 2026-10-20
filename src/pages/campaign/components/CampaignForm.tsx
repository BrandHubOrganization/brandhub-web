import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpHint } from "@/components/shared/HelpHint";
import { startDateChange } from "@/pages/campaign/campaignDates";
import { Textarea } from "@/components/ui/textarea";
import { DiscardChangesDialog } from "@/pages/media-package/components/DiscardChangesDialog";
import { useDraftUnloadWarning } from "@/pages/media-package/hooks/useDraftUnloadWarning";
import { WorkItemsEditor } from "@/pages/campaign/components/WorkItemsEditor";
import type { Campaign, CampaignPlan, Timeline } from "@/pages/campaign/types";
import type { PackageDeliverable } from "@/pages/media-package/types/mediaPackage";

export function CampaignForm({
  campaign,
  deliverables,
  durationWeeks,
  saving,
  onSave,
  onCancel,
}: {
  campaign: Campaign | null;
  deliverables: PackageDeliverable[];
  durationWeeks?: number | null;
  saving: boolean;
  onSave: (plan: CampaignPlan) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState<CampaignPlan>({
    name: campaign?.name ?? "",
    strategyDetail: campaign?.strategyDetail ?? "",
    brandGuideline: campaign?.brandGuideline ?? "",
    timeline: campaign?.timeline ?? "{}",
    workItems: campaign?.workItems ?? [],
  });
  const [initial] = useState(() => JSON.stringify(plan));
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const dirty = JSON.stringify(plan) !== initial;
  useDraftUnloadWarning(dirty);
  const timeline = JSON.parse(plan.timeline) as Timeline;
  const patch = (value: Partial<CampaignPlan>) =>
    setPlan((current) => ({ ...current, ...value }));
  const patchTimeline = (value: Partial<Timeline>) =>
    patch({ timeline: JSON.stringify({ ...timeline, ...value }) });
  return (
    <>
      <form
        className="border-border bg-card rounded-xl border p-4 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void onSave(plan);
        }}
      >
        <fieldset disabled={saving} className="min-w-0 space-y-4">
          <Input
            required
            maxLength={255}
            label={t("campaign.name")}
            value={plan.name}
            onChange={(event) => patch({ name: event.target.value })}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block space-y-2">
              <span>{t("campaign.strategy")}</span>
              <Textarea
                maxLength={10000}
                value={plan.strategyDetail}
                onChange={(event) =>
                  patch({ strategyDetail: event.target.value })
                }
              />
            </label>
            <label className="block space-y-2">
              <span>{t("campaign.brand")}</span>
              <Textarea
                maxLength={10000}
                value={plan.brandGuideline}
                onChange={(event) =>
                  patch({ brandGuideline: event.target.value })
                }
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="date"
              label={t("campaign.startDate")}
              value={timeline.startDate ?? ""}
              onChange={(event) =>
                patchTimeline(
                  startDateChange(timeline, event.target.value, durationWeeks),
                )
              }
            />
            <div className="space-y-1">
              <Input
                type="date"
                label={t("campaign.endDate")}
                value={timeline.endDate ?? ""}
                min={timeline.startDate}
                onChange={(event) =>
                  patchTimeline({ endDate: event.target.value || undefined })
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
          <section
            aria-label={t("campaign.milestones")}
            className="border-border space-y-6 border-t pt-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <h4 className="font-semibold">{t("campaign.milestones")}</h4>
                <HelpHint label={t("campaign.milestones")}>
                  {t("campaign.ui.milestonesHint")}
                </HelpHint>
              </div>
            </div>
            {(timeline.milestones ?? []).map((milestone, index) => (
              <div
                key={index}
                className="border-border grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  required
                  label={t("campaign.milestoneName")}
                  maxLength={255}
                  value={milestone.name}
                  onChange={(event) =>
                    patchTimeline({
                      milestones: timeline.milestones?.map((entry, position) =>
                        position === index
                          ? { ...entry, name: event.target.value }
                          : entry,
                      ),
                    })
                  }
                />
                <Input
                  required
                  type="date"
                  label={t("campaign.date")}
                  value={milestone.date}
                  min={timeline.startDate}
                  max={timeline.endDate}
                  onChange={(event) =>
                    patchTimeline({
                      milestones: timeline.milestones?.map((entry, position) =>
                        position === index
                          ? { ...entry, date: event.target.value }
                          : entry,
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    patchTimeline({
                      milestones: timeline.milestones?.filter(
                        (_, position) => position !== index,
                      ),
                    })
                  }
                >
                  {t("campaign.remove")}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={(timeline.milestones?.length ?? 0) >= 100}
              onClick={() =>
                patchTimeline({
                  milestones: [
                    ...(timeline.milestones ?? []),
                    { name: "", date: "" },
                  ],
                })
              }
            >
              {t("campaign.addMilestone")}
            </Button>
          </section>
          <WorkItemsEditor
            deliverables={deliverables}
            value={plan.workItems}
            onChange={(workItems) => patch({ workItems })}
          />
          <div className="border-border flex flex-wrap gap-2 border-t pt-5">
            <Button type="submit" variant="orange" loading={saving}>
              {t("campaign.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => (dirty ? setConfirmDiscard(true) : onCancel())}
            >
              {t("campaign.cancel")}
            </Button>
          </div>
        </fieldset>
      </form>
      <DiscardChangesDialog
        open={confirmDiscard}
        onKeep={() => setConfirmDiscard(false)}
        onDiscard={onCancel}
      />
    </>
  );
}
