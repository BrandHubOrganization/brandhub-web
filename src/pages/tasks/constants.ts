import type { TaskStatus } from "@/types/task";
export const STATUS_CONFIG: Record<
  TaskStatus,
  {
    labelKey: string;
    defaultLabel: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  TODO: {
    labelKey: "tasks.status.TODO",
    defaultLabel: "To do",
    bg: "bg-amber-500/12 dark:bg-amber-500/15",
    text: "text-amber-900 dark:text-amber-200",
    border: "border-amber-500/40",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    labelKey: "tasks.status.IN_PROGRESS",
    defaultLabel: "In progress",
    bg: "bg-brand-orange/15 dark:bg-brand-orange/20",
    text: "text-brand-orange dark:text-orange-300",
    border: "border-brand-orange/45",
    dot: "bg-brand-orange",
  },
  IN_REVIEW: {
    labelKey: "tasks.status.IN_REVIEW",
    defaultLabel: "In review",
    bg: "bg-sky-500/12 dark:bg-sky-500/15",
    text: "text-sky-800 dark:text-sky-300",
    border: "border-sky-500/40",
    dot: "bg-sky-500",
  },
  CANCELLED: {
    labelKey: "tasks.status.CANCELLED",
    defaultLabel: "Cancelled",
    bg: "bg-rose-500/12 dark:bg-rose-500/15",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-500/40",
    dot: "bg-rose-500",
  },
  FINISHED: {
    labelKey: "tasks.status.FINISHED",
    defaultLabel: "Finished",
    bg: "bg-emerald-500/12 dark:bg-emerald-500/15",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-500/40",
    dot: "bg-emerald-500",
  },
};
export const PRIORITY_CONFIG = {
  LOW: {
    label: "Low",
    color: "text-slate-400",
    barColor: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    color: "text-amber-500",
    barColor: "bg-amber-500",
  },
  HIGH: {
    label: "High",
    color: "text-orange-500",
    barColor: "bg-orange-500",
  },
  URGENT: {
    label: "Urgent",
    color: "text-rose-500",
    barColor: "bg-rose-500",
  },
};
