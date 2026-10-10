import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkItemsEditor } from "@/pages/campaign/components/WorkItemsEditor";
import type { Campaign, CampaignPlan, Timeline } from "@/pages/campaign/types";
import type { PackageDeliverable } from "@/pages/media-package/types/mediaPackage";

export function CampaignForm({ campaign, deliverables, saving, onSave, onCancel }: {
  campaign: Campaign | null; deliverables: PackageDeliverable[]; saving: boolean;
  onSave: (plan: CampaignPlan) => Promise<void>; onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState<CampaignPlan>({ name: campaign?.name ?? "",
    strategyDetail: campaign?.strategyDetail ?? "", brandGuideline: campaign?.brandGuideline ?? "",
    timeline: campaign?.timeline ?? "{}", workItems: campaign?.workItems ?? [] });
  const timeline = JSON.parse(plan.timeline) as Timeline;
  const patch = (value: Partial<CampaignPlan>) => setPlan(current => ({ ...current, ...value }));
  const patchTimeline = (value: Partial<Timeline>) => patch({ timeline: JSON.stringify({ ...timeline, ...value }) });
  return <form className="space-y-4" onSubmit={event => { event.preventDefault(); void onSave(plan); }}>
    <fieldset disabled={saving} className="space-y-4">
      <Input required maxLength={255} label={t("campaign.name")} value={plan.name}
        onChange={event => patch({ name: event.target.value })} />
      <label className="block space-y-2"><span>{t("campaign.strategy")}</span>
        <Textarea maxLength={10000} value={plan.strategyDetail}
          onChange={event => patch({ strategyDetail: event.target.value })} /></label>
      <label className="block space-y-2"><span>{t("campaign.brand")}</span>
        <Textarea maxLength={10000} value={plan.brandGuideline}
          onChange={event => patch({ brandGuideline: event.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="date" label={t("campaign.startDate")} value={timeline.startDate ?? ""}
          max={timeline.endDate} onChange={event => patchTimeline({ startDate: event.target.value || undefined })} />
        <Input type="date" label={t("campaign.endDate")} value={timeline.endDate ?? ""}
          min={timeline.startDate} onChange={event => patchTimeline({ endDate: event.target.value || undefined })} />
      </div>
      <h4 className="font-semibold">{t("campaign.milestones")}</h4>
      {(timeline.milestones ?? []).map((milestone, index) => <div key={index} className="grid gap-2 sm:grid-cols-3">
        <Input required label={t("campaign.itemName")} maxLength={255} value={milestone.name}
          onChange={event => patchTimeline({ milestones: timeline.milestones?.map((entry, position) =>
            position === index ? { ...entry, name: event.target.value } : entry) })} />
        <Input required type="date" label={t("campaign.date")} value={milestone.date}
          min={timeline.startDate} max={timeline.endDate}
          onChange={event => patchTimeline({ milestones: timeline.milestones?.map((entry, position) =>
            position === index ? { ...entry, date: event.target.value } : entry) })} />
        <Button type="button" variant="outline" onClick={() => patchTimeline({
          milestones: timeline.milestones?.filter((_, position) => position !== index),
        })}>{t("campaign.remove")}</Button>
      </div>)}
      <Button type="button" variant="outline" disabled={(timeline.milestones?.length ?? 0) >= 100}
        onClick={() => patchTimeline({ milestones: [...(timeline.milestones ?? []), { name: "", date: "" }] })}>
        {t("campaign.addMilestone")}</Button>
      <WorkItemsEditor deliverables={deliverables} value={plan.workItems} onChange={workItems => patch({ workItems })} />
      <div className="flex gap-2">
        <Button type="submit" loading={saving}>{t("campaign.save")}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>{t("campaign.cancel")}</Button>
      </div>
    </fieldset>
  </form>;
}
