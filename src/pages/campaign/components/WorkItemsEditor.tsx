import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HelpHint } from "@/components/shared/HelpHint";
import type { PackageDeliverable } from "@/pages/media-package/types/mediaPackage";
import type { WorkItem } from "@/pages/campaign/types";

export function WorkItemsEditor({
  deliverables,
  value,
  onChange,
  formId,
  saving,
  renderTask,
  allowMissingDeadline = false,
  defaultDueDate,
}: {
  deliverables: PackageDeliverable[];
  value: WorkItem[];
  onChange: (items: WorkItem[]) => void;
  formId: string;
  saving: boolean;
  renderTask: (workItemId: string) => ReactNode;
  allowMissingDeadline?: boolean;
  defaultDueDate?: string;
}) {
  const { t, i18n } = useTranslation();
  const change = (id: string, patch: Partial<WorkItem>) =>
    onChange(
      value.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );

  const deliverableIds = new Set(deliverables.map((d) => d.id));
  const unassignedItems = value.filter(
    (item) => !item.deliverableId || !deliverableIds.has(item.deliverableId),
  );

  return (
    <section
      aria-label={t("campaign.workItems")}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Layers className="size-4" />
          </div>
          <h4 className="text-sm font-semibold tracking-tight">
            {t("campaign.workItems")}
          </h4>
          <HelpHint label={t("campaign.workItems")}>
            {t("campaign.workItemsHint")}
          </HelpHint>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-2xs font-mono">
            {deliverables.length}{" "}
            {i18n.language.startsWith("vi") ? "mục gói" : "deliverables"}
          </Badge>
          <Badge variant="secondary" className="text-2xs font-mono">
            {value.length}{" "}
            {i18n.language.startsWith("vi") ? "công việc" : "tasks"}
          </Badge>
        </div>
      </div>

      <div className="space-y-3.5">
        {deliverables.map((deliverable) => {
          const deliverableItems = value.filter(
            (item) => item.deliverableId === deliverable.id,
          );
          const target = Number(deliverable.quantity) || 1;
          const allocated = deliverableItems.length;
          const percentage = Math.min(
            100,
            Math.round((allocated / target) * 100),
          );

          return (
            <div
              key={deliverable.id}
              className="border-border/70 bg-card rounded-xl border p-3 sm:p-3.5 shadow-2xs space-y-2.5"
            >
              {/* Deliverable Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="bg-brand-orange-soft text-brand-orange flex size-6 shrink-0 items-center justify-center rounded-md">
                    <Layers className="size-3.5" />
                  </div>
                  <span className="text-foreground truncate text-sm font-semibold">
                    {deliverable.name}
                  </span>
                  <Badge variant="outline" className="text-2xs font-medium">
                    {deliverable.quantity} {deliverable.unit}
                  </Badge>
                </div>
                <div className="text-muted-foreground text-2xs ml-auto flex items-center gap-2">
                  <span className="font-mono tabular-nums">
                    {allocated} / {deliverable.quantity} ({percentage}%)
                  </span>
                  <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full sm:w-20">
                    <div
                      className="bg-brand-orange h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Work Items Rows */}
              {deliverableItems.length === 0 ? (
                <p className="text-muted-foreground py-1 text-xs italic">
                  {t("campaign.noWorkItems")}
                </p>
              ) : (
                <div className="space-y-2">
                  {deliverableItems.map((item) => {
                    const taskDetail = renderTask(item.id);
                    return (
                      <div
                        key={item.id}
                        className="border-border/60 bg-muted/15 focus-within:border-brand-orange/50 focus-within:bg-card rounded-lg border p-2 sm:px-3 sm:py-2 transition-colors"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="text-muted-foreground/40 text-2xs font-mono select-none hidden sm:inline-block">
                              ↳
                            </span>
                            <Input
                              form={formId}
                              disabled={saving}
                              required
                              maxLength={255}
                              className="h-8.5 text-xs"
                              placeholder={t("campaign.workItemName")}
                              aria-label={t("campaign.workItemName")}
                              value={item.name}
                              onChange={(event) =>
                                change(item.id, { name: event.target.value })
                              }
                            />
                          </div>

                          <div className="w-full shrink-0 sm:w-52">
                            <Input
                              form={formId}
                              disabled={saving}
                              required={
                                !defaultDueDate && !allowMissingDeadline
                              }
                              type="datetime-local"
                              className="h-8.5 text-xs font-mono"
                              aria-label={t("campaign.dueDate")}
                              value={
                                item.dueDate
                                  ? localDateTime(item.dueDate)
                                  : (defaultDueDate ?? "")
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
                        </div>

                        {taskDetail && (
                          <div className="border-border/40 mt-2 border-t pt-1.5 text-xs">
                            {taskDetail}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Supplemental / Unassigned Work Items if any */}
        {unassignedItems.length > 0 && (
          <div className="border-border/70 bg-card rounded-xl border p-3 sm:p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs">
                  #
                </span>
                <span className="text-foreground text-sm font-semibold">
                  {t(
                    "campaign.closure.supplemental",
                    "Unassigned / Công việc khác",
                  )}
                </span>
              </div>
              <Badge variant="secondary" className="text-2xs font-mono">
                {unassignedItems.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {unassignedItems.map((item) => {
                const taskDetail = renderTask(item.id);
                return (
                  <div
                    key={item.id}
                    className="border-border/60 bg-muted/15 focus-within:border-brand-orange/50 focus-within:bg-card rounded-lg border p-2 sm:px-3 sm:py-2 transition-colors"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="text-muted-foreground/40 text-2xs font-mono select-none hidden sm:inline-block">
                          ↳
                        </span>
                        <Input
                          form={formId}
                          disabled={saving}
                          required
                          maxLength={255}
                          className="h-8.5 text-xs"
                          placeholder={t("campaign.workItemName")}
                          aria-label={t("campaign.workItemName")}
                          value={item.name}
                          onChange={(event) =>
                            change(item.id, { name: event.target.value })
                          }
                        />
                      </div>
                      <div className="w-full shrink-0 sm:w-52">
                        <Input
                          form={formId}
                          disabled={saving}
                          required={!defaultDueDate && !allowMissingDeadline}
                          type="datetime-local"
                          className="h-8.5 text-xs font-mono"
                          aria-label={t("campaign.dueDate")}
                          value={
                            item.dueDate
                              ? localDateTime(item.dueDate)
                              : (defaultDueDate ?? "")
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
                    </div>
                    {taskDetail && (
                      <div className="border-border/40 mt-2 border-t pt-1.5 text-xs">
                        {taskDetail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
