import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ModerationNotifyAuthorDialog } from "@/pages/admin/components/ModerationNotifyAuthorDialog";
import {
  ModerationDecisionForm,
  ModerationReviewedSummary,
} from "@/pages/admin/components/moderation/ModerationDecisionForm";
import { LEVEL_CHIP } from "@/pages/admin/components/moderation/ModerationKanbanCard";
import { adminAccountService } from "@/services/adminAccountService";
import { adminModerationService } from "@/services/adminModerationService";
import type { ModerationItem } from "@/services/adminModerationService";

export interface ModerationDetailDialogProps {
  id: string;
  initialChoice: "APPROVE" | "BLOCK" | null;
  onClose: () => void;
}

function ModerationPostAndAuthorGrid({
  item,
  formatTime,
  onNotifyAuthor,
}: {
  item: ModerationItem;
  formatTime: (iso: string) => string;
  onNotifyAuthor: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <section className="border-border rounded-xl border">
        <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{t("admin.moderation.postPreview")}</h3>
          <div className="flex gap-1">
            {(item.snapshot?.targetPlatforms ?? []).map((platform) => (
              <span key={platform} className="bg-muted rounded px-1.5 py-0.5 font-sans text-xs">
                {platform}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-sm leading-6 whitespace-pre-wrap">
            {item.snapshot?.contentText || t("admin.moderation.noCaption")}
          </p>
          {item.snapshot && item.snapshot.hashtags.length > 0 && (
            <p className="text-brand-orange text-sm">{item.snapshot.hashtags.join(" ")}</p>
          )}
          {item.snapshot && item.snapshot.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {item.snapshot.media.map((media, index) =>
                media.external_url ? (
                  <img
                    key={index}
                    src={media.external_url}
                    alt={t("admin.moderation.mediaAlt", { index: index + 1 })}
                    loading="lazy"
                    className="bg-muted aspect-square w-full rounded-lg object-cover"
                  />
                ) : (
                  <div
                    key={index}
                    className="bg-muted text-muted-foreground grid aspect-square place-items-center rounded-lg p-2 text-center font-mono text-xs break-all"
                  >
                    {media.media_type}: {media.s3_key}
                  </div>
                ),
              )}
            </div>
          )}
          {item.snapshot && (
            <p className="text-muted-foreground font-mono text-xs" title={item.snapshot.contentHash}>
              {t("admin.moderation.capturedAt", { time: formatTime(item.snapshot.capturedAt) })}, SHA-256{" "}
              {item.snapshot.contentHash.slice(0, 12)}
            </p>
          )}
        </div>
      </section>

      <section className="border-border space-y-3 rounded-xl border p-4">
        <h3 className="text-sm font-semibold">{t("admin.moderation.author")}</h3>
        <div className="flex items-center gap-3">
          <span className="bg-brand-orange/15 text-brand-orange grid size-10 shrink-0 place-items-center rounded-full font-semibold">
            {item.authorName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{item.authorName}</p>
            <p className="text-muted-foreground truncate text-xs">{item.authorEmail}</p>
          </div>
        </div>
        <p className="text-xs">
          {t("admin.moderation.accountStatus")}:{" "}
          <span className="font-semibold">{t(`admin.status.${item.authorStatus}`)}</span>
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(
            [
              ["YELLOW", item.yellow, "/3"],
              ["ORANGE", item.orange, "/3"],
              ["RED", item.red, ""],
            ] as const
          ).map(([lvl, count, max]) => (
            <div key={lvl} className={cn("rounded-lg px-2 py-2", LEVEL_CHIP[lvl])}>
              <p className="font-sans text-lg leading-none font-semibold">
                {count}
                <span className="text-xs opacity-60">{max}</span>
              </p>
              <p className="mt-1 text-xs">{t(`admin.level.${lvl}`)}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-xs leading-5">{t("admin.moderation.strikeRule")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNotifyAuthor}
          className="text-brand-orange border-brand-orange/40 hover:bg-brand-orange-soft hover:text-brand-orange w-full gap-2 text-xs font-semibold"
        >
          <BellRing className="size-3.5" />
          <span>{t("admin.moderation.notifyAuthorAction")}</span>
        </Button>
      </section>
    </div>
  );
}

export function ModerationDetailDialog({ id, initialChoice, onClose }: ModerationDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const [notifyOpen, setNotifyOpen] = useState(false);

  const detail = useQuery({
    queryKey: ["admin-moderation-item", id],
    queryFn: () => adminModerationService.detail(id),
    retry: false,
  });
  const item = detail.data;

  const strikes = useQuery({
    queryKey: ["admin-strikes-for-moderation", item?.authorId],
    queryFn: () => adminAccountService.history(item!.authorId, 1),
    enabled: !!item,
    retry: false,
  });
  const liveStrikes = (strikes.data?.items ?? []).filter((s) => s.state === "ACTIVE");

  const outdated = item && item.currentVersion !== null && item.currentVersion !== item.contentVersion;
  const pending = item?.status === "PENDING" && !outdated;
  const when = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("admin.moderation.dialogHeading")}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {item && (
                <>
                  <span className="bg-brand-orange-soft text-brand-orange rounded px-1.5 py-0.5 font-sans font-semibold">
                    {t(`admin.moderation.sources.${item.source}`)}
                  </span>
                  <span className="bg-muted rounded px-1.5 py-0.5 font-sans">
                    {t("admin.moderation.versionLabel", { version: item.contentVersion })}
                  </span>
                  <span className="bg-muted rounded px-1.5 py-0.5">
                    {t(`admin.moderation.status.${item.status}`)}
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
                  item.source === "FLAGGED_AUTHOR" ? "text-brand-orange" : "text-destructive",
                )}
              >
                {t(`admin.moderation.why.${item.source}.title`)}
              </h3>
              <p className="mt-1 text-sm leading-6">{t(`admin.moderation.why.${item.source}.body`)}</p>
              {item.source === "FLAGGED_AUTHOR" ? (
                <div className="mt-3">
                  <p className="text-muted-foreground text-xs font-medium">{t("admin.moderation.authorViolations")}</p>
                  {strikes.isPending && <Skeleton className="mt-2 h-14 rounded-lg" />}
                  {strikes.data && liveStrikes.length === 0 && (
                    <p className="mt-2 text-sm">{t("admin.moderation.noLiveStrikes")}</p>
                  )}
                  <ul className="mt-2 space-y-2">
                    {liveStrikes.map((strike) => (
                      <li key={strike.id} className="bg-card border-border rounded-lg border p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 font-sans text-xs font-semibold",
                              LEVEL_CHIP[strike.level],
                            )}
                          >
                            {t(`admin.level.${strike.level}`)}
                          </span>
                          <span className="font-medium">{strike.category}</span>
                          <span className="text-muted-foreground ml-auto font-sans text-xs">
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
              <p role="status" className="bg-brand-orange-soft text-brand-orange rounded-lg p-3 text-sm">
                {t("admin.moderation.outdated", { current: item.currentVersion })}
              </p>
            )}

            <ModerationPostAndAuthorGrid item={item} formatTime={when} onNotifyAuthor={() => setNotifyOpen(true)} />

            {item.status !== "PENDING" && (
              <ModerationReviewedSummary
                item={item}
                formatTime={when}
                onNotifyAuthor={() => setNotifyOpen(true)}
                onClose={onClose}
              />
            )}

            {pending && (
              <ModerationDecisionForm
                item={item}
                initialChoice={initialChoice}
                onNotifyAuthor={() => setNotifyOpen(true)}
                onClose={onClose}
              />
            )}
          </div>
        )}
      </DialogContent>
      {item && (
        <ModerationNotifyAuthorDialog
          open={notifyOpen}
          onOpenChange={setNotifyOpen}
          authorName={item.authorName}
          authorEmail={item.authorEmail}
          reason={item.reason}
          source={item.source}
        />
      )}
    </Dialog>
  );
}
