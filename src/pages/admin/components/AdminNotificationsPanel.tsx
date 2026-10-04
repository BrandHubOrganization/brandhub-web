import { useEffect, useState } from "react";
import { SelectMenu } from "@/components/ui/select-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Mail, Pencil, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  adminNotificationService,
  type AdminNotification,
  type NotificationRequest,
  type NotificationStatus,
  type NotificationType,
  type TargetType,
} from "@/services/adminNotificationService";
import { errorCode } from "@/services/adminRevenueService";

const TYPES: NotificationType[] = [
  "SYSTEM",
  "MAINTENANCE",
  "UPDATE",
  "PROMOTION",
];
const TARGETS: TargetType[] = ["ALL", "BY_PLAN", "BY_ROLE"];
const EDITABLE: NotificationStatus[] = ["DRAFT", "SCHEDULED"];
const STATUS_STYLE: Record<NotificationStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-brand-orange-soft text-brand-orange",
  SENDING: "bg-brand-orange-soft text-brand-orange",
  SENT: "bg-success/15 text-success",
  FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground line-through",
};

/** datetime-local value in the browser zone <-> ISO instant with offset. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function AdminNotificationsPanel() {
  const { t, i18n } = useTranslation();
  const actor = useAuthStore((s) => s.user?.id);
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminNotification | "new" | null>(
    null,
  );
  const list = useQuery({
    queryKey: ["admin-notifications", actor, page],
    queryFn: () => adminNotificationService.list(page),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.items.some(
        (n) => n.status === "SCHEDULED" || n.status === "SENDING",
      )
        ? 10000
        : false,
  });
  const cancel = useMutation({
    mutationFn: (n: AdminNotification) =>
      adminNotificationService.cancel(n.id, n.rowVersion),
    onSuccess: () => {
      toast.success(t("admin.notifications.cancelled"));
      void client.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (error) =>
      toast.error(
        t(
          errorCode(error) === "ADMIN_STATE_CONFLICT"
            ? "admin.notifications.conflict"
            : "admin.notifications.error",
        ),
      ),
  });
  const time = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(iso))
      : "—";
  const data = list.data;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button
          className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          onClick={() => setEditing("new")}
        >
          <Send className="size-4" />
          {t("admin.notifications.compose")}
        </Button>
      </div>
      <section className="bg-card border-border min-w-0 rounded-xl border p-5 lg:p-6">
        <h2 className="text-base font-semibold">
          {t("admin.notifications.historyTitle")}
        </h2>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          {t("admin.notifications.historyHint")}
        </p>
        {list.isPending && <Skeleton className="mt-5 h-48 rounded-lg" />}
        {list.isError && (
          <div
            role="alert"
            className="mt-5 flex items-center justify-between gap-3 text-sm"
          >
            <p>{t("admin.notifications.error")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void list.refetch()}
            >
              {t("admin.overview.retry")}
            </Button>
          </div>
        )}
        {data && data.items.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <span className="bg-muted text-muted-foreground rounded-full p-3">
              <Mail className="size-5" />
            </span>
            <p className="text-muted-foreground max-w-sm text-sm">
              {t("admin.notifications.empty")}
            </p>
          </div>
        )}
        {data && data.items.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground text-xs">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("admin.notifications.title")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("admin.notifications.audience")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("admin.revenue.status")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("admin.notifications.when")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("admin.notifications.recipients")}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">
                      {t("admin.notifications.edit")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((n) => (
                  <tr
                    key={n.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="max-w-80 px-4 py-3">
                      <p className="truncate font-medium">{n.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {t(`admin.notifications.types.${n.type}`)},{" "}
                        {n.createdByName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {t(`admin.notifications.targets.${n.targetType}`)}
                      {n.targetValues.length > 0 && (
                        <span className="text-muted-foreground block font-mono">
                          {n.targetValues.join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold",
                          STATUS_STYLE[n.status],
                        )}
                      >
                        {t(`admin.notifications.status.${n.status}`)}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                      {time(n.sentAt ?? n.scheduledAt)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-mono font-semibold">
                        {n.recipientCount ?? "—"}
                      </span>
                      {n.recipientCount != null && n.recipientCount > 0 && (
                        <span className="text-muted-foreground block">
                          {t("admin.notifications.delivery", {
                            delivered: n.delivered,
                            failed: n.failed,
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {EDITABLE.includes(n.status) && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(n)}
                          >
                            <Pencil className="size-3.5" />
                            {t("admin.notifications.edit")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            disabled={cancel.isPending}
                            onClick={() =>
                              window.confirm(
                                t("admin.notifications.cancelConfirm"),
                              ) && cancel.mutate(n)
                            }
                          >
                            <X className="size-3.5" />
                            {t("admin.notifications.cancel")}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && pages > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("admin.accounts.previous")}
            </Button>
            <span className="font-mono">
              {page}/{pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("admin.accounts.next")}
            </Button>
          </div>
        )}
      </section>
      {editing && (
        <NotificationComposer
          notification={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function NotificationComposer({
  notification,
  onClose,
}: {
  notification: AdminNotification | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [title, setTitle] = useState(notification?.title ?? "");
  const [content, setContent] = useState(notification?.content ?? "");
  const [type, setType] = useState<NotificationType>(
    notification?.type ?? "SYSTEM",
  );
  const [targetType, setTargetType] = useState<TargetType>(
    notification?.targetType ?? "ALL",
  );
  const [targetValues, setTargetValues] = useState<string[]>(
    notification?.targetValues ?? [],
  );
  const [actionUrl, setActionUrl] = useState(notification?.actionUrl ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    toLocalInput(notification?.scheduledAt ?? null),
  );
  const [estimateKey, setEstimateKey] = useState({ targetType, targetValues });
  useEffect(() => {
    const id = setTimeout(
      () => setEstimateKey({ targetType, targetValues }),
      300,
    );
    return () => clearTimeout(id);
  }, [targetType, targetValues]);
  const plans = useQuery({
    queryKey: ["admin-plan-catalog"],
    queryFn: adminNotificationService.plans,
    staleTime: 300000,
  });
  const needsValues = estimateKey.targetType !== "ALL";
  const estimate = useQuery({
    queryKey: ["admin-audience", estimateKey],
    queryFn: () =>
      adminNotificationService.estimate(
        estimateKey.targetType,
        estimateKey.targetValues,
      ),
    enabled: !needsValues || estimateKey.targetValues.length > 0,
    retry: false,
  });
  const save = useMutation({
    mutationFn: (action: NotificationRequest["action"]) =>
      adminNotificationService.save(
        {
          title: title.trim(),
          content: content.trim(),
          type,
          targetType,
          targetValues: targetType === "ALL" ? [] : targetValues,
          actionUrl: actionUrl.trim() || null,
          scheduledAt:
            action === "SCHEDULE" || (action === "DRAFT" && scheduledAt)
              ? new Date(scheduledAt).toISOString()
              : null,
          action,
          rowVersion: notification?.rowVersion,
        },
        notification?.id,
      ),
    onSuccess: (_, action) => {
      toast.success(
        t(
          action === "DRAFT"
            ? "admin.notifications.saved"
            : action === "SCHEDULE"
              ? "admin.notifications.scheduled"
              : "admin.notifications.sent",
        ),
      );
      void client.invalidateQueries({ queryKey: ["admin-notifications"] });
      onClose();
    },
  });
  const code = errorCode(save.error);
  const trimmedTitle = title.trim().length;
  const trimmedContent = content.trim().length;
  // Name the exact field that blocks sending (a 9-character message used to show a generic hint).
  const titleError =
    title !== "" && trimmedTitle < 5
      ? t("admin.notifications.titleShort", { count: trimmedTitle })
      : null;
  const contentError =
    content !== "" && trimmedContent < 10
      ? t("admin.notifications.contentShort", {
          count: trimmedContent,
          missing: 10 - trimmedContent,
        })
      : null;
  const invalid =
    trimmedTitle < 5 ||
    trimmedTitle > 200 ||
    trimmedContent < 10 ||
    trimmedContent > 5000 ||
    (targetType !== "ALL" && targetValues.length === 0);
  const options =
    targetType === "BY_PLAN"
      ? (plans.data ?? []).map((p) => ({ value: p.name, label: p.displayName }))
      : [
          { value: "ADMIN", label: t("admin.notifications.roles.ADMIN") },
          { value: "USER", label: t("admin.notifications.roles.USER") },
        ];
  const toggle = (value: string) =>
    setTargetValues((values) =>
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t(
              notification
                ? "admin.notifications.editTitle"
                : "admin.notifications.compose",
            )}
          </DialogTitle>
          <DialogDescription>
            {t("admin.notifications.channel")}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{t("admin.notifications.title")} *</span>
            <Input
              value={title}
              maxLength={200}
              aria-invalid={!!titleError}
              className={cn(titleError && "border-destructive")}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="flex justify-between text-xs font-normal">
              <span
                className={
                  titleError ? "text-destructive" : "text-muted-foreground"
                }
              >
                {titleError ?? t("admin.notifications.titleHint")}
              </span>
              <span className="text-muted-foreground font-mono">
                {trimmedTitle}/200
              </span>
            </span>
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{t("admin.notifications.content")} *</span>
            <Textarea
              value={content}
              rows={5}
              maxLength={5000}
              aria-invalid={!!contentError}
              className={cn(contentError && "border-destructive")}
              onChange={(e) => setContent(e.target.value)}
            />
            <span className="flex justify-between text-xs font-normal">
              <span
                className={
                  contentError ? "text-destructive" : "text-muted-foreground"
                }
              >
                {contentError ?? t("admin.notifications.contentHint")}
              </span>
              <span
                className={cn(
                  "font-mono",
                  contentError ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {trimmedContent}/5000
              </span>
            </span>
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{t("admin.notifications.type")}</span>
            <SelectMenu
              className="h-9 w-full text-sm"
              ariaLabel={t("admin.notifications.type")}
              value={type}
              onChange={(value) => setType(value as NotificationType)}
              options={TYPES.map((value) => ({
                value,
                label: t(`admin.notifications.types.${value}`),
              }))}
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">
              {t("admin.notifications.audience")}
            </legend>
            {TARGETS.map((value) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  targetType === value
                    ? "border-brand-orange bg-brand-orange-soft/60"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <input
                  type="radio"
                  name="target"
                  checked={targetType === value}
                  onChange={() => {
                    setTargetType(value);
                    setTargetValues([]);
                  }}
                  className="accent-brand-orange mt-1"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {t(`admin.notifications.targets.${value}`)}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                    {t(`admin.notifications.targetHints.${value}`)}
                  </span>
                  {targetType === value && value !== "ALL" && (
                    <span className="mt-2 flex flex-wrap gap-2">
                      {options.map((option) => (
                        <label
                          key={option.value}
                          className="bg-card border-border flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={targetValues.includes(option.value)}
                            onChange={() => toggle(option.value)}
                            className="accent-brand-orange"
                          />
                          {option.label}
                        </label>
                      ))}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </fieldset>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{t("admin.notifications.actionUrl")}</span>
            <Input
              type="url"
              value={actionUrl}
              placeholder="https://"
              onChange={(e) => setActionUrl(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{t("admin.notifications.schedule")}</span>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <span className="text-muted-foreground block text-xs font-normal">
              {t("admin.notifications.scheduleHint", {
                zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })}
            </span>
          </label>
          <div className="bg-muted/50 border-brand-orange rounded-r-lg border-l-4 px-4 py-3 text-xs leading-5">
            {needsValues && estimateKey.targetValues.length === 0
              ? t("admin.notifications.targetRequired")
              : t("admin.notifications.estimate", {
                  count: estimate.data ?? 0,
                })}
          </div>
          {save.isError && (
            <p role="alert" className="text-destructive text-sm">
              {t(
                code === "NOTIFICATION_SCHEDULE_INVALID"
                  ? "admin.notifications.schedulePast"
                  : code === "VALIDATION_ERROR"
                    ? "admin.notifications.length"
                    : code === "ADMIN_STATE_CONFLICT"
                      ? "admin.notifications.conflict"
                      : "admin.notifications.error",
              )}
            </p>
          )}
          {invalid && (
            <ul className="text-muted-foreground list-inside list-disc text-xs leading-5">
              {(title.trim() === "" || content.trim() === "") && (
                <li>{t("admin.notifications.required")}</li>
              )}
              {titleError && <li>{titleError}</li>}
              {contentError && <li>{contentError}</li>}
              {targetType !== "ALL" && targetValues.length === 0 && (
                <li>{t("admin.notifications.targetRequired")}</li>
              )}
            </ul>
          )}
          {!invalid && !scheduledAt && (
            <p className="text-muted-foreground text-xs">
              {t("admin.notifications.scheduleNeedsTime")}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={invalid || save.isPending}
              onClick={() => save.mutate("DRAFT")}
            >
              {t("admin.notifications.saveDraft")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={invalid || !scheduledAt || save.isPending}
              onClick={() => save.mutate("SCHEDULE")}
            >
              {t("admin.notifications.scheduleSend")}
            </Button>
            <Button
              type="button"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              disabled={invalid || save.isPending}
              onClick={() => save.mutate("SEND_NOW")}
            >
              <Send className="size-4" />
              {t("admin.notifications.sendNow")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
