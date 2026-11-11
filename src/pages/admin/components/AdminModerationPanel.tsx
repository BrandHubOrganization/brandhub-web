import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { ModerationDetailDialog } from "@/pages/admin/components/moderation/ModerationDetailDialog";
import { ModerationKanbanColumn } from "@/pages/admin/components/moderation/ModerationKanbanColumn";
import { useModerationColumnInfinite } from "@/pages/admin/hooks/useModerationKanban";
import type { ModerationSource } from "@/services/adminModerationService";

const SOURCES: ModerationSource[] = [
  "FLAGGED_AUTHOR",
  "COMPLIANCE",
  "COPYRIGHT",
];

export function AdminModerationPanel() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState("");
  const [dialogState, setDialogState] = useState<{
    id: string;
    initialChoice: "APPROVE" | "BLOCK" | null;
  } | null>(null);

  const pendingCol = useModerationColumnInfinite("PENDING", source, searchQuery);
  const approvedCol = useModerationColumnInfinite("APPROVED", source, searchQuery);
  const blockedCol = useModerationColumnInfinite("BLOCKED", source, searchQuery);

  const isError = pendingCol.isError || approvedCol.isError || blockedCol.isError;
  const processedToday =
    pendingCol.processedToday || approvedCol.processedToday || blockedCol.processedToday || 0;

  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" }).format(
      new Date(iso),
    );

  const handleOpenDecision = (id: string, initialChoice: "APPROVE" | "BLOCK" | null) => {
    setDialogState({ id, initialChoice });
  };

  return (
    <div className="space-y-5">
      <section className="bg-card border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.moderation.searchPlaceholder")}
            aria-label={t("admin.moderation.searchPlaceholder")}
            iconPrefix={<Search className="size-4" />}
            wrapperClassName="w-full sm:max-w-xs"
          />
          <SelectMenu
            ariaLabel={t("admin.moderation.sourceLabel")}
            value={source}
            onChange={setSource}
            options={[
              { value: "", label: t("admin.moderation.allSources") },
              ...SOURCES.map((value) => ({
                value,
                label: t(`admin.moderation.sources.${value}`),
              })),
            ]}
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground hidden text-xs xl:block">
            {t("admin.moderation.kanbanDragHint")}
          </p>
          <Badge variant="secondary" className="text-xs font-medium">
            {t("admin.moderation.processedToday", { count: processedToday })}
          </Badge>
        </div>
      </section>

      {isError && (
        <div
          role="alert"
          className="border-destructive/25 bg-destructive/5 flex items-center justify-between gap-3 rounded-xl border p-4 text-sm"
        >
          <p>{t("admin.moderation.error")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void pendingCol.refetch();
              void approvedCol.refetch();
              void blockedCol.refetch();
            }}
          >
            {t("admin.overview.retry")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        <ModerationKanbanColumn
          status="PENDING"
          items={pendingCol.items}
          totalCount={pendingCol.totalCount}
          isLoading={pendingCol.isLoading}
          isFetchingMore={pendingCol.isFetchingMore}
          hasMore={pendingCol.hasMore}
          onLoadMore={pendingCol.loadMore}
          formatTime={formatTime}
          onOpenDecision={handleOpenDecision}
        />
        <ModerationKanbanColumn
          status="APPROVED"
          items={approvedCol.items}
          totalCount={approvedCol.totalCount}
          isLoading={approvedCol.isLoading}
          isFetchingMore={approvedCol.isFetchingMore}
          hasMore={approvedCol.hasMore}
          onLoadMore={approvedCol.loadMore}
          formatTime={formatTime}
          onOpenDecision={handleOpenDecision}
        />
        <ModerationKanbanColumn
          status="BLOCKED"
          items={blockedCol.items}
          totalCount={blockedCol.totalCount}
          isLoading={blockedCol.isLoading}
          isFetchingMore={blockedCol.isFetchingMore}
          hasMore={blockedCol.hasMore}
          onLoadMore={blockedCol.loadMore}
          formatTime={formatTime}
          onOpenDecision={handleOpenDecision}
        />
      </div>

      {dialogState && (
        <ModerationDetailDialog
          id={dialogState.id}
          initialChoice={dialogState.initialChoice}
          onClose={() => setDialogState(null)}
        />
      )}
    </div>
  );
}
