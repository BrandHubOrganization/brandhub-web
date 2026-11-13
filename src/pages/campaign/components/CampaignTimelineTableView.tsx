import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Maximize2,
  PanelRightOpen,
  Pencil,
  Plus,
  WrapText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RichTextContent,
  RichTextInput,
  stripRichTextHtml,
} from "@/components/ui/rich-text-input";
import { TimelineAssigneePicker } from "@/pages/campaign/components/TimelineAssigneePicker";
import { TimelineSubtaskCreator } from "@/pages/campaign/components/TimelineSubtaskCreator";
import { TimelineTableColumnMenu } from "@/pages/campaign/components/TimelineTableColumnMenu";
import {
  addDays,
  dayInstant,
  localDay,
} from "@/pages/campaign/utils/timelineDates";
import {
  TABLE_COLUMN_DEFS,
  clampColumnWidth,
  defaultTableColumnsState,
  fitColumnsToWidth,
  loadTableColumnsState,
  moveColumnBy,
  reorderColumns,
  saveTableColumnsState,
  type TableColumnId,
  type TableColumnsState,
} from "@/pages/campaign/utils/tableColumns";
import type {
  TimelineEdit,
  TimelineTask,
  TimelineView,
} from "@/pages/campaign/types/campaignTimeline";
import type { TimelineNode } from "@/pages/campaign/utils/timelineNodes";
import { isTimelineItemMissingDetails } from "@/pages/campaign/utils/timelineFilters";
import { SpringCheck, SquishSwitch } from "@/components/micro";
import { JiraStatusLozenge } from "@/pages/tasks/components/JiraSubtaskUI";
import {
  isSubtaskDone,
  isSubtaskOverdue,
} from "@/pages/tasks/utils/jiraSubtaskUtils";
import type { TaskType } from "@/types/task";
import { cn } from "@/lib/utils";

function TableDateCell({
  value,
  disabled,
  ariaLabel,
  onCommit,
}: {
  value: string;
  disabled: boolean;
  ariaLabel: string;
  onCommit: (nextDay: string) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function isCompleteDay(day: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
    const year = Number(day.slice(0, 4));
    return year >= 1900 && year <= 2100;
  }

  function flush(candidate: string) {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (!isCompleteDay(candidate) || candidate === value) {
      setDraft(value);
      return;
    }
    void onCommit(candidate).catch(() => setDraft(value));
  }

  return (
    <Input
      type="date"
      value={draft}
      disabled={disabled}
      aria-label={ariaLabel}
      className="h-7 w-full min-w-0 px-1.5 text-xs tabular-nums"
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        if (timer.current !== null) window.clearTimeout(timer.current);
        if (isCompleteDay(next) && next !== value) {
          timer.current = window.setTimeout(() => flush(next), 500);
        }
      }}
      onBlur={() => {
        focused.current = false;
        flush(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
          if (timer.current !== null) {
            window.clearTimeout(timer.current);
            timer.current = null;
          }
          setDraft(value);
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
    />
  );
}

function RichTextTableCell({
  itemName,
  fieldId,
  label,
  value,
  emptyLabel,
  editable,
  wrapText,
  busy,
  onSave,
}: {
  itemName: string;
  fieldId: string;
  label: string;
  value: string;
  emptyLabel: string;
  editable: boolean;
  wrapText: boolean;
  busy: boolean;
  onSave: (html: string) => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const plain = stripRichTextHtml(value);
  const isEmpty = !plain;

  async function save() {
    if (!editable || saving) return;
    setSaving(true);
    try {
      await onSave(draft);
      setOpen(false);
    } catch {
      /* Error toast handled by timeline mutation. */
    } finally {
      setSaving(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(value);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={!editable && isEmpty}
          className={cn(
            "group flex w-full min-w-0 items-start justify-between gap-1.5 rounded-md border border-transparent px-2 py-1 text-left text-xs transition-colors",
            editable
              ? "hover:border-border hover:bg-muted/50 cursor-pointer"
              : !isEmpty
                ? "hover:border-border hover:bg-muted/30 cursor-pointer"
                : "cursor-default opacity-60",
            editable && isEmpty && "hover:border-brand-orange/40 hover:border-dashed",
          )}
          title={plain || emptyLabel}
        >
          {wrapText && !isEmpty ? (
            <div className="min-w-0 flex-1 text-xs break-words">
              <RichTextContent value={value} />
            </div>
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 break-words",
                !wrapText && "line-clamp-2",
                isEmpty
                  ? "text-amber-700/90 italic dark:text-amber-300/90"
                  : "text-foreground",
              )}
            >
              {plain || emptyLabel}
            </span>
          )}
          {editable && (
            <Pencil
              className={cn(
                "text-muted-foreground mt-0.5 size-3 shrink-0 transition-opacity",
                isEmpty
                  ? "opacity-60 group-hover:opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={12}
        className="z-50 w-[min(500px,calc(100vw-24px))] space-y-2.5 p-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-medium uppercase">
              {label}
            </p>
            <p className="truncate text-xs font-semibold">{itemName}</p>
          </div>
        </div>
        {editable ? (
          <>
            <RichTextInput
              id={fieldId}
              value={draft}
              disabled={busy || saving}
              placeholder={emptyLabel}
              editorClassName="min-h-[120px] max-h-[260px] overflow-y-auto"
              onChange={setDraft}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                {t("common.cancel", { defaultValue: "Hủy" })}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="orange"
                className="h-7 gap-1 text-xs"
                disabled={busy || saving}
                onClick={() => void save()}
              >
                <Check className="size-3.5" />
                {t("common.save", { defaultValue: "Lưu" })}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-muted/30 max-h-[280px] overflow-y-auto rounded-md border p-2.5 text-xs">
            <RichTextContent value={value} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function CampaignTimelineTableView({
  nodes,
  data,
  today,
  busy,
  filtered,
  expanded,
  collapsed,
  selectableSubtasks = false,
  excludedSet,
  onToggleGroup,
  onToggleTask,
  onStartCreating,
  onCancelCreating,
  onToggleSubtask,
  onOpenTask,
  canCreateTask = false,
  onOpenCreateTask,
  edit,
}: {
  nodes: TimelineNode[];
  data: TimelineView;
  today: string;
  busy: boolean;
  filtered: boolean;
  expanded: Record<string, boolean>;
  collapsed: Record<string, boolean>;
  selectableSubtasks?: boolean;
  excludedSet: Set<string>;
  onToggleGroup: (id: string) => void;
  onToggleTask: (id: string) => void;
  onStartCreating: (taskId: string) => void;
  onCancelCreating: () => void;
  onToggleSubtask?: (subtaskId: string, included: boolean) => void;
  onOpenTask: (taskId: string, subtaskId?: string) => void;
  canCreateTask?: boolean;
  onOpenCreateTask?: () => void;
  edit: (value: TimelineEdit) => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [columnsState, setColumnsState] = useState<TableColumnsState>(() =>
    loadTableColumnsState(),
  );
  const [wrapText, setWrapText] = useState(false);
  const [resizingId, setResizingId] = useState<TableColumnId | null>(null);
  const [dragColId, setDragColId] = useState<TableColumnId | null>(null);
  const [dropTargetId, setDropTargetId] = useState<TableColumnId | null>(null);

  useEffect(() => {
    saveTableColumnsState(columnsState);
  }, [columnsState]);

  const columnLabels = useMemo<Record<TableColumnId, string>>(
    () => ({
      name: t("campaign.timeline.columns.name", { defaultValue: "Công việc" }),
      status: t("campaign.timeline.columns.status", {
        defaultValue: "Trạng thái",
      }),
      assignee: t("campaign.timeline.columns.assignee", {
        defaultValue: "Người thực hiện",
      }),
      startDate: t("campaign.timeline.startDate", {
        defaultValue: "Ngày bắt đầu",
      }),
      dueDate: t("campaign.timeline.dueDate", {
        defaultValue: "Hạn hoàn thành",
      }),
      description: t("tasks.fields.description", {
        defaultValue: "Yêu cầu chi tiết",
      }),
      acceptanceCriteria: t("tasks.fields.acceptanceCriteria", {
        defaultValue: "Tiêu chí nghiệm thu",
      }),
      actions: t("common.details", { defaultValue: "Chi tiết" }),
    }),
    [t],
  );

  const visibleColumns = useMemo(
    () =>
      columnsState.order.filter((id) => !columnsState.hidden.includes(id)),
    [columnsState.order, columnsState.hidden],
  );

  const totalWidth = useMemo(
    () =>
      visibleColumns.reduce(
        (sum, id) => sum + columnsState.widths[id],
        0,
      ),
    [visibleColumns, columnsState.widths],
  );

  const stickyNameFirst = visibleColumns[0] === "name";

  function startResize(
    colId: TableColumnId,
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = columnsState.widths[colId];
    setResizingId(colId);

    const onMove = (moveEvent: PointerEvent) => {
      const nextWidth = clampColumnWidth(
        colId,
        startWidth + (moveEvent.clientX - startX),
      );
      setColumnsState((prev) => ({
        ...prev,
        widths: { ...prev.widths, [colId]: nextWidth },
      }));
    };

    const onUp = () => {
      setResizingId(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleFitColumns() {
    const width = scrollRef.current?.clientWidth ?? 0;
    if (!width) return;
    setColumnsState((prev) => ({
      ...prev,
      widths: fitColumnsToWidth(visibleColumns, prev.widths, width),
    }));
  }

  function commitSchedule(
    task: TimelineTask,
    subtaskId: string | undefined,
    currentStartIso: string | null,
    currentEndIso: string | null,
    patch: { start?: string; end?: string },
  ) {
    const curStart = localDay(currentStartIso, data.timezone) || today;
    const curEnd =
      localDay(currentEndIso, data.timezone) || addDays(curStart, 2);

    let nextStart = patch.start ?? curStart;
    let nextEnd = patch.end ?? curEnd;

    if (patch.start && nextEnd <= nextStart) {
      nextEnd = addDays(nextStart, 2);
    } else if (patch.end && nextEnd <= nextStart) {
      nextStart = addDays(nextEnd, -1);
    }

    return edit({
      kind: "schedule",
      taskId: task.id,
      ...(subtaskId ? { subtaskId } : {}),
      start: dayInstant(nextStart, data.timezone),
      end: dayInstant(nextEnd, data.timezone),
    });
  }

  function renderCell(
    colId: TableColumnId,
    node: Extract<TimelineNode, { kind: "task" | "sub" }>,
  ): ReactNode {
    const isTask = node.kind === "task";
    const task = isTask ? node.row : node.parent;
    const item = node.row;
    const startDay = localDay(item.plannedStartDate, data.timezone);
    const endDay = localDay(item.dueDate, data.timezone);
    const canSchedule = isTask ? task.canSchedule : task.canManageSubtasks;
    const canAssign = isTask ? task.canAssign : task.canManageSubtasks;
    const canEditText = isTask ? task.canSchedule : task.canManageSubtasks;

    switch (colId) {
      case "name":
        return (
          <div
            className={cn(
              "flex min-w-0 items-center gap-1.5",
              !isTask && "pl-4",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              aria-label={t("campaign.timeline.expandSubtasks", {
                name: item.name,
              })}
              onClick={() =>
                isTask ? onToggleTask(task.id) : onOpenTask(task.id)
              }
            >
              {isTask ? (
                !!expanded[task.id] || filtered ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )
              ) : (
                <span className="text-muted-foreground">↳</span>
              )}
            </Button>
            {!isTask && selectableSubtasks && onToggleSubtask && (
              <SpringCheck
                checked={!excludedSet.has(item.id)}
                disabled={busy}
                ariaLabel={t("campaign.timeline.toggleSubtaskDeploy", {
                  name: item.name,
                  defaultValue: `Triển khai công việc con ${item.name}`,
                })}
                onCheckedChange={(checked) =>
                  onToggleSubtask(item.id, checked)
                }
              />
            )}
            <button
              type="button"
              onClick={() => onOpenTask(task.id, !isTask ? item.id : undefined)}
              title={item.name}
              className={cn(
                "hover:text-brand-orange min-w-0 flex-1 truncate text-left font-medium transition-colors",
                isTask && node.contextOnly && "text-muted-foreground",
                item.status === "FINISHED" && "line-through",
                !isTask &&
                  selectableSubtasks &&
                  excludedSet.has(item.id) &&
                  "text-muted-foreground line-through opacity-60",
              )}
            >
              {item.name}
            </button>
            {isTask && task.subtasks.length > 0 && (
              <span className="text-muted-foreground shrink-0 text-[10px]">
                {selectableSubtasks
                  ? task.subtasks.filter((s) => !excludedSet.has(s.id)).length
                  : task.subtasks.filter((s) => s.status === "FINISHED").length}
                /{task.subtasks.length}
              </span>
            )}
            {isTask && task.outOfScope && (
              <span
                className="border-brand-orange/45 bg-brand-orange/15 text-brand-orange inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold"
                title={t("campaign.timeline.outOfScopeBadge", {
                  defaultValue: "Ngoài phạm vi",
                })}
              >
                {t("campaign.timeline.outOfScopeBadge", {
                  defaultValue: "Ngoài phạm vi",
                })}
              </span>
            )}
            {isTimelineItemMissingDetails(item) && (
              <span className="inline-flex shrink-0 items-center rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-300">
                {t("campaign.timeline.missingDetailsBadge", {
                  defaultValue: "Thiếu mô tả",
                })}
              </span>
            )}
            {isTask && task.awaitingClient && (
              <span className="inline-flex shrink-0 items-center rounded border border-amber-500/25 bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                {t("campaign.timeline.awaitingClient")}
              </span>
            )}
            {!isTask &&
              isSubtaskOverdue(item.dueDate, isSubtaskDone(item.status)) && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-rose-500/25 bg-rose-500/10 px-1 py-0.5 text-[9px] font-semibold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="size-2.5" />
                  {t("campaign.timeline.overdue")}
                </span>
              )}
          </div>
        );

      case "status":
        return (
          <JiraStatusLozenge
            status={item.status}
            label={t(`tasks.status.${item.status}`, {
              defaultValue: item.status,
            })}
            className="max-w-full truncate text-[10px] whitespace-nowrap"
          />
        );

      case "assignee":
        return (
          <TimelineAssigneePicker
            value={item.assigneeId}
            name={item.assigneeId ? data.names[item.assigneeId] : undefined}
            options={data.members}
            allowEmpty={!isTask}
            labelled
            disabled={busy || !canAssign}
            onChange={(id) =>
              edit({
                kind: "assignee",
                taskId: task.id,
                assigneeId: id,
                ...(!isTask ? { subtaskId: item.id } : {}),
              })
            }
          />
        );

      case "startDate":
        return (
          <TableDateCell
            value={startDay}
            disabled={busy || !canSchedule}
            ariaLabel={`${item.name} - ${t("campaign.timeline.startDate", { defaultValue: "Ngày bắt đầu" })}`}
            onCommit={(nextStart) =>
              commitSchedule(
                task,
                isTask ? undefined : item.id,
                item.plannedStartDate,
                item.dueDate,
                { start: nextStart },
              )
            }
          />
        );

      case "dueDate":
        return (
          <TableDateCell
            value={endDay}
            disabled={busy || !canSchedule}
            ariaLabel={`${item.name} - ${t("campaign.timeline.dueDate", { defaultValue: "Hạn hoàn thành" })}`}
            onCommit={(nextEnd) =>
              commitSchedule(
                task,
                isTask ? undefined : item.id,
                item.plannedStartDate,
                item.dueDate,
                { end: nextEnd },
              )
            }
          />
        );

      case "description":
        return (
          <RichTextTableCell
            itemName={item.name}
            fieldId={`table-${isTask ? task.id : item.id}-description`}
            label={columnLabels.description}
            value={item.description ?? ""}
            emptyLabel={t("campaign.timeline.tableEmptyDescription", {
              defaultValue: "Chưa có mô tả — Nhấn để viết",
            })}
            editable={canEditText}
            wrapText={wrapText}
            busy={busy}
            onSave={(html) =>
              edit({
                kind: "field",
                taskId: task.id,
                ...(!isTask ? { subtaskId: item.id } : {}),
                field: "description",
                value: html,
              })
            }
          />
        );

      case "acceptanceCriteria":
        return (
          <RichTextTableCell
            itemName={item.name}
            fieldId={`table-${isTask ? task.id : item.id}-acceptanceCriteria`}
            label={columnLabels.acceptanceCriteria}
            value={item.acceptanceCriteria ?? ""}
            emptyLabel={t("campaign.timeline.tableEmptyAcceptance", {
              defaultValue: "Chưa có tiêu chí — Nhấn để viết",
            })}
            editable={canEditText}
            wrapText={wrapText}
            busy={busy}
            onSave={(html) =>
              edit({
                kind: "field",
                taskId: task.id,
                ...(!isTask ? { subtaskId: item.id } : {}),
                field: "acceptanceCriteria",
                value: html,
              })
            }
          />
        );

      case "actions":
        return (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7"
            aria-label={t("campaign.timeline.openTaskDetail", {
              defaultValue: "Mở chi tiết công việc",
            })}
            title={t("campaign.timeline.openTaskDetail", {
              defaultValue: "Mở chi tiết công việc",
            })}
            onClick={() => onOpenTask(task.id, !isTask ? item.id : undefined)}
          >
            <PanelRightOpen className="size-3.5" />
          </Button>
        );
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-brand-orange/25 bg-brand-orange-soft/35 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-1.5">
        <span className="text-muted-foreground text-[11px]">
          {t("campaign.timeline.tableCustomizeHint", {
            defaultValue:
              "Kéo cạnh phải cột để chỉnh kích thước · Kéo tiêu đề cột để sắp xếp thứ tự",
          })}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <div className="border-border bg-background inline-flex h-7 items-center gap-1.5 rounded-md border px-2">
            <WrapText className="text-muted-foreground size-3.5 shrink-0" />
            <SquishSwitch
              checked={wrapText}
              onCheckedChange={setWrapText}
              ariaLabel={t("campaign.timeline.tableExpandText", {
                defaultValue: "Xem đầy đủ",
              })}
              label={t("campaign.timeline.tableExpandText", {
                defaultValue: "Xem đầy đủ",
              })}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={handleFitColumns}
          >
            <Maximize2 className="size-3.5" />
            <span>
              {t("campaign.timeline.tableFitScreen", {
                defaultValue: "Vừa màn hình",
              })}
            </span>
          </Button>
          <TimelineTableColumnMenu
            state={columnsState}
            columnLabels={columnLabels}
            onMove={(id, delta) =>
              setColumnsState((prev) => ({
                ...prev,
                order: moveColumnBy(prev.order, id, delta),
              }))
            }
            onToggleHidden={(id) =>
              setColumnsState((prev) => {
                if (TABLE_COLUMN_DEFS[id].required) return prev;
                const isHidden = prev.hidden.includes(id);
                return {
                  ...prev,
                  hidden: isHidden
                    ? prev.hidden.filter((item) => item !== id)
                    : [...prev.hidden, id],
                };
              })
            }
            onFit={handleFitColumns}
            onReset={() => setColumnsState(defaultTableColumnsState())}
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[620px] min-h-[260px] w-full min-w-0 flex-1 overflow-auto"
      >
        <table
          style={{ width: totalWidth, minWidth: "100%", tableLayout: "fixed" }}
          className="border-collapse text-left text-xs"
        >
          <colgroup>
            {visibleColumns.map((colId) => (
              <col key={colId} style={{ width: columnsState.widths[colId] }} />
            ))}
          </colgroup>
          <thead className="bg-brand-orange-soft/75 dark:bg-brand-orange/15 border-brand-orange/40 sticky top-0 z-10 border-b-2 backdrop-blur-sm">
            <tr className="text-foreground h-9 font-bold">
              {visibleColumns.map((colId, index) => {
                const isStickyName = stickyNameFirst && colId === "name";
                const isStatusCol = colId === "status";
                const isDropTarget =
                  dropTargetId === colId && dragColId && dragColId !== colId;
                return (
                  <th
                    key={colId}
                    draggable={!resizingId}
                    onDragStart={(e) => {
                      if (resizingId) {
                        e.preventDefault();
                        return;
                      }
                      setDragColId(colId);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", colId);
                    }}
                    onDragOver={(e) => {
                      if (!dragColId || dragColId === colId) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDropTargetId(colId);
                    }}
                    onDragLeave={() => {
                      if (dropTargetId === colId) setDropTargetId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragColId && dragColId !== colId) {
                        setColumnsState((prev) => ({
                          ...prev,
                          order: reorderColumns(prev.order, dragColId, colId),
                        }));
                      }
                      setDragColId(null);
                      setDropTargetId(null);
                    }}
                    onDragEnd={() => {
                      setDragColId(null);
                      setDropTargetId(null);
                    }}
                    className={cn(
                      "border-brand-orange/20 relative select-none",
                      index < visibleColumns.length - 1 && "border-r",
                      isStickyName &&
                        "bg-brand-orange-soft dark:bg-brand-orange/20 md:sticky md:left-0 md:z-20",
                      isStatusCol && "text-brand-orange",
                      colId === "actions" ? "px-2 text-center" : "px-2.5",
                      isDropTarget && "border-l-brand-orange bg-brand-orange-soft border-l-2",
                      dragColId === colId && "opacity-60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex cursor-grab items-center gap-1 overflow-hidden active:cursor-grabbing",
                        colId === "actions" && "justify-center",
                      )}
                      title={columnLabels[colId]}
                    >
                      {colId !== "actions" && (
                        <GripVertical
                          className={cn(
                            "size-3 shrink-0",
                            isStatusCol
                              ? "text-brand-orange/75"
                              : "text-brand-orange/50",
                          )}
                        />
                      )}
                      {isStatusCol && (
                        <span
                          aria-hidden
                          className="bg-brand-orange size-1.5 shrink-0 rounded-full"
                        />
                      )}
                      <span className="truncate">{columnLabels[colId]}</span>
                    </div>
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`${columnLabels[colId]} resize`}
                      onPointerDown={(e) => startResize(colId, e)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setColumnsState((prev) => ({
                          ...prev,
                          widths: {
                            ...prev.widths,
                            [colId]: TABLE_COLUMN_DEFS[colId].defaultWidth,
                          },
                        }));
                      }}
                      className={cn(
                        "hover:bg-brand-orange/70 absolute top-0 right-0 bottom-0 z-30 w-1.5 cursor-col-resize transition-colors",
                        resizingId === colId && "bg-brand-orange",
                      )}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {nodes.map((node) => {
              if (node.kind === "group") {
                return (
                  <tr
                    key={`g:${node.id}`}
                    className="bg-brand-orange-soft/55 dark:bg-brand-orange/12 border-l-brand-orange border-l-4"
                  >
                    <td colSpan={visibleColumns.length} className="px-2 py-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground h-7 gap-1.5 px-1.5 text-xs font-bold hover:bg-brand-orange/10"
                        onClick={() => onToggleGroup(node.id)}
                      >
                        {!!collapsed[node.id] && !filtered ? (
                          <ChevronRight className="text-brand-orange size-3.5" />
                        ) : (
                          <ChevronDown className="text-brand-orange size-3.5" />
                        )}
                        <span>{node.name}</span>
                        <span className="bg-brand-orange rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {node.count}
                        </span>
                      </Button>
                    </td>
                  </tr>
                );
              }

              if (node.kind === "add") {
                return (
                  <tr key={`a:${node.parent.id}`} className="bg-background">
                    <td
                      colSpan={visibleColumns.length}
                      className="px-3 py-1 pl-9"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-brand-orange h-7 gap-1 text-[11px]"
                        onClick={() => onStartCreating(node.parent.id)}
                      >
                        <Plus className="size-3" />
                        {t("campaign.timeline.addSubtask")}
                      </Button>
                    </td>
                  </tr>
                );
              }

              if (node.kind === "creator") {
                return (
                  <tr
                    key={`c:${node.parent.id}`}
                    className="bg-brand-orange-soft"
                  >
                    <td colSpan={visibleColumns.length} className="p-0">
                      <TimelineSubtaskCreator
                        timezone={data.timezone}
                        members={data.members}
                        busy={busy}
                        taskType={node.parent.type as TaskType}
                        onCreate={(name, assigneeId, dueDate, subtaskRole) =>
                          edit({
                            kind: "create",
                            taskId: node.parent.id,
                            name,
                            assigneeId,
                            dueDate,
                            subtaskRole,
                          })
                        }
                        onCancel={onCancelCreating}
                      />
                    </td>
                  </tr>
                );
              }

              const isTask = node.kind === "task";
              const task = isTask ? node.row : node.parent;
              const item = node.row;

              return (
                <tr
                  key={isTask ? `t:${task.id}` : `s:${task.id}:${item.id}`}
                  className={cn(
                    "hover:bg-muted/30 align-top transition-colors",
                    isTask ? "bg-card" : "bg-muted/15",
                  )}
                >
                  {visibleColumns.map((colId, index) => {
                    const isStickyName = stickyNameFirst && colId === "name";
                    return (
                      <td
                        key={colId}
                        className={cn(
                          "border-border min-w-0 overflow-hidden py-1.5",
                          index < visibleColumns.length - 1 && "border-r",
                          isStickyName && [
                            "md:sticky md:left-0 md:z-10",
                            isTask ? "md:bg-card" : "md:bg-muted",
                          ],
                          colId === "actions"
                            ? "px-1 text-center"
                            : colId === "status"
                              ? "px-2.5"
                              : "px-2",
                        )}
                      >
                        {renderCell(colId, node)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {canCreateTask && onOpenCreateTask && (
              <tr className="bg-background hover:bg-brand-orange-soft/30 transition-colors">
                <td colSpan={visibleColumns.length} className="px-2 py-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-brand-orange hover:bg-brand-orange/10 h-7 gap-1 px-2 text-xs font-medium"
                    onClick={onOpenCreateTask}
                  >
                    <Plus className="size-3.5" />
                    <span>
                      {t("campaign.timeline.addOutOfScopeTask", {
                        defaultValue: "Thêm công việc lớn",
                      })}
                    </span>
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {nodes.length === 0 && (
          <p className="text-muted-foreground p-6 text-sm">
            {t("campaign.timeline.noResults")}
          </p>
        )}
      </div>
    </div>
  );
}
