import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { useHashtagCollection } from "@/pages/hashtag-groups/hooks/useHashtagCollection";
import { AddHashtagDialog } from "@/pages/hashtag-groups/components/AddHashtagDialog";
import { RemoveHashtagDialog } from "@/pages/hashtag-groups/components/RemoveHashtagDialog";
import { getHashtag, hashtagErrorKey } from "@/pages/hashtag-groups/services/hashtagService";
import { hashtagPurposes } from "@/pages/hashtag-groups/types/hashtag";
import { useHashtagCampaigns } from "@/pages/hashtag-groups/hooks/useHashtagCampaigns";
import type { HashtagEntry } from "@/pages/hashtag-groups/types/hashtag";
import type { MemberRole } from "@/types/workspace";

export function HashtagCollection() {
  const { id } = useParams();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const userId = useAuthStore((state) => state.user?.id);
  const workspaceId = id ?? currentWorkspace?.id;
  const role = currentWorkspace && currentWorkspace.id === workspaceId
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
      <div className="border-border bg-card flex flex-wrap items-end gap-3 rounded-xl border p-4">
        <div className="min-w-40 flex-1">
          <Input
            label={t(prefix + "search")}
            value={filter.q}
            maxLength={100}
            onChange={(event) => changeFilter({ q: event.target.value })}
          />
        </div>
        <Select
          aria-label={t(prefix + "purpose")}
          wrapperClassName="w-full sm:w-40"
          value={filter.purpose}
          onChange={(event) => changeFilter({ purpose: event.target.value })}
        >
          <option value="">{t(prefix + "all")}</option>
          {[...hashtagPurposes, "EVENT_SPECIFIC"].map((value) => (
            <option key={value} value={value}>
              {t(prefix + "purposes." + value)}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t(prefix + "required")}
          wrapperClassName="w-full sm:w-40"
          value={filter.isRequired === undefined ? "" : String(filter.isRequired)}
          onChange={(event) => changeFilter({
            isRequired: event.target.value === "" ? undefined : event.target.value === "true",
          })}
        >
          <option value="">{t(prefix + "allRequirements")}</option>
          <option value="true">{t(prefix + "required")}</option>
          <option value="false">{t(prefix + "optional")}</option>
        </Select>
        <Button
          disabled={!result || query.isFetching}
          onClick={() => {
            create.reset();
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t(prefix + "add")}
        </Button>
      </div>
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((entry) => (
            <article
              key={entry.id}
              className="border-border bg-card space-y-3 rounded-xl border p-4"
            >
              <h3 className="font-semibold break-all">#{entry.tag}</h3>
              {currentRoleCanRemove(entry, userId, role) && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t(prefix + "removeTag", { tag: entry.tag })}
                  onClick={() => { remove.reset(); setRemovalRefreshed(false); setRemoving(entry); }}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {t(prefix + "purposes." + entry.purpose)}
                </Badge>
                <Badge variant={entry.isRequired ? "default" : "outline"}>
                  {t(prefix + (entry.isRequired ? "required" : "optional"))}
                </Badge>
              {entry.campaignId && (
                <Badge variant="outline">
                  {campaignNames.get(entry.campaignId) ??
                    t(prefix + "campaignScope", { id: entry.campaignId })}
                </Badge>
              )}
              </div>
              <p className="text-muted-foreground text-sm">
                {t(prefix + "creator")}: {entry.addedByName}
              </p>
              <p className="text-muted-foreground text-sm">
                {t(prefix + "createdAt")}:{" "}
                {new Date(entry.createdAt).toLocaleString(i18n.language)}
              </p>
            </article>
          ))}
        </div>
      )}
      {result && result.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            variant="outline"
            disabled={filter.page === 0}
            onClick={() => changeFilter({ page: filter.page - 1 })}
          >
            {t(prefix + "previous")}
          </Button>
          <span>
            {t(prefix + "page", {
              page: result.page + 1,
              total: result.totalPages,
            })}
          </span>
          <Button
            variant="outline"
            disabled={filter.page + 1 >= result.totalPages}
            onClick={() => changeFilter({ page: filter.page + 1 })}
          >
            {t(prefix + "next")}
          </Button>
        </div>
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
          campaignName={removing.campaignId
            ? campaignNames.get(removing.campaignId) ?? t(prefix + "campaignScope", { id: removing.campaignId })
            : undefined}
          pending={remove.isPending}
          error={remove.error}
          refreshed={removalRefreshed}
          onClose={() => { setRemoving(null); setRemovalRefreshed(false); }}
          onConfirm={async () => {
            try {
              await remove.mutateAsync({ hashtagId: removing.id, version: removing.version });
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
                  if (hashtagErrorKey(refreshError, "removeError") === "notFound") {
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

function currentRoleCanRemove(
  entry: Pick<HashtagEntry, "addedBy" | "isRequired">,
  userId: string,
  role: MemberRole | null,
) {
  return role === "MANAGER"
    || (role === "CREATOR" && (entry.isRequired || entry.addedBy === userId))
    || (role === "CLIENT" && entry.addedBy === userId);
}
