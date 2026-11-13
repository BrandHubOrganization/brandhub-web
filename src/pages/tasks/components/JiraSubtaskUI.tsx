import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Clock,
  CornerDownLeft,
  CornerDownRight,
  Loader2,
  User,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { JiraDatePicker } from "@/components/ui/jira-date-picker";
import {
  formatJiraSubtaskDate,
  isSubtaskOverdue,
} from "@/pages/tasks/utils/jiraSubtaskUtils";
import { useTaskCatalogRoles } from "@/pages/tasks/hooks/useTaskCatalogRoles";
import type { CatalogRoleDef } from "@/services/taskCatalogService";
import type { TaskType } from "@/types/task";

export function JiraSubtaskIcon({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded-[3px] border border-sky-500/20 bg-sky-500/15 text-sky-600 shadow-2xs dark:text-sky-400",
        className,
      )}
      title={t("tasks.subtasks.title")}
      aria-label={t("tasks.subtasks.title")}
    >
      <CornerDownRight className="size-2.5 stroke-[2.5]" />
    </span>
  );
}

/** Catalogue role name shown on a subtask row; null/undefined = free subtask, renders nothing (T8.7). */
export function JiraSubtaskRoleBadge({
  roleName,
  className,
}: {
  roleName?: string | null;
  className?: string;
}) {
  if (!roleName) return null;
  return (
    <span
      className={cn(
        "text-3xs inline-flex shrink-0 items-center rounded border border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 font-medium whitespace-nowrap text-violet-600 dark:text-violet-400",
        className,
      )}
      title={roleName}
    >
      {roleName}
    </span>
  );
}

export function JiraStatusLozenge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const norm = status;
  const known = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "FINISHED",
    "CANCELLED",
  ].includes(norm);
  const text =
    label ||
    t(known ? `tasks.subtasks.status.${norm}` : "tasks.subtasks.unknownStatus");
  let colorStyles =
    "bg-amber-500/12 text-amber-900 border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/40";

  if (norm === "TODO") {
    colorStyles =
      "bg-amber-500/12 text-amber-900 border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/40";
  } else if (norm === "IN_PROGRESS") {
    colorStyles =
      "bg-brand-orange/15 text-brand-orange border-brand-orange/45 dark:bg-brand-orange/20 dark:text-orange-300 dark:border-brand-orange/50";
  } else if (norm === "IN_REVIEW") {
    colorStyles =
      "bg-sky-500/12 text-sky-800 border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/40";
  } else if (norm === "FINISHED") {
    colorStyles =
      "bg-emerald-500/12 text-emerald-800 border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40";
  } else if (norm === "CANCELLED") {
    colorStyles =
      "bg-rose-500/12 text-rose-800 border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/40";
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs leading-none font-semibold select-none",
        colorStyles,
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
      {text}
    </span>
  );
}

export function JiraAssigneeAvatar({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  if (!name) {
    return (
      <div
        className={cn(
          "border-border/80 bg-muted/40 text-muted-foreground flex size-5.5 shrink-0 items-center justify-center rounded-full border border-dashed",
          className,
        )}
        title="Chưa giao"
      >
        <User className="text-muted-foreground/60 size-2.5" />
      </div>
    );
  }
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "text-3xs flex size-5.5 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 font-semibold text-indigo-700 shadow-2xs select-none dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
        className,
      )}
      title={name}
    >
      {initials || name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function JiraSubtaskDueDate({
  dueDate,
  isDone,
  className,
}: {
  dueDate: string | null | undefined;
  isDone: boolean;
  className?: string;
}) {
  if (!dueDate) return null;
  const overdue = isSubtaskOverdue(dueDate, isDone);
  const formatted = formatJiraSubtaskDate(dueDate);

  if (overdue) {
    return (
      <span
        className={cn(
          "text-3xs inline-flex shrink-0 items-center gap-1 rounded border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 font-semibold whitespace-nowrap text-rose-600 tabular-nums dark:text-rose-400",
          className,
        )}
        title={`Quá hạn: ${new Date(dueDate).toLocaleString()}`}
      >
        <AlertCircle className="size-2.5 shrink-0" />
        <span>{formatted}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-3xs text-muted-foreground inline-flex shrink-0 items-center gap-1 font-mono whitespace-nowrap tabular-nums",
        className,
      )}
      title={new Date(dueDate).toLocaleString()}
    >
      <Clock className="text-muted-foreground/60 size-2.5 shrink-0" />
      <span>{formatted}</span>
    </span>
  );
}

export interface MemberOption {
  userId: string;
  displayName: string;
}

export interface JiraInlineSubtaskCreatorProps {
  onSubmit: (data: {
    name: string;
    assigneeId: string;
    supervisorOverrideId: string | null;
    dueDate: string;
    subtaskRole?: string | null;
  }) => void | Promise<void>;
  onCancel?: () => void;
  parentAssigneeId?: string | null;
  parentAssigneeName?: string | null;
  parentDueDate?: string | null;
  members?: MemberOption[];
  isLoading?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  /** Offers "suggest from catalog" roles for this task type (T8.7); omitted = free subtask only. */
  taskType?: TaskType;
}

export function JiraInlineSubtaskCreator({
  onSubmit,
  onCancel,
  parentAssigneeId,
  parentAssigneeName,
  parentDueDate,
  members = [],
  isLoading = false,
  autoFocus = true,
  placeholder,
  className,
  taskType,
}: JiraInlineSubtaskCreatorProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState<string>(
    parentDueDate ? new Date(parentDueDate).toISOString() : "",
  );
  const [assigneeId, setAssigneeId] = useState<string>(
    parentAssigneeId || members[0]?.userId || "",
  );
  const [subtaskRole, setSubtaskRole] = useState<string | null>(null);

  const { roles, roleLabel } = useTaskCatalogRoles(taskType);

  // Sync if parent info loads after initial render
  useEffect(() => {
    if (!assigneeId && (parentAssigneeId || members[0]?.userId)) {
      setAssigneeId(parentAssigneeId || members[0]?.userId || "");
    }
  }, [parentAssigneeId, members, assigneeId]);

  useEffect(() => {
    if (!dueDate && parentDueDate) {
      setDueDate(parentDueDate);
    }
  }, [parentDueDate, dueDate]);

  const selectedAssigneeName = useMemo(() => {
    if (assigneeId === parentAssigneeId && parentAssigneeName) {
      return parentAssigneeName;
    }
    const found = members.find((m) => m.userId === assigneeId);
    if (found) return found.displayName;
    if (parentAssigneeName) return parentAssigneeName;
    return null;
  }, [assigneeId, parentAssigneeId, parentAssigneeName, members]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed || isLoading) return;

    const finalAssigneeId =
      assigneeId || parentAssigneeId || members[0]?.userId || "";

    const finalDueDate = dueDate
      ? new Date(dueDate).toISOString()
      : parentDueDate
        ? new Date(parentDueDate).toISOString()
        : new Date(Date.now() + 7 * 86400000).toISOString();

    onSubmit({
      name: trimmed,
      assigneeId: finalAssigneeId,
      supervisorOverrideId: null,
      dueDate: finalDueDate,
      subtaskRole,
    });

    setName("");
    setSubtaskRole(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const pickRole = (role: CatalogRoleDef) => {
    setSubtaskRole(role.role);
    if (!name.trim()) setName(role.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      if (onCancel) {
        e.preventDefault();
        onCancel();
      }
    }
  };

  return (
    <div
      className={cn(
        "bg-background relative flex h-10 min-h-[38px] w-full items-center gap-2 rounded-lg px-2.5 py-1",
        "border-primary/40 focus-within:border-primary focus-within:ring-primary/20 border-2 focus-within:ring-2",
        "shadow-2xs transition-all",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left: Jira Subtask Glyph with Chevron */}
      <div
        className="text-primary flex shrink-0 items-center gap-1 pl-0.5 select-none"
        title={t("tasks.subtasks.title")}
      >
        <div className="flex size-4 items-center justify-center rounded-[3px] border border-blue-500 bg-blue-50/70 text-blue-600 shadow-2xs dark:bg-blue-950/60 dark:text-blue-400">
          <Check className="size-2.5 stroke-[3]" />
        </div>
        <ChevronDown className="text-muted-foreground/70 size-3" />
      </div>

      {roles.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 shrink-0 gap-1 px-2 text-xs"
            >
              {subtaskRole
                ? roleLabel(subtaskRole)
                : t("tasks.subtasks.suggestFromCatalog")}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuLabel>
              {t("tasks.subtasks.suggestFromCatalog")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((role) => (
              <DropdownMenuItem key={role.role} onClick={() => pickRole(role)}>
                {roleLabel(role.role)}
              </DropdownMenuItem>
            ))}
            {subtaskRole && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSubtaskRole(null)}>
                  {t("tasks.subtasks.freeSubtask")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Middle: Input */}
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          placeholder ||
          t(
            "tasks.subtasks.whatNeedsToBeDone",
            "Cần làm gì? (What needs to be done?)",
          )
        }
        disabled={isLoading}
        autoFocus={autoFocus}
        maxLength={255}
        className="text-foreground placeholder:text-muted-foreground/60 h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-xs outline-none focus:ring-0 focus:outline-none sm:text-sm"
      />

      {/* Right: Jira Date Picker */}
      <div className="max-w-[130px] shrink-0 sm:max-w-[145px]">
        <JiraDatePicker
          value={dueDate}
          onChange={(val) => setDueDate(val || "")}
          includeTime={false}
          placeholder="dd/MM/yyyy"
          popoverAlign="end"
          ariaLabel="Hạn hoàn thành"
          title={
            dueDate
              ? `Hạn hoàn thành: ${new Date(dueDate).toLocaleString()}`
              : "Chọn hạn hoàn thành"
          }
          extraPresets={
            parentDueDate
              ? [
                  {
                    label: "Hạn task cha",
                    date: parentDueDate,
                    title: `Theo hạn task cha: ${new Date(parentDueDate).toLocaleString()}`,
                  },
                ]
              : undefined
          }
          inputClassName="h-7 px-1.5 text-2xs border-border/60 hover:border-border"
        />
      </div>

      {/* Right: Assignee Avatar Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hover:ring-primary/30 shrink-0 cursor-pointer rounded-full p-0.5 transition-all hover:ring-2"
            title={`${t("tasks.subtasks.assignee")}: ${selectedAssigneeName || t("tasks.subtasks.unassigned")}`}
          >
            <JiraAssigneeAvatar
              name={selectedAssigneeName}
              className="size-6"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-60 w-56 overflow-y-auto p-1"
        >
          <DropdownMenuLabel className="text-3xs text-muted-foreground px-2 py-1 tracking-wider uppercase">
            {t("tasks.subtasks.assignee")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {members.map((member) => {
            const isSelected = member.userId === assigneeId;
            return (
              <DropdownMenuItem
                key={member.userId}
                onClick={() => setAssigneeId(member.userId)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 py-1.5 text-xs",
                  isSelected && "bg-accent font-medium",
                )}
              >
                <JiraAssigneeAvatar
                  name={member.displayName}
                  className="size-5"
                />
                <span className="flex-1 truncate">{member.displayName}</span>
                {isSelected && (
                  <Check className="text-primary ml-auto size-3" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right: Submit Button Create ⏎ */}
      <button
        type="button"
        disabled={!name.trim() || isLoading}
        onClick={handleSubmit}
        className={cn(
          "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors select-none",
          "bg-slate-200/80 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
          "shadow-2xs disabled:cursor-not-allowed disabled:opacity-40",
        )}
        title="Nhấn Enter hoặc click để tạo"
      >
        {isLoading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <>
            <span>{t("tasks.subtasks.createAction", "Create")}</span>
            <CornerDownLeft className="text-muted-foreground/90 size-3 shrink-0" />
          </>
        )}
      </button>

      {/* Optional Cancel button */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer rounded p-1 transition-colors"
          title="Hủy (Esc)"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
