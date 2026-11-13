import { useState, type ReactNode } from "react";
import { Filter, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlideSelect, SpringCheck } from "@/components/micro";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isTimelineItemMissingDetails } from "@/pages/campaign/utils/timelineFilters";
import {
  EMPTY_FILTERS,
  type TimelineFilters,
  type TimelineView,
} from "@/pages/campaign/types/campaignTimeline";
import type { PackageDeliverable } from "@/pages/media-package/types/mediaPackage";
const FIELDS = [
  "assignee",
  "supervisor",
  "statuses",
  "types",
  "deliverable",
  "schedule",
  "completeness",
] as const;

const FIELD_DEFAULT_LABELS: Record<(typeof FIELDS)[number], string> = {
  assignee: "Người thực hiện",
  supervisor: "Người giám sát",
  statuses: "Trạng thái",
  types: "Loại công việc",
  deliverable: "Hạng mục",
  schedule: "Lịch trình",
  completeness: "Thông tin chi tiết",
};
export function TimelineFilterBar({
  filters,
  onChange,
  data,
  deliverables,
  trailingControls,
}: {
  filters: TimelineFilters;
  onChange: (filters: TimelineFilters) => void;
  data: TimelineView;
  deliverables: PackageDeliverable[];
  trailingControls?: ReactNode;
}) {
  const { t } = useTranslation();
  const [field, setField] = useState<(typeof FIELDS)[number]>("assignee");
  const people = [
    ...new Map(
      [
        ...Object.entries(data.names).map(([userId, displayName]) => ({
          userId,
          displayName,
        })),
        ...data.members,
      ].map((m) => [m.userId, m]),
    ).values(),
  ];
  const missingDetailsCount = data.rows.reduce(
    (sum, r) =>
      sum +
      (isTimelineItemMissingDetails(r) ? 1 : 0) +
      r.subtasks.filter((s) => isTimelineItemMissingDetails(s)).length,
    0,
  );
  const active =
    FIELDS.filter((f) =>
      f === "schedule"
        ? filters.schedule !== "all"
        : f === "completeness"
          ? filters.completeness !== "all"
          : filters[f].length > 0,
    ).length + Number(!!filters.from || !!filters.to);
  function single(value: string) {
    onChange({ ...filters, [field]: value });
  }
  function multiple(value: string) {
    const list =
      filters[
        field as
          "statuses" | "types" | "assignee" | "supervisor" | "deliverable"
      ];
    onChange({
      ...filters,
      [field]: list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    });
  }
  const statuses = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "FINISHED",
    "CANCELLED",
  ];
  const types = [...new Set(data.rows.map((r) => r.type))];
  const quickStatusValue =
    filters.statuses.length === 1 ? filters.statuses[0] : "ALL";
  return (
    <div className="border-border bg-card flex min-w-0 flex-wrap items-center gap-2 border-b px-3 py-2">
      <div className="border-input bg-background flex h-8 w-full min-w-[240px] shrink-0 items-center gap-1 rounded-md border px-1.5 sm:w-[280px]">
          <Search className="text-muted-foreground ml-1 size-3.5 shrink-0" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder={t("campaign.timeline.search")}
            aria-label={t("campaign.timeline.search")}
            className="h-7 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
          />
          <span className="bg-border h-4 w-px shrink-0" />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6.5 shrink-0 gap-1 px-2 text-xs font-normal",
                  active > 0 && "text-brand-orange font-medium",
                )}
              >
                <Filter className="size-3.5" />
                {t("campaign.timeline.filters")}
                {active > 0 && (
                  <span className="bg-brand-orange-soft text-brand-orange rounded px-1 text-[10px]">
                    {active}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[min(440px,calc(100vw-2rem))] p-0"
            >
          <div className="grid min-h-60 grid-cols-[164px_minmax(0,1fr)]">
            <div className="border-border space-y-1 border-r p-2">
              {FIELDS.map((f) => (
                <Button
                  key={f}
                  variant="ghost"
                  className={cn(
                    "h-8 w-full min-w-0 justify-start px-2 text-left text-xs whitespace-nowrap",
                    field === f && "bg-brand-orange-soft text-brand-orange",
                  )}
                  title={t(`campaign.timeline.filterFields.${f}`, {
                    defaultValue: FIELD_DEFAULT_LABELS[f],
                  })}
                  onClick={() => setField(f)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {t(`campaign.timeline.filterFields.${f}`, {
                      defaultValue: FIELD_DEFAULT_LABELS[f],
                    })}
                  </span>
                </Button>
              ))}
            </div>
            <div className="max-h-80 min-w-0 overflow-y-auto p-3">
              <h3 className="mb-3 text-xs font-semibold">
                {t(`campaign.timeline.filterFields.${field}`, {
                  defaultValue: FIELD_DEFAULT_LABELS[field],
                })}
              </h3>
              {(field === "assignee" || field === "supervisor") && (
                <div className="space-y-1">
                  {[
                    ...(field === "assignee"
                      ? [
                          {
                            userId: "unassigned",
                            displayName: t("campaign.timeline.unassigned"),
                          },
                        ]
                      : []),
                    ...people,
                  ].map((person) => {
                    const checked = filters[field].includes(person.userId);
                    return (
                      <div
                        key={person.userId}
                        onClick={() => multiple(person.userId)}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs transition-colors",
                          checked && "bg-brand-orange-soft text-brand-orange",
                        )}
                      >
                        <SpringCheck
                          checked={checked}
                          stopPropagation
                          ariaLabel={person.displayName}
                          onCheckedChange={() => multiple(person.userId)}
                        />
                        <span className="min-w-0 flex-1 break-words">
                          {person.displayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {(field === "statuses" || field === "types") && (
                <div className="space-y-1.5">
                  {(field === "statuses" ? statuses : types).map((v) => {
                    const checked = (
                      field === "statuses" ? filters.statuses : filters.types
                    ).includes(v);
                    const labelText = t(
                      field === "statuses"
                        ? `tasks.status.${v}`
                        : `tasks.types.${v}`,
                      { defaultValue: v },
                    );
                    return (
                      <div
                        key={v}
                        onClick={() => multiple(v)}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                          checked && "bg-brand-orange-soft text-brand-orange",
                        )}
                      >
                        <SpringCheck
                          checked={checked}
                          stopPropagation
                          ariaLabel={labelText}
                          onCheckedChange={() => multiple(v)}
                        />
                        <span className="min-w-0 flex-1 break-words">
                          {labelText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {field === "deliverable" && (
                <div className="space-y-1">
                  {deliverables.map((item) => {
                    const checked = filters.deliverable.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => multiple(item.id)}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs transition-colors",
                          checked && "bg-brand-orange-soft text-brand-orange",
                        )}
                      >
                        <SpringCheck
                          checked={checked}
                          stopPropagation
                          ariaLabel={item.name}
                          onCheckedChange={() => multiple(item.id)}
                        />
                        <span className="min-w-0 flex-1 break-words">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {field === "schedule" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    {(["all", "missing", "overdue"] as const).map((value) => (
                      <label
                        key={value}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs",
                          filters.schedule === value &&
                            "bg-brand-orange-soft text-brand-orange",
                        )}
                      >
                        <Input
                          type="radio"
                          name="campaign-timeline-schedule-filter"
                          wrapperClassName="w-auto shrink-0"
                          className="accent-brand-orange size-4 shrink-0 rounded-full p-0"
                          checked={filters.schedule === value}
                          onChange={() => single(value)}
                        />
                        <span className="min-w-0 flex-1 break-words">
                          {t(`campaign.timeline.scheduleOptions.${value}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                  <label className="block text-xs">
                    {t("campaign.timeline.from")}
                    <Input
                      type="date"
                      value={filters.from}
                      onChange={(e) =>
                        onChange({ ...filters, from: e.target.value })
                      }
                    />
                  </label>
                  <label className="block text-xs">
                    {t("campaign.timeline.to")}
                    <Input
                      type="date"
                      value={filters.to}
                      onChange={(e) =>
                        onChange({ ...filters, to: e.target.value })
                      }
                    />
                  </label>
                </div>
              )}
              {field === "completeness" && (
                <div className="space-y-1">
                  {(
                    [
                      {
                        value: "all",
                        label: t("campaign.timeline.completenessOptions.all", {
                          defaultValue: "Tất cả công việc",
                        }),
                      },
                      {
                        value: "missingDetails",
                        label: t(
                          "campaign.timeline.completenessOptions.missingDetails",
                          {
                            defaultValue:
                              "Chưa viết chi tiết / mô tả hoặc tiêu chí nghiệm thu",
                          },
                        ),
                      },
                      {
                        value: "complete",
                        label: t(
                          "campaign.timeline.completenessOptions.complete",
                          {
                            defaultValue: "Đã điền đầy đủ mô tả & tiêu chí",
                          },
                        ),
                      },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs",
                        filters.completeness === option.value &&
                          "bg-brand-orange-soft text-brand-orange",
                      )}
                    >
                      <Input
                        type="radio"
                        name="campaign-timeline-completeness-filter"
                        wrapperClassName="w-auto shrink-0"
                        className="accent-brand-orange size-4 shrink-0 rounded-full p-0"
                        checked={filters.completeness === option.value}
                        onChange={() => single(option.value)}
                      />
                      <span className="min-w-0 flex-1 break-words">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="border-border border-t p-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange({ ...EMPTY_FILTERS })}
              className="text-xs"
            >
              {t("campaign.timeline.clearFilters")}
            </Button>
          </div>
            </PopoverContent>
          </Popover>
          {(active > 0 || filters.search) && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              aria-label={t("campaign.timeline.clearFilters")}
              onClick={() => onChange({ ...EMPTY_FILTERS })}
            >
              <X className="size-3" />
            </Button>
          )}
      </div>
      <div className="w-36 shrink-0">
        <GlideSelect
          ariaLabel={t("campaign.timeline.filterFields.statuses", {
            defaultValue: "Trạng thái",
          })}
          align="start"
          value={quickStatusValue}
          onValueChange={(value) =>
            onChange({
              ...filters,
              statuses: value === "ALL" ? [] : [value],
            })
          }
          options={[
            {
              value: "ALL",
              label: t("campaign.timeline.allStatuses", {
                defaultValue: "Mọi trạng thái",
              }),
            },
            ...statuses.map((status) => ({
              value: status,
              dotClassName:
                status === "FINISHED"
                  ? "bg-emerald-500"
                  : status === "IN_PROGRESS"
                    ? "bg-brand-orange"
                    : status === "IN_REVIEW"
                      ? "bg-sky-500"
                      : status === "CANCELLED"
                        ? "bg-rose-500"
                        : "bg-amber-500",
              label: t(`tasks.status.${status}`, { defaultValue: status }),
            })),
          ]}
        />
      </div>
      <div className="flex shrink-0 -space-x-1">
        {people.slice(0, 4).map((p) => (
          <Button
            key={p.userId}
            size="icon"
            variant="ghost"
            title={p.displayName}
            aria-label={p.displayName}
            aria-pressed={filters.assignee.includes(p.userId)}
            onClick={() =>
              onChange({
                ...filters,
                assignee: filters.assignee.includes(p.userId)
                  ? filters.assignee.filter((id) => id !== p.userId)
                  : [...filters.assignee, p.userId],
              })
            }
            className={cn(
              "border-border bg-muted size-7 rounded-full border text-[9px]",
              filters.assignee.includes(p.userId) &&
                "border-brand-orange bg-brand-orange-soft text-brand-orange ring-brand-orange ring-1",
            )}
          >
            {p.displayName
              .split(/\s+/)
              .slice(-2)
              .map((n) => n[0])
              .join("")}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        variant={
          filters.completeness === "missingDetails" ? "orange" : "outline"
        }
        size="sm"
        aria-pressed={filters.completeness === "missingDetails"}
        className={cn(
          "h-8 shrink-0 gap-1.5 px-2.5 text-xs",
          filters.completeness === "missingDetails" &&
            "border-brand-orange bg-brand-orange font-semibold text-white shadow-xs hover:bg-brand-orange/90",
        )}
        onClick={() =>
          onChange({
            ...filters,
            completeness:
              filters.completeness === "missingDetails"
                ? "all"
                : "missingDetails",
          })
        }
      >
        <span>
          {t("campaign.timeline.missingDetailsQuick", {
            defaultValue: "Chưa viết mô tả",
          })}
        </span>
        {missingDetailsCount > 0 && (
          <span
            className={cn(
              "rounded px-1.5 py-0.2 text-[10px] font-semibold tabular-nums",
              filters.completeness === "missingDetails"
                ? "bg-white/20 text-white"
                : "bg-brand-orange-soft text-brand-orange",
            )}
          >
            {missingDetailsCount}
          </span>
        )}
      </Button>
      {trailingControls}
    </div>
  );
}
