import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useMaterialRepository } from "@/pages/library/hooks/useMaterialRepository";
import { useMaterialDownload } from "@/pages/library/hooks/useMaterialDownload";
import { MaterialRepositoryCard } from "@/pages/library/components/MaterialRepositoryCard";
import { ConfirmSoftDeleteModal } from "@/pages/library/components/ConfirmSoftDeleteModal";
import { MediaUploadButton } from "@/pages/library/components/MediaUploadButton";
import { MediaDetailPanel } from "@/pages/library/components/MediaDetailPanel";
import { MaterialToolbar } from "@/pages/library/components/MaterialToolbar";
import { CustomerDrivePanel } from "@/pages/library/components/CustomerDrivePanel";
import type { MaterialFilters, MaterialItem } from "@/types/material";

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
  const [debounced, setDebounced] = useState("");
  const [filters, setFilters] = useState<MaterialFilters>({});
  const [confirm, setConfirm] = useState<MaterialItem | null>(null);
  const [selected, setSelected] = useState<MaterialItem | null>(null);
  const repository = useMaterialRepository(deleted, page, debounced, filters);
  const downloader = useMaterialDownload();
  const client = useQueryClient();
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const items =
    repository.forbidden || repository.query.isError
      ? []
      : (repository.query.data?.items ?? []);
  const total =
    repository.forbidden || repository.query.isError
      ? 0
      : (repository.query.data?.total ?? 0);
  const pending = repository.remove.isPending || repository.restore.isPending;
  const uploaded = () => {
    void client.invalidateQueries({ queryKey: ["materials"] });
    void client.invalidateQueries({ queryKey: ["material-storage-usage"] });
  };
  const label = (key: string) => t(`library.repository.${key}`);
  const filtered = !!search || Object.values(filters).some(Boolean);
  const forbidden =
    isAxiosError(repository.query.error) &&
    repository.query.error.response?.status === 403;
  return (
    <div className="space-y-4">
      {!repository.forbidden && !repository.query.isError && (
        <CustomerDrivePanel />
      )}
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
      {repository.workspace &&
        !repository.forbidden &&
        !repository.query.isError && (
          <MaterialToolbar
            workspace={repository.workspace}
            role={repository.role}
            search={search}
            filters={filters}
            usage={repository.usage.data}
            onSearch={setSearch}
            onChange={(next) => {
              setFilters(next);
              setPage(0);
            }}
          />
        )}
      {!deleted && !repository.forbidden && !repository.query.isError && (
        <MediaUploadButton
          onUploadSuccess={uploaded}
          disabled={
            repository.usage.data?.storageMode !== "CUSTOMER_DRIVE_FIRST" &&
            repository.usage.data?.isQuotaExceeded
          }
        />
      )}
      {deleted && (
        <p className="text-muted-foreground text-sm">
          {t("library.trash.quotaNotice")}
        </p>
      )}
      <div aria-live="polite" className="text-muted-foreground text-sm">
        {repository.forbidden
          ? ""
          : !repository.workspace
            ? t("library.trash.chooseWorkspace")
            : repository.query.isPending
              ? t("library.trash.loading")
              : t("library.trash.count", { count: total })}
      </div>
      {(repository.forbidden || repository.query.isError) && (
        <div
          role="alert"
          className="text-destructive flex flex-wrap items-center gap-3 text-sm"
        >
          {label(repository.forbidden || forbidden ? "forbidden" : "loadError")}
          <Button
            variant="outline"
            onClick={() =>
              repository.forbidden
                ? repository.retryAccess()
                : void repository.refresh()
            }
          >
            {label("retry")}
          </Button>
        </div>
      )}
      {!repository.query.isPending &&
        !repository.forbidden &&
        !repository.query.isError &&
        items.length === 0 && (
          <div className="border-border text-muted-foreground space-y-3 rounded-xl border border-dashed p-8 text-center">
            <p>
              {deleted
                ? t("library.trash.empty")
                : label(filtered ? "emptySearch" : "empty")}
            </p>
            {filtered && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setSearch("");
                  setPage(0);
                }}
              >
                {label("resetFilters")}
              </Button>
            )}
          </div>
        )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((material) => (
          <MaterialRepositoryCard
            key={`${material.id}:${material.version}`}
            material={material}
            deleted={deleted}
            pending={pending}
            downloading={downloader.isDownloading(material.id)}
            onDownload={() => void downloader.download(material)}
            onDelete={() => setConfirm(material)}
            onRestore={() => repository.restore.mutate(material)}
            onOpen={() => setSelected(material)}
          />
        ))}
      </div>
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
          disabled={(page + 1) * 20 >= total || repository.query.isFetching}
          onClick={() => setPage(page + 1)}
        >
          {t("library.trash.next")}
        </Button>
      </div>
      <ConfirmSoftDeleteModal
        material={
          repository.forbidden || repository.query.isError ? null : confirm
        }
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
        material={
          repository.forbidden || repository.query.isError ? null : selected
        }
        onClose={() => setSelected(null)}
        quotaExceeded={repository.usage.data?.isQuotaExceeded}
        downloading={selected ? downloader.isDownloading(selected.id) : false}
        onDownload={(latest) => void downloader.download(latest)}
        onDelete={(latest) => {
          setConfirm(latest);
          setSelected(null);
        }}
        onWatermarked={uploaded}
      />
    </div>
  );
}
