import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Mail,
  Megaphone,
  ShieldCheck,
  Video,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type { TaskType } from "@/types/task";
import { taskDeadline } from "@/pages/tasks/utils/taskViewData";
import type { TaskBoardCardProps } from "../types/types";

export type { TaskBoardCardProps };

const TYPE_CONFIG: Record<TaskType, { icon: typeof FileText; color: string }> =
  {
    POST: {
      icon: FileText,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    LIVESTREAM: {
      icon: Video,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    SURVEY: {
      icon: ClipboardList,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    EVENT_PLAN: {
      icon: Calendar,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    PRESS_RECOMMENDATION: {
      icon: Megaphone,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    SHORT_VIDEO: {
      icon: Video,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    KOL_BOOKING: {
      icon: Megaphone,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    WORKSHOP: {
      icon: Calendar,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    EMAIL_NEWSLETTER: {
      icon: Mail,
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    },
  };

function getInitials(name?: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(due: Date, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang, {
      day: "2-digit",
      month: "2-digit",
    }).format(due);
  } catch {
    return "";
  }
}

export function TaskBoardCard({
  task,
  isDragging,
  onTaskClick,
  onDragStart,
  onDragEnd,
}: TaskBoardCardProps) {
  const { t, i18n } = useTranslation();
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const userId = useAuthStore((s) => s.user?.id);
  const canDrag = currentMemberRole !== "CREATOR" || task.assigneeId === userId;
  const [now] = useState(() => Date.now());

  const due = taskDeadline(task);
  const isOverdue = Boolean(
    due &&
    due.getTime() < now &&
    task.status !== "FINISHED" &&
    task.status !== "CANCELLED",
  );
  const typeCfg = TYPE_CONFIG[task.type] ?? {
    icon: FileText,
    color: "text-muted-foreground bg-muted border-border",
  };
  const TypeIcon = typeCfg.icon;
  const taskKey = task.key || (task.id ? `#${task.id.slice(0, 6)}` : "");
  const assigneeInitials = getInitials(task.assigneeName);

  return (
    <button
      type="button"
      draggable={canDrag}
      data-task-open={task.id}
      onClick={() => onTaskClick(task)}
      onDragStart={canDrag ? (e) => onDragStart(e, task) : undefined}
      onDragEnd={canDrag ? onDragEnd : undefined}
      className={`group focus-visible:ring-brand-orange bg-card flex w-full flex-col gap-2.5 rounded-xl border p-3 text-left shadow-xs transition-all duration-150 outline-none focus-visible:ring-2 ${
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      } ${
        isDragging
          ? "border-brand-orange scale-[0.98] border-dashed opacity-40 shadow-md"
          : "border-border hover:border-brand-orange/50 hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98]"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-1.5">
        <span
          className={`text-2xs inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium ${typeCfg.color}`}
        >
          <TypeIcon className="size-3 shrink-0" aria-hidden="true" />
          <span className="max-w-[100px] truncate">
            {t(`tasks.types.${task.type}`)}
          </span>
        </span>
        {taskKey && (
          <span className="text-2xs text-muted-foreground/80 bg-muted/60 border-border/40 shrink-0 rounded border px-1.5 py-0.5 font-mono font-medium">
            {taskKey}
          </span>
        )}
      </div>

      <p className="text-foreground group-hover:text-brand-orange line-clamp-2 text-xs leading-snug font-semibold transition-colors sm:text-sm">
        {task.name}
      </p>

      <div className="text-2xs text-muted-foreground border-border/50 flex items-center justify-between gap-2 border-t pt-0.5">
        <div className="flex min-w-0 items-center gap-1.5">
          {due && (
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${
                isOverdue
                  ? "border border-rose-500/20 bg-rose-500/10 font-medium text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground bg-muted/50"
              }`}
            >
              <Clock className="size-3 shrink-0" aria-hidden="true" />
              <span>{formatDate(due, i18n.language)}</span>
            </span>
          )}
          {task.requiresClientApproval && (
            <span
              className="inline-flex shrink-0 items-center text-amber-500"
              title={t("tasks.approvalRequired", {
                defaultValue: "Yêu cầu khách hàng duyệt",
              })}
            >
              <ShieldCheck className="size-3.5" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {task.assigneeAvatar ? (
            <img
              src={task.assigneeAvatar}
              alt={task.assigneeName || ""}
              className="border-border size-5 rounded-full border object-cover"
            />
          ) : assigneeInitials ? (
            <span className="bg-brand-orange/15 text-brand-orange border-brand-orange/30 text-2xs flex size-5 shrink-0 items-center justify-center rounded-full border font-semibold">
              {assigneeInitials}
            </span>
          ) : (
            <span className="text-muted-foreground/60 text-2xs max-w-[80px] truncate">
              {t("tasks.unassigned")}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
