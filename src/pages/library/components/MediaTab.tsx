import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useMaterialTrash } from "@/pages/library/hooks/useMaterialTrash";
import { canMutateMaterial } from "@/pages/library/hooks/materialTrashPolicy";
import { MaterialRepositoryCard } from "@/pages/library/components/MaterialRepositoryCard";
import { ConfirmSoftDeleteModal } from "@/pages/library/components/ConfirmSoftDeleteModal";
import { MediaUploadButton } from "@/pages/library/components/MediaUploadButton";
import { MediaDetailPanel } from "@/pages/library/components/MediaDetailPanel";
import type { MaterialItem } from "@/types/material";
import type { MediaItem } from "@/types/contentLibrary";

function asMedia(material: MaterialItem): MediaItem {
  return {
    id: material.id,
    workspaceId: material.workspaceId,
    filename: material.name,
    url: material.previewUrl ?? material.url ?? "",
    sizeBytes: material.fileSize ?? 0,
    createdAt: material.createdAt,
    source: "repository",
    type:
      material.mediaKind === "VIDEO"
        ? "video"
        : material.mediaKind === "FILE"
          ? "file"
          : "image",
  };
}

export function MediaTab() {
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const actor = useAuthStore((state) => state.user?.id);
  return <RepositoryMedia key={`${workspace}:${actor}`} />;
}

function RepositoryMedia() {
  const { t } = useTranslation();
  const [deleted, setDeleted] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<MaterialItem | null>(null);
  const [selected, setSelected] = useState<MaterialItem | null>(null);
  const repository = useMaterialTrash(deleted, page, search);
  const client = useQueryClient();
  const items = repository.query.data?.items ?? [];
  const pending = repository.remove.isPending || repository.restore.isPending;
  const uploaded = () => {
    void client.invalidateQueries({ queryKey: ["materials"] });
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={deleted ? "trash" : "active"}
        onValueChange={(value) => {
          setDeleted(value === "trash");
          setPage(0);
          setSelected(null);
          setConfirm(null);
        }}
      >
        <TabsList>
          <TabsTrigger value="active">{t("library.trash.active")}</TabsTrigger>
          <TabsTrigger value="trash">{t("library.trash.title")}</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Input
          value={search}
          aria-label={t("library.media.searchPlaceholder")}
          placeholder={t("library.media.searchPlaceholder")}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
        />
        {!deleted && <MediaUploadButton onUploadSuccess={uploaded} />}
      </div>
      {deleted && (
        <p className="text-muted-foreground text-sm">
          {t("library.trash.quotaNotice")}
        </p>
      )}
      <div aria-live="polite" className="text-muted-foreground text-sm">
        {!repository.workspace
          ? t("library.trash.chooseWorkspace")
          : repository.query.isPending
            ? t("library.trash.loading")
            : t("library.trash.count", {
                count: deleted
                  ? (repository.query.data?.total ?? 0)
                  : items.length,
              })}
      </div>
      {repository.query.isError && (
        <div
          role="alert"
          className="text-destructive flex items-center gap-3 text-sm"
        >
          {t("library.trash.loadFailed")}
          <Button variant="outline" onClick={() => void repository.refresh()}>
            {t("library.trash.retry")}
          </Button>
        </div>
      )}
      {!repository.query.isPending &&
        !repository.query.isError &&
        items.length === 0 && (
          <p className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center">
            {t(deleted ? "library.trash.empty" : "library.media.emptyTitle")}
          </p>
        )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((material) => (
          <MaterialRepositoryCard
            key={material.id}
            material={material}
            deleted={deleted}
            canMutate={canMutateMaterial(
              material,
              repository.actor,
              repository.role,
            )}
            pending={pending}
            onDelete={() => setConfirm(material)}
            onRestore={() => repository.restore.mutate(material)}
            onOpen={() => setSelected(material)}
          />
        ))}
      </div>
      {deleted && (
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            disabled={page === 0 || repository.query.isFetching}
            onClick={() => setPage(page - 1)}
          >
            {t("library.trash.previous")}
          </Button>
          <Button
            variant="outline"
            disabled={
              (page + 1) * 20 >= (repository.query.data?.total ?? 0) ||
              repository.query.isFetching
            }
            onClick={() => setPage(page + 1)}
          >
            {t("library.trash.next")}
          </Button>
        </div>
      )}
      <ConfirmSoftDeleteModal
        material={confirm}
        pending={repository.remove.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm)
            repository.remove.mutate(confirm, {
              onSuccess: () => {
                setConfirm(null);
                setSelected(null);
              },
            });
        }}
      />
      <MediaDetailPanel
        media={selected ? asMedia(selected) : null}
        onClose={() => setSelected(null)}
        canDelete={
          !!selected &&
          canMutateMaterial(selected, repository.actor, repository.role)
        }
        onDelete={async () => {
          if (selected) {
            setConfirm(selected);
            setSelected(null);
          }
        }}
        onWatermarked={uploaded}
      />
    </div>
  );
}
