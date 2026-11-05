import { useState, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { campaignService } from "@/pages/campaign/services/campaignService";
import {
  WorkItemSubtasksList,
  TaskDrawerSheet,
} from "@/pages/campaign/components/PlannedTaskDetails";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Target,
  Clock,
  Layers,
  ArrowRight,
  ListChecks,
  ListTree,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Campaign, Timeline } from "../types";

export function CampaignDetail({
  campaign,
  workspaceId,
  manageTasks,
}: {
  campaign: Campaign;
  workspaceId: string;
  manageTasks: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [strategyExpanded, setStrategyExpanded] = useState(false);
  const [expandedWorkItemSubtasks, setExpandedWorkItemSubtasks] = useState<
    Set<string>
  >(() => new Set());
  const [activeSheetTaskId, setActiveSheetTaskId] = useState<string | null>(
    null,
  );

  const toggleSubtasks = (workItemId: string) => {
    setExpandedWorkItemSubtasks((prev) => {
      const next = new Set(prev);
      if (next.has(workItemId)) {
        next.delete(workItemId);
      } else {
        next.add(workItemId);
      }
      return next;
    });
  };

  const timeline = JSON.parse(campaign.timeline || "{}") as Timeline;

  const plannedTasks = useQuery({
    queryKey: ["campaign-planned-tasks", workspaceId, campaign.id],
    queryFn: async () =>
      (await campaignService.tasks(workspaceId, campaign.id)).data.data,
    enabled: manageTasks && campaign.packageDriven === true,
  });

  const taskIds = new Map(
    plannedTasks.data?.map((task) => [task.campaignWorkItemId, task.id]),
  );

  const date = (value?: string) =>
    value
      ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(
          new Date(value),
        )
      : t("campaign.notSet");

  const totalDeliverableQuantity = campaign.deliverablePlan.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const totalWorkItems = campaign.workItems.length;

  const duration = (() => {
    if (!timeline.startDate || !timeline.endDate) return null;
    const start = new Date(timeline.startDate);
    const end = new Date(timeline.endDate);
    const diffMs = end.getTime() - start.getTime();
    if (isNaN(diffMs) || diffMs < 0) return null;
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.round(days / 7);
    return { days, weeks };
  })();

  const deliverableIds = new Set(campaign.deliverablePlan.map((d) => d.id));
  const unassignedWorkItems = campaign.workItems.filter(
    (w) => !w.deliverableId || !deliverableIds.has(w.deliverableId),
  );

  return (
    <article
      id="campaign-plan"
      className="border-border bg-card min-w-0 scroll-mt-6 space-y-6 rounded-2xl border p-4 shadow-xs sm:p-6"
    >
      {/* Header */}
      <header className="border-border/60 space-y-3 border-b pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant={
              campaign.status === "APPROVED" || campaign.status === "COMPLETED"
                ? "APPROVED"
                : campaign.status === "IN_PROGRESS"
                  ? "SCHEDULED"
                  : "outline"
            }
            className="font-medium"
          >
            {t(`campaign.status.${campaign.status}`)}
          </Badge>
          <span className="text-muted-foreground/80 text-xs">
            {t("campaign.version", {
              version: campaign.contentVersion,
              packageVersion: campaign.packageTermsVersion,
            })}
          </span>
        </div>
        <h3 className="text-foreground text-xl font-bold tracking-tight break-words sm:text-2xl">
          {campaign.name}
        </h3>
      </header>

      {/* Main Responsive 2-Column Canvas */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Main Work Canvas (Deliverables & Work Items Subtasks Table) */}
        <div className="space-y-5 lg:col-span-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-foreground flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Layers className="size-4" />
                </div>
                <h4 className="text-sm font-semibold tracking-tight">
                  {t("campaign.workItems")}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-2xs font-mono">
                  {campaign.deliverablePlan.length}{" "}
                  {i18n.language.startsWith("vi") ? "mục gói" : "deliverables"}
                </Badge>
                <Badge variant="secondary" className="text-2xs font-mono">
                  {totalWorkItems}{" "}
                  {i18n.language.startsWith("vi") ? "công việc" : "tasks"}
                </Badge>
              </div>
            </div>

            <div className="border-border/70 bg-card overflow-hidden rounded-xl border">
              <Table className="w-full text-xs">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                    <TableHead className="text-foreground h-9 px-3 text-xs font-semibold">
                      {t("campaign.workItemName", "Deliverable / Công việc")}
                    </TableHead>
                    <TableHead className="text-foreground h-9 w-28 px-3 text-xs font-semibold">
                      {t("tasks.filterType", "Loại")}
                    </TableHead>
                    <TableHead className="text-foreground h-9 w-40 px-3 text-xs font-semibold">
                      {t("tasks.deadline", "Hạn chót")}
                    </TableHead>
                    <TableHead className="text-foreground h-9 w-32 px-3 text-right text-xs font-semibold">
                      {t("tasks.subtasks.title", "Subtasks")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Empty state when there are neither deliverables nor work items */}
                  {campaign.deliverablePlan.length === 0 &&
                    campaign.workItems.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-muted-foreground h-24 text-center text-xs italic"
                        >
                          {t("campaign.noWorkItems")}
                        </TableCell>
                      </TableRow>
                    )}

                  {/* Render deliverables with their work items */}
                  {campaign.deliverablePlan.map((deliverable) => {
                    const itemsForDeliverable = campaign.workItems.filter(
                      (w) => w.deliverableId === deliverable.id,
                    );
                    const target = Number(deliverable.quantity) || 1;
                    const allocated = itemsForDeliverable.length;
                    const percentage = Math.min(
                      100,
                      Math.round((allocated / target) * 100),
                    );

                    return (
                      <Fragment key={deliverable.id}>
                        {/* Subtle group sub-header row */}
                        <TableRow className="bg-muted/30 hover:bg-muted/40 border-border/60 border-t text-xs font-medium">
                          <TableCell colSpan={4} className="px-3 py-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <Layers className="text-brand-orange size-3.5 shrink-0" />
                                <span className="text-foreground truncate font-semibold">
                                  {deliverable.name}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-2xs py-0 font-normal"
                                >
                                  {deliverable.quantity} {deliverable.unit}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-2xs ml-auto flex items-center gap-2">
                                <span className="font-mono tabular-nums">
                                  {allocated} / {deliverable.quantity} (
                                  {percentage}%)
                                </span>
                                <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full sm:w-20">
                                  <div
                                    className="bg-brand-orange h-full rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Child rows for work items belonging to this deliverable */}
                        {itemsForDeliverable.length === 0 ? (
                          <TableRow className="hover:bg-transparent">
                            <TableCell
                              colSpan={4}
                              className="text-muted-foreground/70 text-2xs px-3 py-2 pl-8 italic"
                            >
                              {t("campaign.noWorkItems", "Chưa có work item")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          itemsForDeliverable.map((item) => (
                            <Fragment key={item.id}>
                              <TableRow
                                className={cn(
                                  "h-9 transition-colors",
                                  taskIds.has(item.id)
                                    ? "cursor-pointer hover:bg-muted/50"
                                    : "hover:bg-muted/30",
                                  expandedWorkItemSubtasks.has(item.id) &&
                                    "bg-muted/20",
                                )}
                                onClick={() => {
                                  if (taskIds.has(item.id)) {
                                    setActiveSheetTaskId(taskIds.get(item.id)!);
                                  }
                                }}
                              >
                                <TableCell className="max-w-[200px] px-3 py-2 pl-7 text-xs align-middle sm:max-w-xs">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <span className="text-muted-foreground/40 text-2xs font-mono select-none">
                                      ↳
                                    </span>
                                    <span
                                      className="text-foreground truncate font-medium group-hover:text-brand-orange"
                                      title={item.name}
                                    >
                                      {item.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2 text-xs align-middle whitespace-nowrap">
                                  <Badge
                                    variant="outline"
                                    className="text-2xs py-0 font-normal"
                                  >
                                    {t(`campaign.types.${item.type}`)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-3 py-2 font-mono text-xs align-middle whitespace-nowrap">
                                  <span className="text-muted-foreground text-2xs inline-flex items-center gap-1 tabular-nums">
                                    <Clock className="text-muted-foreground/60 size-3" />
                                    {item.dueDate
                                      ? new Intl.DateTimeFormat(i18n.language, {
                                          dateStyle: "short",
                                          timeStyle: "short",
                                        }).format(new Date(item.dueDate))
                                      : t("campaign.notSet")}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2 text-right text-xs align-middle whitespace-normal">
                                  {taskIds.has(item.id) ? (
                                    <div className="inline-flex items-center justify-end gap-1.5 text-right">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-brand-orange hover:bg-brand-orange/10 h-7 gap-1 px-2 text-xs font-medium cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSubtasks(item.id);
                                        }}
                                      >
                                        <ListTree className="size-3.5" />
                                        <span>
                                          {t("tasks.subtasks.title", "Subtasks")}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "size-3 transition-transform duration-200",
                                            expandedWorkItemSubtasks.has(
                                              item.id,
                                            ) && "rotate-180",
                                          )}
                                        />
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/40 text-2xs italic">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                              {taskIds.has(item.id) &&
                                expandedWorkItemSubtasks.has(item.id) && (
                                  <TableRow className="bg-muted/10 border-b hover:bg-muted/10">
                                    <TableCell colSpan={4} className="p-3 pl-8">
                                      <WorkItemSubtasksList
                                        workspaceId={workspaceId}
                                        taskId={taskIds.get(item.id)!}
                                        onOpenTaskDetails={(id: string) =>
                                          setActiveSheetTaskId(id)
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                )}
                            </Fragment>
                          ))
                        )}
                      </Fragment>
                    );
                  })}

                  {/* Unassigned Work Items Section */}
                  {unassignedWorkItems.length > 0 && (
                    <Fragment>
                      <TableRow className="bg-muted/30 border-border/60 border-t text-xs font-medium">
                        <TableCell colSpan={4} className="px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-mono">
                                #
                              </span>
                              <span className="text-foreground font-semibold">
                                {t(
                                  "campaign.closure.supplemental",
                                  "Unassigned / Công việc khác",
                                )}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-2xs py-0 font-normal"
                            >
                              {unassignedWorkItems.length}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                      {unassignedWorkItems.map((item) => (
                        <Fragment key={item.id}>
                          <TableRow
                            className={cn(
                              "h-9 transition-colors",
                              taskIds.has(item.id)
                                ? "cursor-pointer hover:bg-muted/50"
                                : "hover:bg-muted/30",
                              expandedWorkItemSubtasks.has(item.id) &&
                                "bg-muted/20",
                            )}
                            onClick={() => {
                              if (taskIds.has(item.id)) {
                                setActiveSheetTaskId(taskIds.get(item.id)!);
                              }
                            }}
                          >
                            <TableCell className="max-w-[200px] px-3 py-2 pl-7 text-xs align-middle sm:max-w-xs">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span className="text-muted-foreground/40 text-2xs font-mono select-none">
                                  ↳
                                </span>
                                <span
                                  className="text-foreground truncate font-medium group-hover:text-brand-orange"
                                  title={item.name}
                                >
                                  {item.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs align-middle whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className="text-2xs py-0 font-normal"
                              >
                                {t(`campaign.types.${item.type}`)}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-3 py-2 font-mono text-xs align-middle whitespace-nowrap">
                              <span className="text-muted-foreground text-2xs inline-flex items-center gap-1 tabular-nums">
                                <Clock className="text-muted-foreground/60 size-3" />
                                {item.dueDate
                                  ? new Intl.DateTimeFormat(i18n.language, {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    }).format(new Date(item.dueDate))
                                  : t("campaign.notSet")}
                              </span>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-right text-xs align-middle whitespace-normal">
                              {taskIds.has(item.id) ? (
                                <div className="inline-flex items-center justify-end gap-1.5 text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-brand-orange hover:bg-brand-orange/10 h-7 gap-1 px-2 text-xs font-medium cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubtasks(item.id);
                                    }}
                                  >
                                    <ListTree className="size-3.5" />
                                    <span>
                                      {t("tasks.subtasks.title", "Subtasks")}
                                    </span>
                                    <ChevronDown
                                      className={cn(
                                        "size-3 transition-transform duration-200",
                                        expandedWorkItemSubtasks.has(
                                          item.id,
                                        ) && "rotate-180",
                                      )}
                                    />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/40 text-2xs italic">
                                  -
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          {taskIds.has(item.id) &&
                            expandedWorkItemSubtasks.has(item.id) && (
                              <TableRow className="bg-muted/10 border-b hover:bg-muted/10">
                                <TableCell colSpan={4} className="p-3 pl-8">
                                  <WorkItemSubtasksList
                                    workspaceId={workspaceId}
                                    taskId={taskIds.get(item.id)!}
                                    onOpenTaskDetails={(id: string) =>
                                      setActiveSheetTaskId(id)
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                        </Fragment>
                      ))}
                    </Fragment>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Properties Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:col-span-4">
          {/* a) Campaign Strategy Card */}
          <div className="bg-muted/15 border-border/70 space-y-2.5 rounded-xl border p-4">
            <div className="text-foreground flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-brand-orange-soft text-brand-orange flex size-7 items-center justify-center rounded-lg">
                  <Target className="size-4" />
                </div>
                <h4 className="text-sm font-semibold tracking-tight">
                  {t("campaign.strategy")}
                </h4>
              </div>
              {campaign.strategyDetail &&
                campaign.strategyDetail.length > 140 && (
                  <button
                    type="button"
                    onClick={() => setStrategyExpanded(!strategyExpanded)}
                    className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-xs font-medium transition-colors shrink-0"
                  >
                    {strategyExpanded
                      ? i18n.language.startsWith("vi")
                        ? "Thu gọn"
                        : "Show less"
                      : i18n.language.startsWith("vi")
                        ? "Xem thêm"
                        : "Show more"}
                  </button>
                )}
            </div>
            <p
              className={cn(
                "text-muted-foreground text-xs leading-relaxed break-words whitespace-pre-wrap transition-all",
                !strategyExpanded && "line-clamp-4",
              )}
            >
              {campaign.strategyDetail || t("campaign.notSet")}
            </p>
          </div>

          {/* b) Dates & Duration Card */}
          <div className="bg-muted/15 border-border/70 space-y-3 rounded-xl border p-4">
            <div className="text-foreground flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Clock className="size-4" />
              </div>
              <h4 className="text-sm font-semibold tracking-tight">
                {i18n.language.startsWith("vi")
                  ? "Thời gian chiến dịch"
                  : "Timeline & Duration"}
              </h4>
            </div>

            {/* Banner: Start Date -> End Date */}
            <div className="bg-card border-border/80 flex items-center justify-between gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs">
              <div className="min-w-0">
                <span className="text-muted-foreground text-2xs block font-semibold tracking-wider uppercase">
                  {t("campaign.startDate")}
                </span>
                <span className="text-foreground mt-0.5 block truncate font-mono font-medium tabular-nums">
                  {date(timeline.startDate)}
                </span>
              </div>
              <ArrowRight className="text-muted-foreground size-3.5 shrink-0" />
              <div className="min-w-0 text-right">
                <span className="text-muted-foreground text-2xs block font-semibold tracking-wider uppercase">
                  {t("campaign.endDate")}
                </span>
                <span className="text-foreground mt-0.5 block truncate font-mono font-medium tabular-nums">
                  {date(timeline.endDate)}
                </span>
              </div>
            </div>

            {/* Total duration */}
            {duration && (
              <div className="border-border/60 flex items-center justify-between border-t pt-2.5 text-xs">
                <span className="text-muted-foreground">
                  {i18n.language.startsWith("vi")
                    ? "Tổng thời lượng"
                    : "Total duration"}
                </span>
                <span className="text-foreground font-mono font-semibold tabular-nums">
                  {duration.weeks > 0
                    ? `${duration.weeks} ${i18n.language.startsWith("vi") ? "tuần" : "weeks"}${duration.days % 7 !== 0 ? ` (${duration.days} ${i18n.language.startsWith("vi") ? "ngày" : "days"})` : ""}`
                    : `${duration.days} ${i18n.language.startsWith("vi") ? "ngày" : "days"}`}
                </span>
              </div>
            )}
          </div>

          {/* c) Milestones Stepper Card */}
          <div className="bg-muted/15 border-border/70 space-y-3 rounded-xl border p-4">
            <div className="text-foreground flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Calendar className="size-4" />
              </div>
              <h4 className="text-sm font-semibold tracking-tight">
                {t("campaign.milestones")}
              </h4>
            </div>

            {/* Vertical compact milestone timeline list */}
            <div className="pt-1">
              {!timeline.milestones?.length ? (
                <p className="text-muted-foreground pl-1 text-xs italic">
                  {t("campaign.notSet")}
                </p>
              ) : (
                <ol className="border-border relative ml-2 space-y-3 border-l pl-3.5">
                  {timeline.milestones.map((milestone, index) => (
                    <li key={index} className="group relative">
                      <span
                        className="bg-brand-orange ring-background absolute top-1.5 -left-[18px] size-2 rounded-full ring-2"
                        aria-hidden="true"
                      />
                      <time className="text-muted-foreground/80 text-2xs block font-mono font-medium tabular-nums">
                        {date(milestone.date)}
                      </time>
                      <p className="text-foreground mt-0.5 text-xs font-medium break-words">
                        {milestone.name}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* d) Deliverables Summary Badge / Progress bar */}
          <div className="bg-muted/15 border-border/70 space-y-3 rounded-xl border p-4">
            <div className="text-foreground flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ListChecks className="size-4" />
                </div>
                <h4 className="text-sm font-semibold tracking-tight">
                  {t("campaign.totalDeliverables")}
                </h4>
              </div>
            </div>

            {/* Key-Value rows */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("campaign.totalDeliverables")}
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-semibold tabular-nums"
                >
                  {totalDeliverableQuantity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("campaign.workItems")}
                </span>
                <Badge
                  variant="secondary"
                  className="font-mono text-xs font-semibold tabular-nums"
                >
                  {totalWorkItems}
                </Badge>
              </div>

              {/* Progress bar */}
              {totalDeliverableQuantity > 0 && (
                <div className="border-border/60 space-y-1.5 border-t pt-2.5">
                  <div className="text-2xs text-muted-foreground flex justify-between">
                    <span>
                      {i18n.language.startsWith("vi")
                        ? "Tiến độ phân bổ"
                        : "Allocation Progress"}
                    </span>
                    <span className="font-mono tabular-nums">
                      {totalWorkItems} / {totalDeliverableQuantity} (
                      {Math.min(
                        100,
                        Math.round(
                          (totalWorkItems / totalDeliverableQuantity) * 100,
                        ),
                      )}
                      %)
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-brand-orange h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (totalWorkItems / totalDeliverableQuantity) * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskDrawerSheet
        open={!!activeSheetTaskId}
        taskId={activeSheetTaskId}
        workspaceId={workspaceId}
        onOpenChange={(open) => !open && setActiveSheetTaskId(null)}
      />
    </article>
  );
}
