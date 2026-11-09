import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ban, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ModerationKanbanCard } from "@/pages/admin/components/moderation/ModerationKanbanCard";
import type {
  ModerationItem,
  ModerationStatus,
} from "@/services/adminModerationService";

const STATUS_META: Record<
  ModerationStatus,
  {
    icon: typeof Clock;
    iconClassName: string;
    badgeVariant: "PENDING_REVIEW" | "APPROVED" | "destructive";
  }
> = {
  PENDING: { icon: Clock, iconClassName: "text-brand-orange", badgeVariant: "PENDING_REVIEW" },
  APPROVED: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "APPROVED",
  },
  BLOCKED: { icon: Ban, iconClassName: "text-destructive", badgeVariant: "destructive" },
};

export interface ModerationKanbanColumnProps {
  status: ModerationStatus;
  items: ModerationItem[];
  totalCount: number;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  formatTime: (iso: string) => string;
  onOpenDecision: (id: string, initialChoice: "APPROVE" | "BLOCK" | null) => void;
}

function useColumnInfiniteScroll(
  hasMore: boolean,
  isFetchingMore: boolean,
  onLoadMore: () => void,
  itemCount: number,
) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root || !hasMore || isFetchingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isFetchingMore) onLoadMore();
      },
      { root, rootMargin: "80px", threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, onLoadMore, itemCount]);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 60 && hasMore && !isFetchingMore) {
      onLoadMore();
    }
  };
  return { scrollContainerRef, sentinelRef, handleScroll };
}

function ModerationColumnFooter({
  shownCount,
  totalCount,
  isFetchingMore,
  hasMore,
  onLoadMore,
}: {
  shownCount: number;
  totalCount: number;
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation();
  if (isFetchingMore) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-2.5 text-xs">
        <Spinner size="sm" className="size-3.5" />
        <span>{t("admin.moderation.loadingMore")}</span>
      </div>
    );
  }
  if (hasMore) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onLoadMore}
        className="text-muted-foreground hover:text-brand-orange w-full py-2 text-xs"
      >
        {t("admin.moderation.scrollOrClickMore", { shown: shownCount, total: totalCount })}
      </Button>
    );
  }
  if (totalCount > 5) {
    return (
      <p className="text-muted-foreground py-2 text-center text-xs">
        {t("admin.moderation.allLoaded", { total: totalCount })}
      </p>
    );
  }
  return null;
}

export function ModerationKanbanColumn({
  status,
  items,
  totalCount,
  isLoading,
  isFetchingMore,
  hasMore,
  onLoadMore,
  formatTime,
  onOpenDecision,
}: ModerationKanbanColumnProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  const canAcceptDrop = status === "APPROVED" || status === "BLOCKED";
  const { scrollContainerRef, sentinelRef, handleScroll } = useColumnInfiniteScroll(
    hasMore,
    isFetchingMore,
    onLoadMore,
    items.length,
  );

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedId = e.dataTransfer.getData("text/plain");
    if (canAcceptDrop && droppedId) {
      onOpenDecision(droppedId, status === "APPROVED" ? "APPROVE" : "BLOCK");
    }
  };

  return (
    <section
      aria-label={t(`admin.moderation.status.${status}`)}
      onDragOver={(e) => {
        if (!canAcceptDrop) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "bg-muted/30 border-border flex min-h-[560px] flex-col rounded-2xl border p-3.5 transition-colors",
        canAcceptDrop && isDragOver && "border-brand-orange bg-brand-orange-soft/10",
      )}
    >
      <header className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn("size-4 shrink-0", meta.iconClassName)} aria-hidden="true" />
          <h2 className="text-foreground text-sm font-semibold">
            {t(`admin.moderation.status.${status}`)}
          </h2>
        </div>
        <Badge variant={meta.badgeVariant} className="font-sans text-xs">
          {totalCount > items.length ? `${items.length}/${totalCount}` : totalCount}
        </Badge>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card/60 border-border flex flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed px-4 py-12 text-center">
          <span className="bg-success/10 text-success rounded-full p-2.5">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
            {t(`admin.moderation.empty.${status}`)}
          </p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="max-h-[640px] space-y-3 overflow-y-auto pr-1"
        >
          {items.map((item) => (
            <ModerationKanbanCard
              key={item.id}
              item={item}
              formatTime={formatTime}
              onOpenDecision={onOpenDecision}
            />
          ))}
          <div ref={sentinelRef} aria-hidden="true" />
          <ModerationColumnFooter
            shownCount={items.length}
            totalCount={totalCount}
            isFetchingMore={isFetchingMore}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
          />
        </div>
      )}
    </section>
  );
}
