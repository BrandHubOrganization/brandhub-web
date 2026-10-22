import { useTranslation } from "react-i18next";
import { Plus, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HelpHint } from "@/components/shared/HelpHint";
import type {
  PackageDeliverable,
  PackageServiceType,
} from "@/pages/media-package/types/mediaPackage";
import type { TaskType, WorkItem } from "@/pages/campaign/types";

const taskTypes: Record<PackageServiceType, TaskType> = {
  SOCIAL_POST: "POST",
  LIVESTREAM_PREPARATION: "LIVESTREAM",
  WORKSHOP_SUPPORT: "SURVEY",
  EVENT_PLANNING: "EVENT_PLAN",
  PRESS_RECOMMENDATION: "PRESS_RECOMMENDATION",
};

export function WorkItemsEditor({
  deliverables,
  value,
  onChange,
}: {
  deliverables: PackageDeliverable[];
  value: WorkItem[];
  onChange: (items: WorkItem[]) => void;
}) {
  const { t } = useTranslation();
  const change = (id: string, patch: Partial<WorkItem>) =>
    onChange(
      value.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );

  return (
    <section
      aria-label={t("campaign.workItems")}
      className="border-border space-y-4 border-t pt-6"
    >
      <div className="flex items-center gap-1.5">
        <h4 className="text-sm font-semibold tracking-tight">
          {t("campaign.workItems")}
        </h4>
        <HelpHint label={t("campaign.workItems")}>
          {t("campaign.workItemsHint")}
        </HelpHint>
      </div>

      <div className="space-y-4">
        {deliverables.map((deliverable) => {
          const deliverableItems = value.filter(
            (item) => item.deliverableId === deliverable.id,
          );

          return (
            <div
              key={deliverable.id}
              className="border-border/80 bg-muted/20 space-y-3.5 rounded-xl border p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-border/50 border-b pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-brand-orange-soft text-brand-orange flex size-6.5 shrink-0 items-center justify-center rounded-md">
                    <Layers className="size-3.5" />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">
                    {deliverable.name}
                  </span>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {deliverable.quantity} {deliverable.unit}
                  </Badge>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 shadow-2xs"
                  disabled={value.length >= 500}
                  onClick={() =>
                    onChange([
                      ...value,
                      {
                        id: crypto.randomUUID(),
                        deliverableId: deliverable.id,
                        name: deliverable.name,
                        type: taskTypes[deliverable.serviceType],
                        dueDate: "",
                      },
                    ])
                  }
                >
                  <Plus className="size-3.5" />
                  <span>{t("campaign.addWorkItem")}</span>
                </Button>
              </div>

              {deliverableItems.length === 0 ? (
                <p className="text-muted-foreground text-xs italic py-1">
                  {t("campaign.noWorkItems")}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {deliverableItems.map((item) => (
                    <div
                      key={item.id}
                      className="border-border/80 bg-card rounded-lg border p-3 shadow-2xs transition-colors focus-within:border-brand-orange/50 sm:p-3.5"
                    >
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1">
                          <Input
                            required
                            maxLength={255}
                            label={t("campaign.workItemName")}
                            value={item.name}
                            onChange={(event) =>
                              change(item.id, { name: event.target.value })
                            }
                          />
                        </div>

                        <div className="flex items-end gap-2">
                          <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
                            <Input
                              required
                              type="datetime-local"
                              label={t("campaign.dueDate")}
                              value={
                                item.dueDate ? localDateTime(item.dueDate) : ""
                              }
                              onChange={(event) =>
                                change(item.id, {
                                  dueDate: event.target.value
                                    ? new Date(event.target.value).toISOString()
                                    : "",
                                })
                              }
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive size-9 shrink-0 transition-colors"
                            title={t("campaign.remove")}
                            aria-label={t("campaign.remove")}
                            onClick={() =>
                              onChange(
                                value.filter((entry) => entry.id !== item.id),
                              )
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function localDateTime(instant: string) {
  const date = new Date(instant);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
