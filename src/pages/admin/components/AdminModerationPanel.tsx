import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertTriangle, Copyright, Flag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { errorCode } from "@/services/adminRevenueService";
import type { StrikeLevel } from "@/services/adminAccountService";
import {
  adminModerationService,
  type ModerationItem,
  type ModerationSource,
  type ModerationStatus,
} from "@/services/adminModerationService";

const STATUSES: ModerationStatus[] = ["PENDING", "APPROVED", "BLOCKED"];
const SOURCES: ModerationSource[] = [
  "FLAGGED_AUTHOR",
  "COMPLIANCE",
  "COPYRIGHT",
];
const SOURCE_ICON = {
  FLAGGED_AUTHOR: Flag,
  COMPLIANCE: AlertTriangle,
  COPYRIGHT: Copyright,
};
const field =
  "border-input bg-card text-foreground focus-visible:outline-ring h-9 rounded-lg border px-3 text-xs focus-visible:outline-2";

export function AdminModerationPanel() {
  const { t, i18n } = useTranslation();
  const actor = useAuthStore((s) => s.user?.id);
  const [status, setStatus] = useState<ModerationStatus>("PENDING");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [open, setOpen] = useState<{ id: string; block: boolean } | null>(null);
  const filter = { status, source, page, size };
  const list = useQuery({
    queryKey: ["admin-moderation", actor, filter],
    queryFn: () => adminModerationService.list(filter),
    retry: false,
    placeholderData: (previous) => previous,
  });
  const data = list.data;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;
  const time = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));

  return (
    <div className="space-y-5">
      <section className="bg-card border-border flex flex-wrap items-center gap-3 rounded-xl border p-3">
        <div
          role="group"
          aria-label={t("admin.moderation.statusLabel")}
          className="bg-muted/60 border-border flex rounded-lg border p-1"
        >
          {STATUSES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
              className={cn(
                "focus-visible:outline-ring rounded-md px-3 py-1.5 text-xs transition-colors focus-visible:outline-2",
                status === value
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`admin.moderation.status.${value}`)}
              {value === "PENDING" && data ? ` (${data.pendingTotal})` : ""}
            </button>
          ))}
        </div>
        <select
          aria-label={t("admin.moderation.sourceLabel")}
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setPage(1);
          }}
          className={field}
        >
          <option value="">{t("admin.moderation.allSources")}</option>
          {SOURCES.map((value) => (
            <option key={value} value={value}>
              {t(`admin.moderation.sources.${value}`)}
            </option>
          ))}
        </select>
        {data && (
          <p className="text-muted-foreground ml-auto font-mono text-xs">
            {t("admin.moderation.processedToday", {
              count: data.processedToday,
            })}
          </p>
        )}
      </section>

      {list.isPending && <Skeleton className="h-60 rounded-xl" />}
      {list.isError && (
        <div
          role="alert"
          className="border-destructive/25 bg-destructive/5 flex items-center justify-between gap-3 rounded-xl border p-4 text-sm"
        >
          <p>{t("admin.moderation.error")}</p>
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
        <section className="bg-card border-border flex flex-col items-center gap-3 rounded-xl border px-6 py-14 text-center">
          <span className="bg-success/10 text-success rounded-full p-3">
            <ShieldCheck className="size-6" />
          </span>
          <p className="text-muted-foreground max-w-md text-sm">
            {t(`admin.moderation.empty.${status}`)}
          </p>
        </section>
      )}
      {data && data.items.length > 0 && (
        <ul className="space-y-3">
          {data.items.map((item) => {
            const Icon = SOURCE_ICON[item.source];
            return (
              <li
                key={item.id}
                className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-lg",
                    item.source === "FLAGGED_AUTHOR"
                      ? "bg-brand-orange-soft text-brand-orange"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-orange-soft text-brand-orange rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold">
                      {t(`admin.moderation.sources.${item.source}`)}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      v{item.contentVersion}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 font-semibold">
                    {item.captionPreview || t("admin.moderation.noCaption")}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {t("admin.moderation.author")}:{" "}
                    <span className="text-foreground font-medium">
                      {item.authorName}
                    </span>{" "}
                    <StrikeCounts item={item} />
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    <span className="bg-destructive/10 text-destructive rounded px-1">
                      {item.reason}
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-1 font-mono text-[11px]">
                    {item.status === "PENDING"
                      ? t("admin.moderation.flaggedAt", {
                          time: time(item.createdAt),
                        })
                      : t("admin.moderation.reviewedAt", {
                          time: time(item.reviewedAt!),
                          name: item.reviewedByName,
                        })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen({ id: item.id, block: false })}
                  >
                    {t(
                      item.status === "PENDING"
                        ? "admin.moderation.review"
                        : "admin.moderation.view",
                    )}
                  </Button>
                  {item.status === "PENDING" && (
                    <Button
                      className="bg-destructive hover:bg-destructive/90 text-white"
                      onClick={() => setOpen({ id: item.id, block: true })}
                    >
                      {t("admin.moderation.quickBlock")}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {data && data.total > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          <select
            aria-label={t("admin.moderation.pageSize")}
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
            className={field}
          >
            {[10, 20, 50].map((value) => (
              <option key={value} value={value}>
                {t("admin.moderation.perPage", { count: value })}
              </option>
            ))}
          </select>
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
      {open && (
        <ModerationDialog
          id={open.id}
          startBlocking={open.block}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function StrikeCounts({ item }: { item: ModerationItem }) {
  const { t } = useTranslation();
  return (
    <span
      className="ml-1 inline-flex gap-1 align-middle font-mono text-[11px]"
      aria-label={t("admin.moderation.strikes")}
    >
      <span className="rounded bg-yellow-400/20 px-1 text-yellow-700 dark:text-yellow-300">
        Y{item.yellow}
      </span>
      <span className="bg-brand-orange-soft text-brand-orange rounded px-1">
        O{item.orange}
      </span>
      <span className="bg-destructive/10 text-destructive rounded px-1">
        R{item.red}
      </span>
    </span>
  );
}

function ModerationDialog({
  id,
  startBlocking,
  onClose,
}: {
  id: string;
  startBlocking: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const [note, setNote] = useState("");
  const [blocking, setBlocking] = useState(startBlocking);
  const [level, setLevel] = useState<StrikeLevel>("YELLOW");
  const detail = useQuery({
    queryKey: ["admin-moderation-item", id],
    queryFn: () => adminModerationService.detail(id),
    retry: false,
  });
  const item = detail.data;
  const decide = useMutation({
    mutationFn: (decision: "APPROVE" | "BLOCK") =>
      adminModerationService.decide(id, {
        decision,
        note: note.trim(),
        strikeLevel: decision === "BLOCK" ? level : undefined,
        rowVersion: item!.rowVersion,
      }),
    onSuccess: (_, decision) => {
      toast.success(
        t(
          decision === "APPROVE"
            ? "admin.moderation.approved"
            : "admin.moderation.blocked",
        ),
      );
      void client.invalidateQueries({ queryKey: ["admin-moderation"] });
      void client.invalidateQueries({ queryKey: ["admin-statistics"] });
      onClose();
    },
  });
  const code = errorCode(decide.error);
  const outdated =
    item &&
    item.currentVersion !== null &&
    item.currentVersion !== item.contentVersion;
  const pending = item?.status === "PENDING" && !outdated;
  const length = note.trim().length;

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("admin.moderation.dialogTitle", {
              version: item?.contentVersion ?? "",
            })}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {item?.postId}
          </DialogDescription>
        </DialogHeader>
        {detail.isPending && <Skeleton className="h-48 rounded-lg" />}
        {detail.isError && (
          <p role="alert" className="text-destructive text-sm">
            {t("admin.moderation.notFound")}
          </p>
        )}
        {item && (
          <div className="space-y-5">
            <section className="bg-muted/40 rounded-lg p-4">
              <p className="text-muted-foreground text-2xs font-mono tracking-wider uppercase">
                {t("admin.moderation.snapshot")}
              </p>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                {item.snapshot?.contentText || t("admin.moderation.noCaption")}
              </p>
              {item.snapshot && item.snapshot.hashtags.length > 0 && (
                <p className="text-brand-orange mt-2 text-xs">
                  {item.snapshot.hashtags.join(" ")}
                </p>
              )}
              {item.snapshot && item.snapshot.media.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {item.snapshot.media.map((m, i) => (
                    <li key={i} className="text-muted-foreground font-mono">
                      {m.media_type ?? "MEDIA"}: {m.external_url ?? m.s3_key}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-muted-foreground mt-3 text-xs">
                {t("admin.moderation.author")}:{" "}
                <span className="text-foreground font-medium">
                  {item.authorName}
                </span>{" "}
                ({item.authorEmail}) <StrikeCounts item={item} />
                {item.snapshot &&
                  item.snapshot.targetPlatforms.length > 0 &&
                  `, ${item.snapshot.targetPlatforms.join(", ")}`}
              </p>
              {item.snapshot && (
                <p
                  className="text-muted-foreground mt-1 truncate font-mono text-[11px]"
                  title={item.snapshot.contentHash}
                >
                  SHA-256 {item.snapshot.contentHash.slice(0, 16)}…,{" "}
                  {new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(item.snapshot.capturedAt))}
                </p>
              )}
            </section>
            <section>
              <p className="text-destructive text-2xs font-mono tracking-wider uppercase">
                {t(`admin.moderation.sources.${item.source}`)}
              </p>
              <p className="border-destructive/25 bg-destructive/5 mt-2 rounded-lg border p-3 text-sm">
                {item.reason}
              </p>
            </section>
            {outdated && (
              <p
                role="status"
                className="bg-brand-orange-soft text-brand-orange rounded-lg p-3 text-sm"
              >
                {t("admin.moderation.outdated", {
                  current: item.currentVersion,
                })}
              </p>
            )}
            {item.status !== "PENDING" && (
              <section className="border-border rounded-lg border p-4 text-sm">
                <p className="font-semibold">
                  {t(`admin.moderation.status.${item.status}`)}
                  {item.strikeLevel &&
                    ` — ${t(`admin.level.${item.strikeLevel}`)}`}
                </p>
                <p className="text-muted-foreground mt-1">
                  {item.decisionNote}
                </p>
              </section>
            )}
            {pending && (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {blocking && (
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">
                      {t("admin.moderation.strikeLevel")}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {(["YELLOW", "ORANGE", "RED"] as const).map((value) => (
                        <label
                          key={value}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                            level === value
                              ? "border-destructive bg-destructive/5"
                              : "border-border",
                          )}
                        >
                          <input
                            type="radio"
                            name="level"
                            checked={level === value}
                            onChange={() => setLevel(value)}
                            className="accent-destructive"
                          />
                          {t(`admin.level.${value}`)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                <label className="block space-y-1.5 text-sm font-medium">
                  <span>
                    {t(
                      blocking
                        ? "admin.moderation.blockReason"
                        : "admin.moderation.approveNote",
                    )}{" "}
                    *
                  </span>
                  <Textarea
                    value={note}
                    rows={3}
                    maxLength={2000}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <span className="text-muted-foreground flex justify-between text-xs font-normal">
                    <span>
                      {t(
                        blocking
                          ? "admin.moderation.blockHint"
                          : "admin.moderation.noteHint",
                      )}
                    </span>
                    <span className="font-mono">{length}/2000</span>
                  </span>
                </label>
                {decide.isError && (
                  <p role="alert" className="text-destructive text-sm">
                    {t(
                      code === "MODERATION_NOTE_TOO_SHORT"
                        ? "admin.moderation.noteTooShort"
                        : code === "ADMIN_STATE_CONFLICT"
                          ? "admin.moderation.conflict"
                          : code === "FORBIDDEN"
                            ? "admin.moderation.forbiddenTarget"
                            : "admin.moderation.error",
                    )}
                  </p>
                )}
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    {t("admin.notifications.close")}
                  </Button>
                  {blocking ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBlocking(false)}
                      >
                        {t("admin.moderation.backToReview")}
                      </Button>
                      <Button
                        type="button"
                        className="bg-destructive hover:bg-destructive/90 text-white"
                        disabled={length < 3 || decide.isPending}
                        onClick={() => decide.mutate("BLOCK")}
                      >
                        {t("admin.moderation.confirmBlock")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        className="bg-destructive hover:bg-destructive/90 text-white"
                        onClick={() => setBlocking(true)}
                      >
                        {t("admin.moderation.blockAction")}
                      </Button>
                      <Button
                        type="button"
                        className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                        disabled={length < 10 || decide.isPending}
                        onClick={() => decide.mutate("APPROVE")}
                      >
                        {t("admin.moderation.approveAction")}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
