import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  FileText,
  FolderKanban,
  Megaphone,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus, TaskType } from "@/types/task";
import type {
  ParentListProps,
  ScheduleListProps,
  StatusListProps,
  TypeListProps,
} from "./types";

export type {
  ParentListProps,
  ScheduleListProps,
  StatusListProps,
  TypeListProps,
};

export function FilterCheckbox({ isChecked }: { isChecked: boolean }) {
  return (
    <div
      className={cn(
        "size-4 rounded border flex items-center justify-center shrink-0 transition-colors",
        isChecked
          ? "border-brand-orange bg-brand-orange text-white"
          : "border-border bg-background group-hover:border-muted-foreground/50",
      )}
    >
      {isChecked && <Check className="size-3 stroke-[3]" />}
    </div>
  );
}

export const TYPE_ICONS: Record<TaskType, ReactNode> = {
  POST: <FileText className="size-3.5" />,
  LIVESTREAM: <Video className="size-3.5" />,
  SURVEY: <ClipboardList className="size-3.5" />,
  EVENT_PLAN: <Calendar className="size-3.5" />,
  PRESS_RECOMMENDATION: <Megaphone className="size-3.5" />,
};

export const ALL_TYPES: TaskType[] = [
  "POST",
  "LIVESTREAM",
  "SURVEY",
  "EVENT_PLAN",
  "PRESS_RECOMMENDATION",
];

export const ALL_STATUSES: { value: TaskStatus; dot: string }[] = [
  { value: "TODO", dot: "bg-slate-400" },
  { value: "IN_PROGRESS", dot: "bg-sky-500" },
  { value: "IN_REVIEW", dot: "bg-amber-500" },
  { value: "FINISHED", dot: "bg-emerald-500" },
  { value: "CANCELLED", dot: "bg-rose-500" },
];

export function StatusOptionList({
  selectedStatuses,
  onToggleStatus,
  searchQuery,
}: StatusListProps) {
  const { t } = useTranslation();
  const q = searchQuery.trim().toLowerCase();

  const filtered = ALL_STATUSES.filter(({ value }) => {
    if (!q) return true;
    const label = t(`tasks.status.${value}`, { defaultValue: value });
    return label.toLowerCase().includes(q) || value.toLowerCase().includes(q);
  });

  if (filtered.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        {t("tasks.timelineGrid.noOptionsFound", {
          defaultValue: "Không tìm thấy trạng thái phù hợp",
        })}
      </div>
    );
  }

  return (
    <>
      {filtered.map(({ value, dot }) => (
        <button
          key={value}
          type="button"
          onClick={() => onToggleStatus(value)}
          className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
        >
          <FilterCheckbox isChecked={selectedStatuses.includes(value)} />
          <span className={cn("size-2 rounded-full shrink-0", dot)} />
          <span className="truncate flex-1 text-foreground">
            {t(`tasks.status.${value}`, { defaultValue: value })}
          </span>
        </button>
      ))}
    </>
  );
}

export function TypeOptionList({
  selectedTypes,
  onToggleType,
  searchQuery,
}: TypeListProps) {
  const { t } = useTranslation();
  const q = searchQuery.trim().toLowerCase();

  const filtered = ALL_TYPES.filter((type) => {
    if (!q) return true;
    const label = t(`tasks.types.${type}`, { defaultValue: type });
    return label.toLowerCase().includes(q) || type.toLowerCase().includes(q);
  });

  if (filtered.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        {t("tasks.timelineGrid.noOptionsFound", {
          defaultValue: "Không tìm thấy loại công việc phù hợp",
        })}
      </div>
    );
  }

  return (
    <>
      {filtered.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onToggleType(type)}
          className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
        >
          <FilterCheckbox isChecked={selectedTypes.includes(type)} />
          <span className="text-muted-foreground shrink-0">
            {TYPE_ICONS[type]}
          </span>
          <span className="truncate flex-1 text-foreground">
            {t(`tasks.types.${type}`, { defaultValue: type })}
          </span>
        </button>
      ))}
    </>
  );
}

export function ScheduleOptionList({
  selectedSchedules,
  onToggleSchedule,
  searchQuery,
}: ScheduleListProps) {
  const { t } = useTranslation();
  const q = searchQuery.trim().toLowerCase();

  const isAll =
    selectedSchedules.length === 0 || selectedSchedules.includes("ALL");
  const options = [
    {
      id: "ALL",
      label: t("tasks.timelineGrid.scheduleAll", { defaultValue: "Tất cả" }),
      icon: <Calendar className="size-3.5 text-muted-foreground" />,
      isChecked: isAll,
      className: "text-foreground",
    },
    {
      id: "UNSCHEDULED",
      label: t("tasks.timelineGrid.scheduleUnscheduled", {
        defaultValue: "Chưa có hạn",
      }),
      icon: <Clock className="size-3.5 text-muted-foreground" />,
      isChecked: selectedSchedules.includes("UNSCHEDULED"),
      className: "text-foreground",
    },
    {
      id: "OVERDUE",
      label: t("tasks.timelineGrid.scheduleOverdue", {
        defaultValue: "Quá hạn",
      }),
      icon: <AlertCircle className="size-3.5 text-rose-500" />,
      isChecked: selectedSchedules.includes("OVERDUE"),
      className: "text-rose-600 dark:text-rose-400 font-medium",
    },
  ];

  const filtered = options.filter(
    (opt) => !q || opt.label.toLowerCase().includes(q),
  );

  if (filtered.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        {t("tasks.timelineGrid.noOptionsFound", {
          defaultValue: "Không tìm thấy lịch trình phù hợp",
        })}
      </div>
    );
  }

  return (
    <>
      {filtered.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onToggleSchedule(opt.id)}
          className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
        >
          <FilterCheckbox isChecked={opt.isChecked} />
          {opt.icon}
          <span className={cn("truncate flex-1", opt.className)}>
            {opt.label}
          </span>
        </button>
      ))}
    </>
  );
}

export function ParentOptionList({
  parents,
  selectedParents,
  onToggleParent,
  searchQuery,
}: ParentListProps) {
  const { t } = useTranslation();
  const q = searchQuery.trim().toLowerCase();

  const filtered = parents.filter(
    (p) => !q || p.name.toLowerCase().includes(q),
  );

  if (parents.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground">
        <FolderKanban className="size-6 mx-auto mb-2 text-muted-foreground/40 stroke-1" />
        <p>
          {t("tasks.timelineGrid.noParentsFound", {
            defaultValue: "Chưa có chiến dịch",
          })}
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        {t("tasks.timelineGrid.noOptionsFound", {
          defaultValue: "Không tìm thấy chiến dịch phù hợp",
        })}
      </div>
    );
  }

  return (
    <>
      {filtered.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onToggleParent(p.id)}
          className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
        >
          <FilterCheckbox isChecked={selectedParents.includes(p.id)} />
          <FolderKanban className="size-3.5 text-muted-foreground shrink-0" />
          <span className="truncate flex-1 text-foreground">{p.name}</span>
        </button>
      ))}
    </>
  );
}
