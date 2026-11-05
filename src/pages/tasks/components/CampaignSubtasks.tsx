import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronDown,
  CornerDownRight,
  Edit2,
  Loader2,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  JiraAssigneeAvatar,
  JiraInlineSubtaskCreator,
  JiraStatusLozenge,
  JiraSubtaskDueDate,
  JiraSubtaskIcon,
} from "@/pages/tasks/components/JiraSubtaskUI";
import { isSubtaskDone } from "@/pages/tasks/utils/jiraSubtaskUtils";

interface Details {
  name: string;
  assigneeId: string;
  supervisorOverrideId: string | null;
  dueDate: string;
}
interface Row {
  subtask: Details & { id: string; status: string };
  assigneeName: string | null;
  supervisorName: string | null;
  allowedStatuses: string[];
}
interface View {
  canManage: boolean;
  parentAssigneeId?: string | null;
  parentAssigneeName?: string | null;
  parentDueDate?: string | null;
  members: { userId: string; displayName: string }[];
  rows: Row[];
}

function localDate(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function CampaignSubtasks({
  workspaceId,
  taskId,
  parentRevision,
  parentDueDate,
}: {
  workspaceId: string;
  taskId: string;
  parentRevision: number | null;
  parentDueDate: string | null;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const path = `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/subtasks`;
  const userId = useAuthStore((state) => state.user?.id);
  const queryKey = [
    "campaign-subtasks",
    userId,
    workspaceId,
    taskId,
    parentRevision,
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => (await api.get<ApiResponse<View>>(path)).data.data,
  });

  const [draft, setDraft] = useState<(Details & { id?: string }) | null>(null);
  const supervisorId =
    draft?.supervisorOverrideId ?? query.data?.parentAssigneeId ?? "";
  const selectedSupervisor = query.data?.members.some(
    (member) => member.userId === supervisorId,
  )
    ? supervisorId
    : "";
  const [isCreating, setIsCreating] = useState(false);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  const change = useMutation({
    mutationFn: async (
      command:
        { id?: string; details: Details } | { id: string; status: string },
    ) => {
      if ("status" in command) {
        setLoadingRowId(command.id);
        return (
          await api.patch<ApiResponse<View>>(`${path}/${command.id}/status`, {
            status: command.status,
          })
        ).data.data;
      }
      return (
        await (command.id
          ? api.patch<ApiResponse<View>>(
              `${path}/${command.id}`,
              command.details,
            )
          : api.post<ApiResponse<View>>(path, command.details))
      ).data.data;
    },
    onSuccess: async (view, command) => {
      client.setQueryData(queryKey, view);
      if ("details" in command) {
        setDraft(null);
        setIsCreating(false);
      }
      await client.invalidateQueries({
        queryKey: ["task-review", userId, workspaceId, taskId],
      });
      await client.invalidateQueries({
        queryKey: ["campaign-subtasks"],
      });
    },
    onSettled: () => {
      setLoadingRowId(null);
    },
  });

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const { id, ...details } = draft;
    change.mutate({
      id,
      details: {
        ...details,
        dueDate: new Date(details.dueDate).toISOString(),
      },
    });
  }

  const statusLabel = (key: string) =>
    t(`tasks.subtasks.status.${key}`, {
      defaultValue: t("tasks.subtasks.unknownStatus"),
    });
  const rows = query.data?.rows ?? [];

  return (
    <section className="border-border bg-card/60 space-y-3.5 overflow-x-hidden rounded-xl border p-4 shadow-2xs">
      {/* Jira Subtasks Header & Actions */}
      <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
        <div className="flex items-center gap-2">
          <JiraSubtaskIcon />
          <h3 className="text-foreground text-sm font-semibold tracking-tight">
            {t("tasks.subtasks.title", "Sub-tasks")}
          </h3>
          {rows.length > 0 && (
            <span className="text-3xs text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5 font-mono">
              {rows.length}
            </span>
          )}
        </div>
        {query.data?.canManage && !draft && !isCreating && (
          <Button
            size="sm"
            variant="ghost"
            className="text-brand-orange hover:bg-brand-orange/10 h-7 cursor-pointer gap-1.5 px-2.5 text-xs font-medium"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="size-3.5" />
            <span>{t("tasks.subtasks.add", "Create subtask")}</span>
          </Button>
        )}
      </div>

      {/* Loading state */}
      {query.isPending && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-xs">
          <Loader2 className="text-brand-orange size-3.5 animate-spin" />
          <span>{t("tasks.loading", "Đang tải subtasks...")}</span>
        </div>
      )}

      {/* Error state */}
      {query.isError && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-center justify-between gap-2 rounded-lg border p-3 text-xs">
          <span>{t("tasks.subtasks.error", "Lỗi tải subtasks")}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            className="text-2xs h-6 cursor-pointer"
          >
            {t("tasks.retry", "Thử lại")}
          </Button>
        </div>
      )}

      {/* Empty state: No duplicate button */}
      {query.data?.rows.length === 0 && !draft && !isCreating && (
        <div
          onClick={
            query.data?.canManage ? () => setIsCreating(true) : undefined
          }
          className={cn(
            "border-border/70 bg-muted/10 flex items-center justify-between rounded-lg border border-dashed p-3 text-xs",
            query.data?.canManage &&
              "hover:bg-muted/20 cursor-pointer transition-colors",
          )}
          title={
            query.data?.canManage
              ? t("tasks.subtasks.add", "Create subtask")
              : undefined
          }
        >
          <div className="text-muted-foreground flex items-center gap-2">
            <CornerDownRight className="text-muted-foreground/60 size-3 shrink-0" />
            <span className="italic">
              {t("tasks.subtasks.empty", "Chưa có công việc con.")}
            </span>
          </div>
          {query.data?.canManage && (
            <span className="text-3xs text-brand-orange font-medium hover:underline">
              {t("tasks.subtasks.clickToAdd", "+ Thêm")}
            </span>
          )}
        </div>
      )}

      {/* Jira Subtask items list */}
      {rows.length > 0 && (
        <div className="border-border/60 bg-card divide-border/40 divide-y overflow-hidden rounded-lg border shadow-2xs">
          {rows.map((row) => {
            const isDone = isSubtaskDone(row.subtask.status);
            const isRowLoading = loadingRowId === row.subtask.id;

            return (
              <div
                key={row.subtask.id}
                className="hover:bg-muted/30 group flex items-center justify-between gap-2.5 overflow-x-hidden p-2.5 text-xs transition-colors"
              >
                {/* Left: Jira Subtask Icon + Title */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <JiraSubtaskIcon />
                  <button
                    type="button"
                    onClick={() => {
                      if (query.data?.canManage) {
                        setDraft({
                          id: row.subtask.id,
                          name: row.subtask.name,
                          assigneeId: row.subtask.assigneeId,
                          supervisorOverrideId:
                            row.subtask.supervisorOverrideId,
                          dueDate: localDate(row.subtask.dueDate),
                        });
                      }
                    }}
                    className={cn(
                      "min-w-0 flex-1 cursor-pointer truncate text-left text-xs transition-colors",
                      isDone
                        ? "text-muted-foreground/75 font-normal line-through"
                        : "text-foreground hover:text-brand-orange font-medium hover:underline",
                    )}
                    title={row.subtask.name}
                  >
                    {row.subtask.name}
                  </button>
                </div>

                {/* Right: Assignee Avatar + Status Lozenge / Selector + Due Date + Edit */}
                <div className="flex shrink-0 items-center gap-2">
                  {/* Assignee Avatar */}
                  <div
                    title={`${t("tasks.subtasks.assignee")}: ${row.assigneeName || t("tasks.subtasks.unassigned", "Chưa phân công")}`}
                    className="flex items-center"
                  >
                    <JiraAssigneeAvatar name={row.assigneeName} />
                  </div>

                  {/* Status: interactive Jira lozenge selector if allowed */}
                  {row.allowedStatuses.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={t("tasks.subtasks.changeStatus", {
                            name: row.subtask.name,
                          })}
                          disabled={change.isPending || isRowLoading}
                          className="h-8 gap-1 rounded-full px-1.5"
                        >
                          <JiraStatusLozenge
                            status={row.subtask.status}
                            label={statusLabel(row.subtask.status)}
                          />
                          <ChevronDown
                            className="text-muted-foreground size-3.5"
                            aria-hidden
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem disabled className="justify-between">
                          <JiraStatusLozenge
                            status={row.subtask.status}
                            label={statusLabel(row.subtask.status)}
                          />
                          <Check className="size-3.5" aria-hidden />
                        </DropdownMenuItem>
                        {row.allowedStatuses.map((option) => (
                          <DropdownMenuItem
                            key={option}
                            onSelect={() =>
                              change.mutate({
                                id: row.subtask.id,
                                status: option,
                              })
                            }
                          >
                            <JiraStatusLozenge
                              status={option}
                              label={statusLabel(option)}
                            />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <JiraStatusLozenge
                      status={row.subtask.status}
                      label={statusLabel(row.subtask.status)}
                    />
                  )}

                  {/* Due Date with Overdue check */}
                  <JiraSubtaskDueDate
                    dueDate={row.subtask.dueDate}
                    isDone={isDone}
                  />

                  {/* Edit action */}
                  {query.data?.canManage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setDraft({
                          id: row.subtask.id,
                          name: row.subtask.name,
                          assigneeId: row.subtask.assigneeId,
                          supervisorOverrideId:
                            row.subtask.supervisorOverrideId,
                          dueDate: localDate(row.subtask.dueDate),
                        })
                      }
                      className="text-muted-foreground hover:text-brand-orange h-6 w-6 shrink-0 cursor-pointer p-0 opacity-70 transition-opacity group-hover:opacity-100"
                      title={t("tasks.subtasks.edit", "Chỉnh sửa")}
                    >
                      <Edit2 className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Jira Standard 1-Line Inline Subtask Creator */}
      {isCreating && query.data?.canManage && (
        <JiraInlineSubtaskCreator
          parentAssigneeId={query.data?.parentAssigneeId}
          parentAssigneeName={query.data?.parentAssigneeName}
          parentDueDate={parentDueDate || query.data?.parentDueDate}
          members={query.data?.members || []}
          isLoading={change.isPending}
          onSubmit={(details) => {
            change.mutate({ details });
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Inline Edit Subtask Form */}
      {draft && draft.id && query.data?.canManage && (
        <form
          onSubmit={save}
          className="border-border/80 bg-muted/20 space-y-3 overflow-x-hidden rounded-lg border p-3.5 shadow-2xs"
        >
          <div className="border-border/40 flex items-center justify-between border-b pb-2">
            <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
              <JiraSubtaskIcon />
              <span>{t("tasks.subtasks.edit", "Chỉnh sửa subtask")}</span>
            </span>
          </div>

          <Input
            required
            autoFocus
            maxLength={255}
            label={t("tasks.subtasks.name", "Tên subtask")}
            value={draft.name}
            placeholder={t("tasks.subtasks.example", "VD: Chuẩn bị nội dung")}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-xs">
              <span className="text-muted-foreground font-medium">
                {t("tasks.subtasks.assignee")}
              </span>
              <Select
                required
                value={draft.assigneeId}
                onChange={(event) =>
                  setDraft({ ...draft, assigneeId: event.target.value })
                }
                className="w-full text-xs"
              >
                <option value="" disabled>
                  {t("tasks.subtasks.selectMember", "Chọn thành viên...")}
                </option>
                {query.data.members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.displayName}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="text-muted-foreground font-medium">
                {t("tasks.subtasks.supervisor")}
              </span>
              <Select
                value={selectedSupervisor}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    supervisorOverrideId: event.target.value,
                  })
                }
                className="w-full text-xs"
              >
                <option value="" disabled>
                  {t("tasks.subtasks.selectMember")}
                </option>
                {query.data.members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.displayName}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <Input
            required
            type="datetime-local"
            label={t("tasks.subtasks.deadline", "Hạn hoàn thành")}
            value={draft.dueDate}
            onChange={(event) =>
              setDraft({ ...draft, dueDate: event.target.value })
            }
          />

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={change.isPending}
              className="h-7 cursor-pointer gap-1.5 px-3 text-xs"
            >
              {change.isPending && <Loader2 className="size-3 animate-spin" />}
              <span>{t("tasks.subtasks.save", "Lưu subtask")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={change.isPending}
              onClick={() => setDraft(null)}
              className="h-7 cursor-pointer px-3 text-xs"
            >
              {t("tasks.subtasks.dismiss", "Hủy")}
            </Button>
          </div>
        </form>
      )}

      {/* Mutation Error */}
      {change.isError && (
        <p role="alert" className="text-destructive text-xs">
          {t(
            "tasks.subtasks.error",
            "Không thể cập nhật subtask. Thử lại sau.",
          )}
        </p>
      )}
    </section>
  );
}
