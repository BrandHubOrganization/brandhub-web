import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Equal,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { TaskPriority } from "@/types/task";
import { FilterCheckbox } from "./TaskFilterCategoryList";
import type {
  ApprovalOptionListProps,
  PriorityOptionListProps,
  ReporterOptionListProps,
} from "./types";

export type {
  ApprovalOptionListProps,
  PriorityOptionListProps,
  ReporterOptionListProps,
};

export const ALL_PRIORITIES: TaskPriority[] = [
  "URGENT",
  "HIGH",
  "MEDIUM",
  "LOW",
];

const PRIORITY_META: Record<
  TaskPriority,
  { icon: ReactNode; colorClass: string; defaultLabel: string }
> = {
  URGENT: {
    icon: <AlertTriangle className="size-3.5 text-rose-500" />,
    colorClass: "text-rose-500",
    defaultLabel: "Khẩn cấp",
  },
  HIGH: {
    icon: <ArrowUp className="size-3.5 text-amber-500" />,
    colorClass: "text-amber-500",
    defaultLabel: "Cao",
  },
  MEDIUM: {
    icon: <Equal className="size-3.5 text-yellow-500" />,
    colorClass: "text-yellow-500",
    defaultLabel: "Trung bình",
  },
  LOW: {
    icon: <ArrowDown className="size-3.5 text-blue-500" />,
    colorClass: "text-blue-500",
    defaultLabel: "Thấp",
  },
};

export function PriorityOptionList({
  selectedPriorities,
  onTogglePriority,
  searchQuery,
}: PriorityOptionListProps) {
  const { t } = useTranslation();
  const q = searchQuery.trim().toLowerCase();

  const filtered = ALL_PRIORITIES.filter((priority) => {
    if (!q) return true;
    const meta = PRIORITY_META[priority];
    const label = t(`tasks.priority.${priority}`, {
      defaultValue: meta.defaultLabel,
    });
    return (
      label.toLowerCase().includes(q) || priority.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {filtered.map((priority) => {
        const meta = PRIORITY_META[priority];
        const isChecked = selectedPriorities.includes(priority);
        const label = t(`tasks.priority.${priority}`, {
          defaultValue: meta.defaultLabel,
        });

        return (
          <button
            key={priority}
            type="button"
            onClick={() => onTogglePriority(priority)}
            className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
          >
            <FilterCheckbox isChecked={isChecked} />
            <div className="flex size-5 shrink-0 items-center justify-center">
              {meta.icon}
            </div>
            <span className="truncate flex-1 font-medium text-foreground">
              {label}
            </span>
          </button>
        );
      })}
    </>
  );
}

export function ReporterOptionList({
  reporters,
  selectedReporters,
  onToggleReporter,
  searchQuery,
}: ReporterOptionListProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const q = searchQuery.trim().toLowerCase();

  const currentUserLabel = t("tasks.timelineGrid.currentUser", {
    defaultValue: "Người dùng hiện tại (đã đăng nhập)",
  });
  const currentUserName = currentUser?.name || "";
  const showCurrentUser =
    !q ||
    currentUserLabel.toLowerCase().includes(q) ||
    "current user".includes(q) ||
    (currentUserName && currentUserName.toLowerCase().includes(q));

  const validReporters = reporters
    .filter(
      (p) =>
        p.id !== "UNASSIGNED" &&
        p.name.trim().toLowerCase() !== "unknown" &&
        p.id !== currentUser?.id,
    )
    .filter((p) => !q || p.name.toLowerCase().includes(q));

  const currentUserId = currentUser?.id || "CURRENT_USER";
  const isCurrentChecked =
    selectedReporters.includes(currentUserId) ||
    (currentUser?.id ? selectedReporters.includes(currentUser.id) : false);

  return (
    <>
      {showCurrentUser && (
        <button
          type="button"
          onClick={() => onToggleReporter(currentUserId)}
          className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
        >
          <FilterCheckbox isChecked={isCurrentChecked} />
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange font-bold text-[10px]">
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : <User className="size-3" />}
          </div>
          <span className="truncate flex-1 font-medium text-foreground">
            {currentUserLabel}
          </span>
        </button>
      )}

      {validReporters.map((reporter) => {
        const isChecked = selectedReporters.includes(reporter.id);
        return (
          <button
            key={reporter.id}
            type="button"
            onClick={() => onToggleReporter(reporter.id)}
            className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
          >
            <FilterCheckbox isChecked={isChecked} />
            {reporter.avatar ? (
              <img
                src={reporter.avatar}
                alt={reporter.name}
                className="size-5 shrink-0 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-semibold border border-border">
                {reporter.initials}
              </div>
            )}
            <span className="truncate flex-1 text-foreground">
              {reporter.name}
            </span>
          </button>
        );
      })}
    </>
  );
}

export function ApprovalOptionList({
  selectedApprovals,
  onToggleApproval,
  searchQuery,
}: ApprovalOptionListProps) {
  const { t } = useTranslation();
  const q = searchQuery.trim().toLowerCase();

  const options: {
    value: "YES" | "NO";
    label: string;
    icon: ReactNode;
  }[] = [
    {
      value: "YES",
      label: t("tasks.timelineGrid.approvalYes", {
        defaultValue: "Cần khách hàng duyệt",
      }),
      icon: <ShieldCheck className="size-3.5 text-emerald-500" />,
    },
    {
      value: "NO",
      label: t("tasks.timelineGrid.approvalNo", {
        defaultValue: "Không cần khách hàng duyệt",
      }),
      icon: <Shield className="size-3.5 text-muted-foreground" />,
    },
  ];

  const filtered = options.filter(
    (opt) => !q || opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q),
  );

  return (
    <>
      {filtered.map((opt) => {
        const isChecked = selectedApprovals.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggleApproval(opt.value)}
            className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
          >
            <FilterCheckbox isChecked={isChecked} />
            <div className="flex size-5 shrink-0 items-center justify-center">
              {opt.icon}
            </div>
            <span className="truncate flex-1 font-medium text-foreground">
              {opt.label}
            </span>
          </button>
        );
      })}
    </>
  );
}