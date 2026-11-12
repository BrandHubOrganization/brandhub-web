import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Filter, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TaskFilterCategorySidebar } from "./TaskFilterCategorySidebar";
import { TaskFilterPopoverOptions } from "./TaskFilterPopoverOptions";
import { useFilterCategoriesStorage } from "../../hooks/useFilterCategoriesStorage";
import type {
  CategoryItem,
  FilterCategory,
  TaskFilterPopoverProps,
} from "./types";

export type { FilterCategory, TaskFilterPopoverProps };

const DEFAULT_CATEGORIES: FilterCategory[] = [
  "parent",
  "assignee",
  "status",
  "type",
  "schedule",
];

export function TaskFilterPopover(props: TaskFilterPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("parent");
  const { addedCategories, addCategory, removeCategory } =
    useFilterCategoriesStorage(props.workspaceId);

  const parents = props.parents || [];
  const selectedParents = props.selectedParents || [];
  const onToggleParent = props.onToggleParent || (() => {});

  const hasPriority = Boolean(props.selectedPriorities && props.selectedPriorities.length > 0);
  const hasReporter = Boolean(props.selectedReporters && props.selectedReporters.length > 0);
  const hasApproval = Boolean(props.selectedApprovals && props.selectedApprovals.length > 0);

  const isVisible = (id: FilterCategory) => {
    if (DEFAULT_CATEGORIES.includes(id)) return true;
    if (addedCategories.includes(id)) return true;
    if (id === "priority" && hasPriority) return true;
    if (id === "reporter" && hasReporter) return true;
    if (id === "approval" && hasApproval) return true;
    return false;
  };

  const categories: CategoryItem[] = useMemo(() => [
    {
      id: "parent",
      label: t("tasks.timelineGrid.categoryParent", { defaultValue: "Parent" }),
      count: selectedParents.length,
    },
    {
      id: "assignee",
      label: t("tasks.timelineGrid.categoryAssignee", { defaultValue: "Assignee" }),
      count: props.selectedAssignees.length,
    },
    {
      id: "status",
      label: t("tasks.timelineGrid.categoryStatus", { defaultValue: "Status" }),
      count: props.selectedStatuses.length,
    },
    {
      id: "type",
      label: t("tasks.timelineGrid.categoryType", { defaultValue: "Work type" }),
      count: props.selectedTypes.length,
    },
    {
      id: "schedule",
      label: t("tasks.timelineGrid.categorySchedule", { defaultValue: "Schedule" }),
      count: props.selectedSchedules.filter((s) => s !== "ALL").length,
    },
    ...(isVisible("priority")
      ? [{
          id: "priority" as const,
          label: t("tasks.timelineGrid.categoryPriority", { defaultValue: "Mức độ ưu tiên" }),
          count: props.selectedPriorities?.length || 0,
          removable: true,
        }]
      : []),
    ...(isVisible("reporter")
      ? [{
          id: "reporter" as const,
          label: t("tasks.timelineGrid.categoryReporter", { defaultValue: "Người tạo" }),
          count: props.selectedReporters?.length || 0,
          removable: true,
        }]
      : []),
    ...(isVisible("approval")
      ? [{
          id: "approval" as const,
          label: t("tasks.timelineGrid.categoryApproval", { defaultValue: "Cần khách hàng duyệt" }),
          count: props.selectedApprovals?.length || 0,
          removable: true,
        }]
      : []),
  ], [
    t,
    selectedParents.length,
    props.selectedAssignees.length,
    props.selectedStatuses.length,
    props.selectedTypes.length,
    props.selectedSchedules,
    props.selectedPriorities,
    props.selectedReporters,
    props.selectedApprovals,
    addedCategories,
    hasPriority,
    hasReporter,
    hasApproval,
  ]);

  const availableExtraFields = useMemo(() => [
    {
      id: "priority" as const,
      label: t("tasks.timelineGrid.categoryPriority", { defaultValue: "Mức độ ưu tiên" }),
      icon: <AlertTriangle className="size-3.5 text-amber-500" />,
    },
    {
      id: "reporter" as const,
      label: t("tasks.timelineGrid.categoryReporter", { defaultValue: "Người tạo" }),
      icon: <User className="size-3.5 text-blue-500" />,
    },
    {
      id: "approval" as const,
      label: t("tasks.timelineGrid.categoryApproval", { defaultValue: "Cần khách hàng duyệt" }),
      icon: <ShieldCheck className="size-3.5 text-emerald-500" />,
    },
  ].filter((f) => !isVisible(f.id)), [t, addedCategories, hasPriority, hasReporter, hasApproval]);

  const handleAddField = (id: FilterCategory) => {
    addCategory(id);
    setActiveCategory(id);
  };

  const handleClearCategory = (category: FilterCategory) => {
    if (props.onClearCategory) {
      props.onClearCategory(category);
      return;
    }
    switch (category) {
      case "parent":
        selectedParents.forEach((id) => onToggleParent(id));
        break;
      case "assignee":
        props.selectedAssignees.forEach((id) => props.onToggleAssignee(id));
        break;
      case "status":
        props.selectedStatuses.forEach((st) => props.onToggleStatus(st));
        break;
      case "type":
        props.selectedTypes.forEach((tp) => props.onToggleType(tp));
        break;
      case "schedule":
        props.onToggleSchedule("ALL");
        break;
      case "priority":
        props.selectedPriorities?.forEach((pr) => props.onTogglePriority?.(pr));
        break;
      case "reporter":
        props.selectedReporters?.forEach((r) => props.onToggleReporter?.(r));
        break;
      case "approval":
        props.selectedApprovals?.forEach((ap) => props.onToggleApproval?.(ap));
        break;
    }
  };

  const handleRemoveField = (id: FilterCategory) => {
    removeCategory(id);
    handleClearCategory(id);
    if (activeCategory === id) {
      setActiveCategory("parent");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-border bg-card/90 hover:bg-muted text-foreground h-8 gap-1.5 rounded-xl px-3 text-xs font-medium shadow-2xs transition-all duration-150 active:scale-[0.97] cursor-pointer",
            props.activeFilterCount > 0
              ? "border-brand-orange/50 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/15 hover:border-brand-orange font-semibold"
              : "text-muted-foreground hover:text-foreground",
            props.className,
          )}
        >
          <Filter className="size-3.5" />
          <span>
            {props.activeFilterCount > 0
              ? t("tasks.timelineGrid.filtersWithCount", {
                  count: props.activeFilterCount,
                  defaultValue: `Filters (${props.activeFilterCount})`,
                })
              : t("tasks.timelineGrid.filters", { defaultValue: "Filter" })}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        collisionPadding={16}
        className="w-[490px] max-w-[calc(100vw-32px)] p-0 shadow-xl overflow-hidden rounded-xl border-border bg-card"
      >
        <div className="grid grid-cols-[170px_minmax(0,1fr)] divide-x divide-border min-h-[300px]">
          <TaskFilterCategorySidebar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            availableExtraFields={availableExtraFields}
            onAddField={handleAddField}
            onRemoveField={handleRemoveField}
            activeFilterCount={props.activeFilterCount}
            onClearFilters={props.onClearFilters}
          />

          <TaskFilterPopoverOptions
            activeCategory={activeCategory}
            parents={parents}
            selectedParents={selectedParents}
            onToggleParent={onToggleParent}
            assignees={props.assignees}
            selectedAssignees={props.selectedAssignees}
            onToggleAssignee={props.onToggleAssignee}
            selectedStatuses={props.selectedStatuses}
            onToggleStatus={props.onToggleStatus}
            selectedTypes={props.selectedTypes}
            onToggleType={props.onToggleType}
            selectedSchedules={props.selectedSchedules}
            onToggleSchedule={props.onToggleSchedule}
            selectedPriorities={props.selectedPriorities}
            onTogglePriority={props.onTogglePriority}
            reporters={props.reporters}
            selectedReporters={props.selectedReporters}
            onToggleReporter={props.onToggleReporter}
            selectedApprovals={props.selectedApprovals}
            onToggleApproval={props.onToggleApproval}
            onClearCategory={handleClearCategory}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}