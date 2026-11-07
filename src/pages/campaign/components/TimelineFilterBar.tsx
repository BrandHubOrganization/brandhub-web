import { useState, type ReactNode } from "react";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
] as const;
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
  const active =
    FIELDS.filter((f) =>
      f === "schedule" ? filters.schedule !== "all" : filters[f].length > 0,
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
  return (
    <div className="border-border bg-card flex flex-wrap items-center gap-2 border-b p-2.5">
      <div className="relative min-w-36 flex-1 sm:max-w-72">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder={t("campaign.timeline.search")}
          aria-label={t("campaign.timeline.search")}
          className="h-8 pl-8 text-xs"
        />
      </div>
      <div className="flex -space-x-1">
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-xs"
            aria-label={t("campaign.timeline.mine")}
          >
            {t(`campaign.timeline.mineOptions.${filters.mine}`)}
            <ChevronDown className="text-muted-foreground size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          <DropdownMenuRadioGroup
            value={filters.mine}
            onValueChange={(value) =>
              onChange({ ...filters, mine: value as TimelineFilters["mine"] })
            }
          >
            {(["all", "related", "assignee", "supervisor"] as const).map(
              (value) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  className="data-[state=checked]:bg-brand-orange-soft data-[state=checked]:text-brand-orange cursor-pointer pl-2 text-xs [&>span]:hidden"
                >
                  {t(`campaign.timeline.mineOptions.${value}`)}
                </DropdownMenuRadioItem>
              ),
            )}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Filter className="size-3.5" />
            {t("campaign.timeline.filters")}
            {active > 0 && (
              <span className="bg-brand-orange-soft text-brand-orange rounded px-1">
                {active}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
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
                  title={t(`campaign.timeline.filterFields.${f}`)}
                  onClick={() => setField(f)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {t(`campaign.timeline.filterFields.${f}`)}
                  </span>
                </Button>
              ))}
            </div>
            <div className="max-h-80 min-w-0 overflow-y-auto p-3">
              <h3 className="mb-3 text-xs font-semibold">
                {t(`campaign.timeline.filterFields.${field}`)}
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
                  ].map((person) => (
                    <label
                      key={person.userId}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs",
                        filters[field].includes(person.userId) &&
                          "bg-brand-orange-soft text-brand-orange",
                      )}
                    >
                      <Input
                        type="checkbox"
                        wrapperClassName="w-auto shrink-0"
                        className="accent-brand-orange size-4 shrink-0 p-0"
                        checked={filters[field].includes(person.userId)}
                        onChange={() => multiple(person.userId)}
                      />
                      <span className="min-w-0 flex-1 break-words">
                        {person.displayName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {(field === "statuses" || field === "types") && (
                <div className="space-y-3">
                  {(field === "statuses" ? statuses : types).map((v) => (
                    <label key={v} className="flex items-center gap-2 text-xs">
                      <Input
                        type="checkbox"
                        wrapperClassName="w-auto shrink-0"
                        className="accent-brand-orange size-4 shrink-0 p-0"
                        checked={(field === "statuses"
                          ? filters.statuses
                          : filters.types
                        ).includes(v)}
                        onChange={() => multiple(v)}
                      />
                      <span className="min-w-0 flex-1 break-words">
                        {t(
                          field === "statuses"
                            ? `tasks.status.${v}`
                            : `tasks.types.${v}`,
                          { defaultValue: v },
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {field === "deliverable" && (
                <div className="space-y-1">
                  {deliverables.map((item) => (
                    <label
                      key={item.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs",
                        filters.deliverable.includes(item.id) &&
                          "bg-brand-orange-soft text-brand-orange",
                      )}
                    >
                      <Input
                        type="checkbox"
                        wrapperClassName="w-auto shrink-0"
                        className="accent-brand-orange size-4 shrink-0 p-0"
                        checked={filters.deliverable.includes(item.id)}
                        onChange={() => multiple(item.id)}
                      />
                      <span className="min-w-0 flex-1 break-words">
                        {item.name}
                      </span>
                    </label>
                  ))}
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
      {(active > 0 || filters.search || filters.mine !== "all") && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("campaign.timeline.clearFilters")}
          onClick={() => onChange({ ...EMPTY_FILTERS })}
        >
          <X className="size-3.5" />
        </Button>
      )}
      {trailingControls}
    </div>
  );
}
