import { useEffect, useState } from "react";
import {
  CloudDownload,
  FolderOpen,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useMaterialRepository } from "@/pages/library/hooks/useMaterialRepository";
import { useMaterialDownload } from "@/pages/library/hooks/useMaterialDownload";
import { MaterialTrashList } from "@/pages/library/components/MaterialTrashList";
import { MaterialRepositoryCard } from "@/pages/library/components/MaterialRepositoryCard";
import { ConfirmPermanentDeleteModal } from "@/pages/library/components/ConfirmPermanentDeleteModal";
import { ConfirmSoftDeleteModal } from "@/pages/library/components/ConfirmSoftDeleteModal";
import { MediaUploadButton } from "@/pages/library/components/MediaUploadButton";
import { MediaDetailPanel } from "@/pages/library/components/MediaDetailPanel";
import { MaterialFolderSection } from "@/pages/library/components/MaterialFolderSection";
import { ShareFromClientVaultModal } from "@/pages/library/components/ShareFromClientVaultModal";
import { MaterialToolbar } from "@/pages/library/components/MaterialToolbar";
import { CustomerDrivePanel } from "@/pages/library/components/CustomerDrivePanel";
import type { MaterialFilters, MaterialItem } from "@/types/material";

type RepositorySubTab = "active" | "client-vault" | "drafts" | "trash";

export function MediaTab() {
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const actor = useAuthStore((state) => state.user?.id);
  return <RepositoryMedia key={`${workspace}:${actor}`} />;
}

function RepositoryMedia() {
  const { t } = useTranslation();
  const currentRole = useWorkspaceStore((state) => state.currentMemberRole);
  const [subTab, setSubTab] = useState<RepositorySubTab>(
    currentRole === "CLIENT" ? "client-vault" : "active",
  );
  const [folderId, setFolderId] = useState<string>();
  const [driveOpen, setDriveOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [trashBusy, setTrashBusy] = useState(false);
  const deleted = subTab === "trash";
  const isDrafts = subTab === "drafts";
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filters, setFilters] = useState<MaterialFilters>({});
  const [confirm, setConfirm] = useState<MaterialItem | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<MaterialItem | "all" | null>(
    null,
  );
  const [selected, setSelected] = useState<MaterialItem | null>(null);
  const effectiveFilters: MaterialFilters = {
    ...filters,
    folderId,
    tab: subTab === "client-vault" ? "CLIENT_VAULT" : "LIBRARY",
    draft: isDrafts ? true : undefined,
  };
  const repository = useMaterialRepository(
    deleted,
    page,
    debounced,
    effectiveFilters,
  );
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
  const pending =
    trashBusy ||
    repository.remove.isPending ||
    repository.restore.isPending ||
    repository.promote.isPending ||
    repository.purge.isPending;
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
      {/* Row 1: Source Navigation + Primary Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={subTab}
          onValueChange={(value) => {
            setSubTab(value as RepositorySubTab);
            setFolderId(undefined);
            setPage(0);
            setSelected(null);
            setConfirm(null);
            setPurgeTarget(null);
          }}
        >
          <TabsList className="bg-muted/60 h-auto min-h-9 max-w-full flex-wrap justify-start gap-1 rounded-lg p-1 sm:h-9">
            {currentRole !== "CLIENT" && (
              <TabsTrigger
                value="active"
                disabled={pending}
                data-testid="tab-active-library"
                className="gap-1.5 rounded-md px-3 py-1 text-xs"
              >
                <FolderOpen className="size-3.5" />
                {t("library.simple.allFiles")}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="client-vault"
              disabled={pending}
              className="gap-1.5 rounded-md px-3 py-1 text-xs"
            >
              <Users className="size-3.5" />
              {t("library.simple.vault")}
            </TabsTrigger>
            {currentRole !== "CLIENT" && (
              <TabsTrigger
                value="drafts"
                disabled={pending}
                data-testid="tab-ai-drafts"
                className="gap-1.5 rounded-md px-3 py-1 text-xs"
              >
                <Sparkles className="size-3.5" />
                {t("library.simple.drafts")}
              </TabsTrigger>
            )}
            {currentRole !== "CLIENT" && (
              <TabsTrigger
                value="trash"
                disabled={pending}
                data-testid="tab-trash-library"
                className="gap-1.5 rounded-md px-3 py-1 text-xs"
              >
                <Trash2 className="size-3.5" />
                {t("library.trash.title")}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          {deleted &&
            (repository.role === "MANAGER" || repository.role === "CREATOR") &&
            !repository.forbidden &&
            !repository.query.isError && (
              <Button
                variant="destructive"
                size="sm"
                disabled={pending || repository.query.isFetching}
                onClick={() => setPurgeTarget("all")}
              >
                <Trash2 className="size-4" />
                {t("library.trash.emptyTrash")}
              </Button>
            )}
          {subTab === "client-vault" &&
            currentRole === "CLIENT" &&
            repository.workspace && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg text-xs"
                  onClick={() => setSharing(true)}
                >
                  {t("materials.repository.shareFromVault")}
                </Button>
                <ShareFromClientVaultModal
                  workspace={repository.workspace}
                  open={sharing}
                  onClose={() => setSharing(false)}
                />
              </>
            )}

          {subTab === "active" &&
            repository.workspace &&
            !repository.forbidden &&
            !repository.query.isError && (
              <Button
                variant="outline"
                size="sm"
                aria-expanded={driveOpen}
                onClick={() => setDriveOpen(!driveOpen)}
              >
                <CloudDownload className="size-4" />
                {t("library.simple.fromDrive")}
              </Button>
            )}
          {(subTab === "active" ||
            (currentRole === "CLIENT" && subTab === "client-vault")) &&
            !repository.forbidden &&
            !repository.query.isError && (
              <MediaUploadButton
                key={`${subTab}:${folderId ?? "root"}`}
                folderId={folderId}
                onUploadSuccess={uploaded}
                disabled={
                  repository.usage.data?.storageMode !==
                    "CUSTOMER_DRIVE_FIRST" &&
                  repository.usage.data?.isQuotaExceeded
                }
              />
            )}
        </div>
      </div>

      {subTab === "active" &&
        repository.workspace &&
        !repository.forbidden &&
        !repository.query.isError && (
          <div hidden={!driveOpen}>
            <CustomerDrivePanel folderId={folderId} />
          </div>
        )}
      {/* Row 2: Compact Control Bar (Search + Format Chips + Sort + Advanced Filters) */}
      {repository.workspace &&
        !repository.forbidden &&
        !repository.query.isError && (
          <fieldset disabled={pending} className="min-w-0">
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
          </fieldset>
        )}

      {/* Contextual Notice + Count Row */}
      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
        <div aria-live="polite" className="font-medium">
          {repository.forbidden
            ? ""
            : !repository.workspace
              ? t("library.trash.chooseWorkspace")
              : repository.query.isPending
                ? t("library.trash.loading")
                : deleted
                  ? t("library.trash.inventory", {
                      files: total,
                      folders: repository.query.data?.folders?.length ?? 0,
                    })
                  : t("library.trash.count", { count: total })}
        </div>
        {subTab === "client-vault" && (
          <span>{t("materials.repository.vaultNoShare")}</span>
        )}
        {isDrafts && <span>{t("library.trash.draftNotice")}</span>}
        {deleted && <span>{t("library.trash.quotaNotice")}</span>}
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
      {deleted &&
        repository.workspace &&
        !repository.forbidden &&
        !repository.query.isError &&
        !repository.query.isPending && (
          <MaterialTrashList
            key={JSON.stringify([
              repository.workspace,
              repository.actor,
              repository.role,
              page,
              debounced,
              effectiveFilters,
            ])}
            workspace={repository.workspace}
            files={items}
            folders={repository.query.data?.folders ?? []}
            busy={
              pending || repository.query.isFetching || search !== debounced
            }
            onBusyChange={setTrashBusy}
          />
        )}
      {!deleted &&
        repository.workspace &&
        !repository.forbidden &&
        !repository.query.isError && (
          <MaterialFolderSection
            workspace={repository.workspace}
            showFiles={items.length > 0}
            folders={repository.query.data?.folders ?? []}
            breadcrumbs={repository.query.data?.breadcrumbs ?? []}
            folderId={folderId}
            onOpen={(id) => {
              setFolderId(id);
              setPage(0);
              setSelected(null);
            }}
            mutable={
              (subTab === "client-vault" && repository.role === "CLIENT") ||
              (subTab !== "client-vault" &&
                (repository.role === "MANAGER" ||
                  repository.role === "CREATOR" ||
                  repository.role === "OWNER"))
            }
            deleted={deleted}
          />
        )}
      {!repository.query.isPending &&
        !repository.forbidden &&
        !repository.query.isError &&
        items.length === 0 &&
        !repository.query.data?.folders?.length && (
          <div className="border-border text-muted-foreground space-y-2 rounded-xl border border-dashed p-5 text-center">
            <FolderOpen
              className="text-muted-foreground mx-auto size-8"
              strokeWidth={1.5}
            />
            <p className="text-foreground font-medium">
              {deleted
                ? t("library.trash.empty")
                : isDrafts
                  ? t("library.trash.emptyDrafts")
                  : filtered
                    ? label("emptySearch")
                    : t("library.simple.emptyTitle")}
            </p>
            {!deleted && !isDrafts && !filtered && (
              <p className="text-sm">{t("library.simple.emptyHint")}</p>
            )}
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
      <div
        className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-busy={repository.query.isPending}
      >
        {repository.workspace &&
          repository.query.isPending &&
          Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="border-border rounded-xl border p-3"
              aria-hidden="true"
            >
              <div className="bg-muted aspect-video animate-pulse rounded-lg motion-reduce:animate-none" />
              <div className="bg-muted mt-4 h-4 w-3/4 animate-pulse rounded motion-reduce:animate-none" />
            </div>
          ))}
        {!deleted &&
          items.map((material) => (
            <MaterialRepositoryCard
              key={`${material.id}:${material.version}`}
              material={material}
              deleted={deleted}
              pending={pending}
              downloading={downloader.isDownloading(material.id)}
              onDownload={(format) =>
                void downloader.download(material, format)
              }
              onPromote={
                material.draft
                  ? () => repository.promote.mutate(material)
                  : undefined
              }
              onDelete={() => setConfirm(material)}
              onRestore={() => repository.restore.mutate(material)}
              onPurge={() => setPurgeTarget(material)}
              onOpen={() => setSelected(material)}
            />
          ))}
      </div>
      {total > 20 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={pending || page === 0 || repository.query.isFetching}
            onClick={() => setPage(page - 1)}
          >
            {t("library.trash.previous")}
          </Button>
          <Button
            variant="outline"
            disabled={
              pending || (page + 1) * 20 >= total || repository.query.isFetching
            }
            onClick={() => setPage(page + 1)}
          >
            {t("library.trash.next")}
          </Button>
          <span className="text-muted-foreground text-sm tabular-nums">
            {t("library.simple.page", {
              page: page + 1,
              total: Math.ceil(total / 20),
            })}
          </span>
        </div>
      )}
      <ConfirmPermanentDeleteModal
        target={
          repository.forbidden || repository.query.isError ? null : purgeTarget
        }
        pending={repository.purge.isPending}
        onClose={() => setPurgeTarget(null)}
        onConfirm={() => {
          if (purgeTarget && !repository.purge.isPending)
            repository.purge.mutate(purgeTarget, {
              onSuccess: () => {
                setPurgeTarget(null);
                setPage(0);
              },
            });
        }}
      />
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
        onDownload={(latest, format) =>
          void downloader.download(latest, format)
        }
        onPromote={(latest) => {
          repository.promote.mutate(latest, {
            onSuccess: () => setSelected(null),
          });
        }}
        onDelete={(latest) => {
          setConfirm(latest);
          setSelected(null);
        }}
        onWatermarked={uploaded}
      />
    </div>
  );
}
