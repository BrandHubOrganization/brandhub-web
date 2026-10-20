import { useState } from "react";
import { SelectMenu } from "@/components/ui/select-menu";
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
import {
  adminAccountService,
  type StrikeLevel,
} from "@/services/adminAccountService";
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
        <SelectMenu
          ariaLabel={t("admin.moderation.sourceLabel")}
          value={source}
          onChange={(value) => {
            setSource(value);
            setPage(1);
          }}
          options={[
            { value: "", label: t("admin.moderation.allSources") },
            ...SOURCES.map((value) => ({
              value,
              label: t(`admin.moderation.sources.${value}`),
            })),
          ]}
        />
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
          <SelectMenu
            ariaLabel={t("admin.moderation.pageSize")}
            value={String(size)}
            onChange={(value) => {
              setSize(Number(value));
              setPage(1);
            }}
            options={[10, 20, 50].map((value) => ({
              value: String(value),
              label: t("admin.moderation.perPage", { count: value }),
            }))}
          />
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

const LEVEL_CHIP: Record<StrikeLevel, string> = {
  YELLOW: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300",
  ORANGE: "bg-brand-orange-soft text-brand-orange",
  RED: "bg-destructive/10 text-destructive",
};

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
  const [choice, setChoice] = useState<"APPROVE" | "BLOCK" | null>(
    startBlocking ? "BLOCK" : null,
  );
  const [level, setLevel] = useState<StrikeLevel>("YELLOW");
  const detail = useQuery({
    queryKey: ["admin-moderation-item", id],
    queryFn: () => adminModerationService.detail(id),
    retry: false,
  });
  const item = detail.data;
  // Why a FLAGGED author's post is here: the author's own live strikes (the post itself is not accused).
  const strikes = useQuery({
    queryKey: ["admin-strikes-for-moderation", item?.authorId],
    queryFn: () => adminAccountService.history(item!.authorId, 1),
    enabled: !!item,
    retry: false,
  });
  const liveStrikes = (strikes.data?.items ?? []).filter(
    (s) => s.state === "ACTIVE",
  );
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
  const when = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  const canSubmit =
    choice === "APPROVE"
      ? length >= 10
      : choice === "BLOCK"
        ? length >= 3
        : false;

  return (
    <Dialog
      open
      onOpenChange={(value) => !value && !decide.isPending && onClose()}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("admin.moderation.dialogHeading")}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {item && (
                <>
                  <span className="bg-brand-orange-soft text-brand-orange rounded px-1.5 py-0.5 font-mono font-semibold">
                    {t(`admin.moderation.sources.${item.source}`)}
                  </span>
                  <span className="bg-muted rounded px-1.5 py-0.5 font-mono">
                    {t("admin.moderation.versionLabel", {
                      version: item.contentVersion,
                    })}
                  </span>
                  <span className="bg-muted rounded px-1.5 py-0.5">
                    {t(`admin.moderation.status.${item.status}`)}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {item.postId}
                  </span>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        {detail.isPending && <Skeleton className="h-64 rounded-lg" />}
        {detail.isError && (
          <p role="alert" className="text-destructive text-sm">
            {t("admin.moderation.notFound")}
          </p>
        )}
        {item && (
          <div className="space-y-5">
            <section
              className={cn(
                "rounded-xl border p-4",
                item.source === "FLAGGED_AUTHOR"
                  ? "border-brand-orange/30 bg-brand-orange-soft/50"
                  : "border-destructive/25 bg-destructive/5",
              )}
            >
              <h3
                className={cn(
                  "text-sm font-semibold",
                  item.source === "FLAGGED_AUTHOR"
                    ? "text-brand-orange"
                    : "text-destructive",
                )}
              >
                {t(`admin.moderation.why.${item.source}.title`)}
              </h3>
              <p className="mt-1 text-sm leading-6">
                {t(`admin.moderation.why.${item.source}.body`)}
              </p>
              {item.source === "FLAGGED_AUTHOR" ? (
                <div className="mt-3">
                  <p className="text-muted-foreground text-xs font-medium">
                    {t("admin.moderation.authorViolations")}
                  </p>
                  {strikes.isPending && (
                    <Skeleton className="mt-2 h-14 rounded-lg" />
                  )}
                  {strikes.data && liveStrikes.length === 0 && (
                    <p className="mt-2 text-sm">
                      {t("admin.moderation.noLiveStrikes")}
                    </p>
                  )}
                  <ul className="mt-2 space-y-2">
                    {liveStrikes.map((strike) => (
                      <li
                        key={strike.id}
                        className="bg-card border-border rounded-lg border p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold",
                              LEVEL_CHIP[strike.level],
                            )}
                          >
                            {t(`admin.level.${strike.level}`)}
                          </span>
                          <span className="font-medium">{strike.category}</span>
                          <span className="text-muted-foreground ml-auto font-mono text-[11px]">
                            {when(strike.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 leading-6">{strike.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <blockquote className="bg-card border-destructive mt-3 rounded-r-lg border-l-4 px-3 py-2 text-sm leading-6">
                  {item.reason}
                </blockquote>
              )}
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

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <section className="border-border rounded-xl border">
                <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                  <h3 className="text-sm font-semibold">
                    {t("admin.moderation.postPreview")}
                  </h3>
                  <div className="flex gap-1">
                    {(item.snapshot?.targetPlatforms ?? []).map((platform) => (
                      <span
                        key={platform}
                        className="bg-muted rounded px-1.5 py-0.5 font-mono text-[11px]"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <p className="text-sm leading-6 whitespace-pre-wrap">
                    {item.snapshot?.contentText ||
                      t("admin.moderation.noCaption")}
                  </p>
                  {item.snapshot && item.snapshot.hashtags.length > 0 && (
                    <p className="text-brand-orange text-sm">
                      {item.snapshot.hashtags.join(" ")}
                    </p>
                  )}
                  {item.snapshot && item.snapshot.media.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {item.snapshot.media.map((media, index) =>
                        media.external_url ? (
                          <img
                            key={index}
                            src={media.external_url}
                            alt={t("admin.moderation.mediaAlt", {
                              index: index + 1,
                            })}
                            loading="lazy"
                            className="bg-muted aspect-square w-full rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            key={index}
                            className="bg-muted text-muted-foreground grid aspect-square place-items-center rounded-lg p-2 text-center font-mono text-[11px] break-all"
                          >
                            {media.media_type}: {media.s3_key}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                  {item.snapshot && (
                    <p
                      className="text-muted-foreground font-mono text-[11px]"
                      title={item.snapshot.contentHash}
                    >
                      {t("admin.moderation.capturedAt", {
                        time: when(item.snapshot.capturedAt),
                      })}
                      , SHA-256 {item.snapshot.contentHash.slice(0, 12)}
                    </p>
                  )}
                </div>
              </section>

              <section className="border-border space-y-3 rounded-xl border p-4">
                <h3 className="text-sm font-semibold">
                  {t("admin.moderation.author")}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="bg-brand-orange/15 text-brand-orange grid size-10 shrink-0 place-items-center rounded-full font-semibold">
                    {item.authorName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.authorName}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.authorEmail}
                    </p>
                  </div>
                </div>
                <p className="text-xs">
                  {t("admin.moderation.accountStatus")}:{" "}
                  <span className="font-semibold">
                    {t(`admin.status.${item.authorStatus}`)}
                  </span>
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(
                    [
                      ["YELLOW", item.yellow, "/3"],
                      ["ORANGE", item.orange, "/3"],
                      ["RED", item.red, ""],
                    ] as const
                  ).map(([lvl, count, max]) => (
                    <div
                      key={lvl}
                      className={cn("rounded-lg px-2 py-2", LEVEL_CHIP[lvl])}
                    >
                      <p className="font-mono text-lg leading-none font-semibold">
                        {count}
                        <span className="text-xs opacity-60">{max}</span>
                      </p>
                      <p className="mt-1 text-[11px]">
                        {t(`admin.level.${lvl}`)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs leading-5">
                  {t("admin.moderation.strikeRule")}
                </p>
              </section>
            </div>

            {item.status !== "PENDING" && (
              <section className="border-border rounded-xl border p-4 text-sm">
                <p className="font-semibold">
                  {t(`admin.moderation.status.${item.status}`)}
                  {item.strikeLevel &&
                    `, ${t(`admin.level.${item.strikeLevel}`)}`}
                  {item.reviewedByName && item.reviewedAt && (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      (
                      {t("admin.moderation.reviewedAt", {
                        time: when(item.reviewedAt),
                        name: item.reviewedByName,
                      })}
                      )
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground mt-1">
                  {item.decisionNote}
                </p>
              </section>
            )}

            {pending && (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">
                    {t("admin.moderation.decisionLabel")}
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["APPROVE", "BLOCK"] as const).map((value) => (
                      <label
                        key={value}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                          choice === value
                            ? value === "APPROVE"
                              ? "border-success bg-success/10"
                              : "border-destructive bg-destructive/5"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <input
                          type="radio"
                          name="decision"
                          checked={choice === value}
                          onChange={() => setChoice(value)}
                          className={cn(
                            "mt-1",
                            value === "APPROVE"
                              ? "accent-success"
                              : "accent-destructive",
                          )}
                        />
                        <span>
                          <span className="block text-sm font-semibold">
                            {t(
                              value === "APPROVE"
                                ? "admin.moderation.approveAction"
                                : "admin.moderation.blockAction",
                            )}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                            {t(
                              value === "APPROVE"
                                ? "admin.moderation.approveHint"
                                : "admin.moderation.blockHintChoice",
                            )}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {choice === "BLOCK" && (
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">
                      {t("admin.moderation.strikeLevel")}
                    </legend>
                    <div className="flex gap-2">
                      {(["YELLOW", "ORANGE", "RED"] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={level === value}
                          onClick={() => setLevel(value)}
                          className={cn(
                            "focus-visible:outline-ring h-9 flex-1 rounded-lg border text-sm font-medium focus-visible:outline-2",
                            level === value
                              ? cn(LEVEL_CHIP[value], "border-current")
                              : "border-border text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {t(`admin.level.${value}`)}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                {choice && (
                  <label className="block space-y-1.5 text-sm font-medium">
                    <span>
                      {t(
                        choice === "BLOCK"
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
                          choice === "BLOCK"
                            ? "admin.moderation.blockHint"
                            : "admin.moderation.noteHint",
                        )}
                      </span>
                      <span className="font-mono">{length}/2000</span>
                    </span>
                  </label>
                )}
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
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    {t("admin.notifications.close")}
                  </Button>
                  {choice && (
                    <Button
                      type="button"
                      className={cn(
                        "text-white",
                        choice === "BLOCK"
                          ? "bg-destructive hover:bg-destructive/90"
                          : "bg-brand-orange hover:bg-brand-orange/90",
                      )}
                      disabled={!canSubmit || decide.isPending}
                      onClick={() => decide.mutate(choice)}
                    >
                      {t(
                        choice === "BLOCK"
                          ? "admin.moderation.confirmBlock"
                          : "admin.moderation.confirmApprove",
                      )}
                    </Button>
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
