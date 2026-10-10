import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PackageDeliverable, PackageServiceType } from "@/pages/media-package/types/mediaPackage";
import type { TaskType, WorkItem } from "@/pages/campaign/types";

const taskTypes: Record<PackageServiceType, TaskType> = {
  SOCIAL_POST: "POST", LIVESTREAM_PREPARATION: "LIVESTREAM", WORKSHOP_SUPPORT: "SURVEY",
  EVENT_PLANNING: "EVENT_PLAN", PRESS_RECOMMENDATION: "PRESS_RECOMMENDATION",
};
export function WorkItemsEditor({ deliverables, value, onChange }: {
  deliverables: PackageDeliverable[]; value: WorkItem[]; onChange: (items: WorkItem[]) => void;
}) {
  const { t } = useTranslation();
  const change = (id: string, patch: Partial<WorkItem>) => onChange(value.map(item =>
    item.id === id ? { ...item, ...patch } : item));
  return <section className="space-y-3">
    <h4 className="font-semibold">{t("campaign.workItems")}</h4>
    <p className="text-sm text-muted-foreground">{t("campaign.workItemsHint")}</p>
    {deliverables.map(deliverable => <div key={deliverable.id} className="rounded-xl border border-border p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{deliverable.name} · {deliverable.quantity} {deliverable.unit}</span>
        <Button type="button" variant="outline" disabled={value.length >= 500} onClick={() => onChange([...value, {
          id: crypto.randomUUID(), deliverableId: deliverable.id, name: deliverable.name,
          type: taskTypes[deliverable.serviceType], dueDate: "",
        }])}>{t("campaign.addWorkItem")}</Button>
      </div>
      {value.filter(item => item.deliverableId === deliverable.id).map(item => <div key={item.id}
        className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-end">
        <Input required maxLength={255} label={t("campaign.itemName")} value={item.name}
          onChange={event => change(item.id, { name: event.target.value })} />
        <Input required type="datetime-local" label={t("campaign.dueDate")}
          value={item.dueDate ? localDateTime(item.dueDate) : ""}
          onChange={event => change(item.id, { dueDate: event.target.value
            ? new Date(event.target.value).toISOString() : "" })} />
        <Button type="button" variant="outline" onClick={() => onChange(value.filter(entry => entry.id !== item.id))}>
          {t("campaign.remove")}
        </Button>
      </div>)}
    </div>)}
  </section>;
}

function localDateTime(instant: string) {
  const date = new Date(instant);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
