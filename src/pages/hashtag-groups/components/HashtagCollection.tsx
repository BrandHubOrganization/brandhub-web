import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { useHashtagCollection } from "@/pages/hashtag-groups/hooks/useHashtagCollection";
import { AddHashtagDialog } from "@/pages/hashtag-groups/components/AddHashtagDialog";
import { RemoveHashtagDialog } from "@/pages/hashtag-groups/components/RemoveHashtagDialog";
import { HashtagCollectionPagination } from "@/pages/hashtag-groups/components/HashtagCollectionPagination";
import { HashtagCollectionFilters } from "@/pages/hashtag-groups/components/HashtagCollectionFilters";
import { HashtagEntryGrid } from "@/pages/hashtag-groups/components/HashtagEntryGrid";
import {
  getHashtag,
  hashtagErrorKey,
} from "@/pages/hashtag-groups/services/hashtagService";
import { useHashtagCampaigns } from "@/pages/hashtag-groups/hooks/useHashtagCampaigns";
import type { HashtagEntry } from "@/pages/hashtag-groups/types/hashtag";
import type { MemberRole } from "@/types/workspace";

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
  const { filter, changeFilter, query, create, remove } = useHashtagCollection(
    workspaceId,
    userId,
  );
  const canRequire = role === "CLIENT";
  const campaigns = useHashtagCampaigns(workspaceId);
  const campaignNames = new Map(
    (campaigns.data ?? []).map((campaign) => [campaign.id, campaign.name]),
  );
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<HashtagEntry | null>(null);
  const [removalRefreshed, setRemovalRefreshed] = useState(false);
  const prefix = "hashtagGroups.collection.";
  const result = query.isError ? undefined : query.data;
  return (
    <section className="space-y-4" aria-label={t(prefix + "title")}>
      <HashtagCollectionFilters
        filter={filter}
        canAdd={Boolean(result)}
        isFetching={query.isFetching}
        onFilterChange={changeFilter}
        onAdd={() => {
          create.reset();
          setOpen(true);
        }}
      />
      {query.isPending && <p role="status">{t(prefix + "loading")}</p>}
      {query.isError && (
        <div role="alert" className="text-destructive space-y-2">
          <p>{t(prefix + hashtagErrorKey(query.error, "loadError"))}</p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            {t(prefix + "retry")}
          </Button>
        </div>
      )}
      {result && result.items.length === 0 && (
        <p className="border-border text-muted-foreground rounded-xl border p-8 text-center">
          {t(
            prefix +
              (filter.q || filter.purpose || filter.isRequired !== undefined
                ? "noResults"
                : "empty"),
          )}
        </p>
      )}
      {result && (
        <HashtagEntryGrid
          entries={result.items}
          workspaceId={workspaceId}
          userId={userId}
          role={role}
          campaignNames={campaignNames}
          language={i18n.language}
          onRemove={(entry) => {
            remove.reset();
            setRemovalRefreshed(false);
            setRemoving(entry);
          }}
        />
      )}
      {result && (
        <HashtagCollectionPagination
          page={result}
          currentPage={filter.page}
          onPageChange={(page) => changeFilter({ page })}
        />
      )}
      {open && (
        <AddHashtagDialog
          pending={create.isPending}
          error={create.error}
          workspaceId={workspaceId}
          canRequire={canRequire}
          onClose={() => setOpen(false)}
          onSubmit={async (payload) => {
            try {
              await create.mutateAsync(payload);
              setOpen(false);
              toast.success(t(prefix + "added"));
            } catch {
              /* Mutation error is rendered in the dialog. */
            }
          }}
        />
      )}
      {removing && (
        <RemoveHashtagDialog
          entry={removing}
          campaignName={
            removing.campaignId
              ? (campaignNames.get(removing.campaignId) ??
                t(prefix + "campaignScope", { id: removing.campaignId }))
              : undefined
          }
          pending={remove.isPending}
          error={remove.error}
          refreshed={removalRefreshed}
          onClose={() => {
            setRemoving(null);
            setRemovalRefreshed(false);
          }}
          onConfirm={async () => {
            try {
              await remove.mutateAsync({
                hashtagId: removing.id,
                version: removing.version,
              });
              setRemoving(null);
              toast.success(t(prefix + "removed"));
            } catch (error) {
              if (hashtagErrorKey(error, "removeError") === "changed") {
                try {
                  const current = await getHashtag(workspaceId, removing.id);
                  remove.reset();
                  setRemoving(current);
                  setRemovalRefreshed(true);
                  await query.refetch();
                } catch (refreshError) {
                  if (
                    hashtagErrorKey(refreshError, "removeError") === "notFound"
                  ) {
                    setRemoving(null);
                    toast.info(t(prefix + "alreadyRemoved"));
                    await query.refetch();
                  }
                }
              }
              /* Keep the confirmation open if the fresh entry could not be loaded. */
            }
          }}
        />
      )}
    </section>
  );
}
