import type { TaskStatus } from "@/types/task";

export const STATUS_CONFIG: Record<
  TaskStatus,
  { labelKey: string; defaultLabel: string; bg: string; text: string; border: string; dot: string }
> = {
  BACKLOG: {
    labelKey: "tasks.status.backlog",
    defaultLabel: "Backlog",
    bg: "bg-slate-500/10 dark:bg-slate-500/15",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
  },
  DETAIL_IDENTIFIED: {
    labelKey: "tasks.status.detailIdentified",
    defaultLabel: "Identified",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
    dot: "bg-indigo-500",
  },
  ASSIGNED: {
    labelKey: "tasks.status.assigned",
    defaultLabel: "To Do",
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  IN_PROGRESS: {
    labelKey: "tasks.status.inProgress",
    defaultLabel: "In Progress",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  QC_REVIEW: {
    labelKey: "tasks.status.qcReview",
    defaultLabel: "QC Review",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/15",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/30",
    dot: "bg-cyan-500",
  },
  MANAGER_REVIEW: {
    labelKey: "tasks.status.managerReview",
    defaultLabel: "In Review",
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  CLIENT_REVIEW: {
    labelKey: "tasks.status.clientReview",
    defaultLabel: "Client Review",
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/30",
    dot: "bg-purple-500",
  },
  COMPLETED: {
    labelKey: "tasks.status.completed",
    defaultLabel: "Done",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
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
