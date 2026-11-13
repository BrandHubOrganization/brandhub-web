import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { useHashtagCollection } from "@/pages/hashtag-groups/hooks/useHashtagCollection";
import { HashtagCollectionPagination } from "@/pages/hashtag-groups/components/HashtagCollectionPagination";
import { HashtagCollectionFilters } from "@/pages/hashtag-groups/components/HashtagCollectionFilters";
import { HashtagEntryGrid } from "@/pages/hashtag-groups/components/HashtagEntryGrid";
import { hashtagErrorKey } from "@/pages/hashtag-groups/services/hashtagService";
import { useHashtagCampaigns } from "@/pages/hashtag-groups/hooks/useHashtagCampaigns";
import type { MemberRole } from "@/types/workspace";
import { Loader2, TrendingUp } from "lucide-react";

export function HashtagCollection() {
  const { id } = useParams();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const userId = useAuthStore((state) => state.user?.id);
  const workspaceId = id ?? currentWorkspace?.id;
  const role =
    currentWorkspace && currentWorkspace.id === workspaceId
      ? currentWorkspace.myRole
      : null;
  const { t } = useTranslation();
  if (!workspaceId || !userId)
    return <p>{t("hashtagGroups.collection.selectWorkspace")}</p>;
  return (
    <CollectionContent
      key={`${userId}:${workspaceId}`}
      workspaceId={workspaceId}
      userId={userId}
      role={role}
    />
  );
}

function CollectionContent({
  workspaceId,
  userId,
  role,
}: {
  workspaceId: string;
  userId: string;
  role: MemberRole | null;
}) {
  const { t, i18n } = useTranslation();
  const { filter, changeFilter, query } = useHashtagCollection(
    workspaceId,
    userId,
  );
  const campaigns = useHashtagCampaigns(workspaceId);
  const campaignNames = new Map(
    (campaigns.data ?? []).map((campaign) => [campaign.id, campaign.name]),
  );
  const prefix = "hashtagGroups.collection.";
  const result = query.isError ? undefined : query.data;

  return (
    <section className="space-y-4" aria-label={t(prefix + "title")}>
      <HashtagCollectionFilters
        filter={filter}
        canAdd={false}
        isFetching={query.isFetching}
        onFilterChange={changeFilter}
      />

      {query.isPending && (
        <div className="flex h-44 items-center justify-center rounded-xl border border-border/70 bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
        </div>
      )}

      {query.isError && (
        <div role="alert" className="text-destructive space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p>{t(prefix + hashtagErrorKey(query.error, "loadError"))}</p>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            {t(prefix + "retry")}
          </Button>
        </div>
      )}

      {result && result.items.length === 0 && (
        <div className="rounded-xl border border-border/70 bg-card p-10 text-center text-muted-foreground">
          <TrendingUp className="mx-auto mb-2 size-8 text-brand-orange/60" />
          <p className="text-sm font-semibold text-foreground">
            Chưa có hashtag xu hướng phù hợp
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hệ thống AI Trend Radar đang tiếp tục quét và phân tích dữ liệu mạng xã hội cho không gian làm việc này.
          </p>
        </div>
      )}

      {result && result.items.length > 0 && (
        <HashtagEntryGrid
          entries={result.items}
          workspaceId={workspaceId}
          userId={userId}
          role={role}
          campaignNames={campaignNames}
          language={i18n.language}
        />
      )}

      {result && (
        <HashtagCollectionPagination
          page={result}
          currentPage={filter.page}
          onPageChange={(page) => changeFilter({ page })}
        />
      )}
    </section>
  );
}
