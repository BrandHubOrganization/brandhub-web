import { useTranslation } from "react-i18next";
import { AlertTriangle, Copyright, Flag, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StrikeLevel } from "@/services/adminAccountService";
import type {
  ModerationItem,
  ModerationSource,
} from "@/services/adminModerationService";

export const LEVEL_CHIP: Record<StrikeLevel, string> = {
  YELLOW: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300",
  ORANGE: "bg-brand-orange-soft text-brand-orange",
  RED: "bg-destructive/10 text-destructive",
};

const SOURCE_ICON: Record<ModerationSource, typeof Flag> = {
  FLAGGED_AUTHOR: Flag,
  COMPLIANCE: AlertTriangle,
  COPYRIGHT: Copyright,
};

export interface ModerationKanbanCardProps {
  item: ModerationItem;
  formatTime: (iso: string) => string;
  onOpenDecision: (
    id: string,
    initialChoice: "APPROVE" | "BLOCK" | null,
  ) => void;
  onDragStartCard?: (id: string) => void;
}

export function StrikeCounts({ item }: { item: ModerationItem }) {
  const { t } = useTranslation();
  return (
    <span
      className="ml-1 inline-flex gap-1 align-middle font-sans text-xs"
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

export function ModerationKanbanCard({
  item,
  formatTime,
  onOpenDecision,
  onDragStartCard,
}: ModerationKanbanCardProps) {
  const { t } = useTranslation();
  const Icon = SOURCE_ICON[item.source];
  const isPending = item.status === "PENDING";

  return (
    <article
      draggable={isPending}
      onDragStart={(e) => {
        if (!isPending) return;
        e.dataTransfer.setData("text/plain", item.id);
        onDragStartCard?.(item.id);
      }}
      className={cn(
        "bg-card border-border flex flex-col gap-3 rounded-xl border p-4 shadow-xs transition-all",
        isPending && "hover:border-brand-orange/40 cursor-grab active:scale-[0.99]",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-sans text-xs font-semibold",
            item.source === "FLAGGED_AUTHOR"
              ? "bg-brand-orange-soft text-brand-orange"
              : "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {t(`admin.moderation.sources.${item.source}`)}
        </span>
        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-sans text-xs">
          v{item.contentVersion}
        </span>
        {item.strikeLevel && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 font-sans text-xs font-semibold",
              LEVEL_CHIP[item.strikeLevel],
            )}
          >
            {t(`admin.level.${item.strikeLevel}`)}
          </span>
        )}
        {isPending && (
          <GripVertical
            className="text-muted-foreground/50 ml-auto size-4 shrink-0 cursor-grab"
            aria-hidden="true"
          />
        )}
      </div>

      <p className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">
        {item.captionPreview || t("admin.moderation.noCaption")}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="bg-brand-orange-soft text-brand-orange grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold">
          {item.authorName.charAt(0).toUpperCase()}
        </span>
        <span className="text-foreground truncate font-medium">
          {item.authorName}
        </span>
        <StrikeCounts item={item} />
      </div>

      {isPending ? (
        <p className="bg-destructive/10 text-destructive line-clamp-2 rounded-lg px-2.5 py-1.5 text-xs leading-relaxed">
          {item.reason}
        </p>
      ) : (
        <p className="bg-muted/60 text-muted-foreground line-clamp-2 rounded-lg px-2.5 py-1.5 text-xs leading-relaxed">
          {item.decisionNote || item.reason}
        </p>
      )}

      <p className="text-muted-foreground font-sans text-xs">
        {isPending
          ? t("admin.moderation.flaggedAt", {
              time: formatTime(item.createdAt),
            })
          : t("admin.moderation.reviewedAt", {
              time: formatTime(item.reviewedAt ?? item.createdAt),
              name: item.reviewedByName ?? "Admin",
            })}
      </p>

      <div className="border-border flex items-center gap-2 border-t pt-3">
        {isPending ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 flex-1 text-xs"
              onClick={() => onOpenDecision(item.id, null)}
            >
              {t("admin.moderation.review")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 shrink-0 text-xs"
              onClick={() => onOpenDecision(item.id, "BLOCK")}
            >
              {t("admin.moderation.quickBlock")}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full text-xs"
            onClick={() => onOpenDecision(item.id, null)}
          >
            {t("admin.moderation.view")}
          </Button>
        )}
      </div>
    </article>
  );
}
