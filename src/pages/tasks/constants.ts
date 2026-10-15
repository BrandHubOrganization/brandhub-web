import type { CanonicalTaskStatus } from "@/pages/tasks/taskStatus";
export const STATUS_CONFIG: Record<
  CanonicalTaskStatus,
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
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
  IN_PROGRESS: {
    labelKey: "tasks.status.IN_PROGRESS",
    defaultLabel: "In progress",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  IN_REVIEW: {
    labelKey: "tasks.status.IN_REVIEW",
    defaultLabel: "In review",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  CANCELLED: {
    labelKey: "tasks.status.CANCELLED",
    defaultLabel: "Cancelled",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
  FINISHED: {
    labelKey: "tasks.status.FINISHED",
    defaultLabel: "Finished",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
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
