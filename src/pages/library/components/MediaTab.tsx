import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  ChevronDown,
  CloudDownload,
  FolderOpen,
  FolderUp,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useMaterialRepository } from "@/pages/library/hooks/useMaterialRepository";
import { useMaterialDownload } from "@/pages/library/hooks/useMaterialDownload";
import { useMaterialUploadProfiles } from "@/pages/library/hooks/useMaterialUploadProfiles";
import { MaterialTrashList } from "@/pages/library/components/MaterialTrashList";
import { MaterialRepositoryCard } from "@/pages/library/components/MaterialRepositoryCard";
import { ConfirmPermanentDeleteModal } from "@/pages/library/components/ConfirmPermanentDeleteModal";
import { ConfirmSoftDeleteModal } from "@/pages/library/components/ConfirmSoftDeleteModal";
import { MediaDetailPanel } from "@/pages/library/components/MediaDetailPanel";
import {
  DRAG_MATERIAL_MIME,
  MaterialFolderSection,
} from "@/pages/library/components/MaterialFolderSection";
import { MaterialFolderPicker } from "@/pages/library/components/MaterialFolderPicker";
import { ShareFromClientVaultModal } from "@/pages/library/components/ShareFromClientVaultModal";
import {
  MaterialToolbar,
  type ModifiedFilter,
  type PeopleFilter,
  type RepositoryViewMode,
} from "@/pages/library/components/MaterialToolbar";
import type { LibraryResourceTab } from "@/pages/library/components/LibraryResourceDropdown";
import { CustomerDrivePanel } from "@/pages/library/components/CustomerDrivePanel";
import { WatermarkStudioModal } from "@/pages/library/components/watermark/WatermarkStudioModal";
import { RenameMaterialModal } from "@/pages/library/components/RenameMaterialModal";
import { materialService } from "@/services/materialService";
import { workspaceService } from "@/services/workspaceService";
import {
  onRepositoryTaskRefresh,
  useBackgroundTaskStore,
} from "@/store/backgroundTaskStore";
import { extractFromDataTransfer } from "@/pages/library/utils/folderDropReader";
import type {
  MaterialFilters,
  MaterialItem,
  MaterialMediaKind,
  MaterialSort,
  MaterialVisibility,
} from "@/types/material";

export interface MediaTabProps {
  activeResourceTab?: LibraryResourceTab;
  onResourceTabChange?: (tab: LibraryResourceTab) => void;
  resourceCounts?: {
    media: number;
    templates: number;
    hashtags: number;
  };
}

export function MediaTab(props: MediaTabProps) {
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const actor = useAuthStore((state) => state.user?.id);
  return <RepositoryMedia key={`${workspace}:${actor}`} {...props} />;
}

function RepositoryMedia(props: MediaTabProps) {
  const { t } = useTranslation();
  const workspaceObj = useWorkspaceStore((state) => state.currentWorkspace);
  const currentRole = useWorkspaceStore((state) => state.currentMemberRole);
  const actorId = useAuthStore((state) => state.user?.id);
  const isClient = currentRole === "CLIENT";

  const [tab, setTab] = useState<"WORKSPACE" | "CLIENT_VAULT">(
    isClient ? "CLIENT_VAULT" : "WORKSPACE",
  );
  const [trashMode, setTrashMode] = useState(false);
  const [draftMode, setDraftMode] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [driveOpen, setDriveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [trashBusy, setTrashBusy] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [mediaKind, setMediaKind] = useState<MaterialMediaKind | undefined>();
  const [peopleFilter, setPeopleFilter] = useState<PeopleFilter>("ANY");
  const [modifiedFilter, setModifiedFilter] = useState<ModifiedFilter>("ANY");
  const [sort, setSort] = useState<MaterialSort>("newest");
  const [viewMode, setViewMode] = useState<RepositoryViewMode>("grid");

  const [confirm, setConfirm] = useState<MaterialItem | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<MaterialItem | "all" | null>(
    null,
  );
  const [selected, setSelected] = useState<MaterialItem | null>(null);
  const [watermarkTarget, setWatermarkTarget] = useState<MaterialItem | null>(
    null,
  );
  const [renameTarget, setRenameTarget] = useState<MaterialItem | null>(null);
  const [movingMaterial, setMovingMaterial] = useState<MaterialItem | null>(
    null,
  );
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);

  const effectiveFilters: MaterialFilters = {
    mediaKind,
    sort,
    folderId: folderId ?? undefined,
    tab: isClient || tab === "CLIENT_VAULT" ? "CLIENT_VAULT" : "LIBRARY",
    draft: draftMode ? true : undefined,
  };

  const repository = useMaterialRepository(
    trashMode,
    page,
    debounced,
    effectiveFilters,
  );

  const startUploadBatch = useBackgroundTaskStore(
    (state) => state.startUploadBatch,
  );
  const downloader = useMaterialDownload();
  const uploadProfilesQuery = useMaterialUploadProfiles(
    repository.workspace ?? "",
    isClient,
    true,
  );
  const client = useQueryClient();

  const workspaceId = repository.workspace;
  const membersQuery = useQuery({
    queryKey: ["workspace-members", workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: async () => {
      const res = await workspaceService.listMembers(workspaceId!);
      return res.data.data;
    },
    staleTime: 60_000,
  });
  const members = membersQuery.data ?? [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!repository.workspace) return;
    return onRepositoryTaskRefresh((wsId) => {
      if (wsId === repository.workspace) {
        void client.invalidateQueries({ queryKey: ["materials"] });
        void client.invalidateQueries({ queryKey: ["material-storage-usage"] });
        void repository.query.refetch();
      }
    });
  }, [repository.workspace, repository.query, client]);

  const rawItems =
    repository.forbidden || repository.query.isError
      ? []
      : (repository.query.data?.items ?? []);

  const items = useMemo(() => {
    let result = rawItems;
    if (peopleFilter && peopleFilter !== "ANY") {
      result = result.filter((item) => {
        if (peopleFilter === "ME" || (actorId && peopleFilter === actorId)) {
          return item.createdBy === actorId || item.ownerUserId === actorId;
        }
        const targetMember = members.find(
          (m) => m.userId === peopleFilter || m.id === peopleFilter,
        );
        return (
          item.createdBy === peopleFilter ||
          (targetMember?.userId && item.createdBy === targetMember.userId) ||
          (targetMember?.fullName && item.createdByName === targetMember.fullName)
        );
      });
    }

    if (modifiedFilter !== "ANY") {
      const now = Date.now();
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      const sevenDaysAgo = now - 7 * 86400000;
      const thirtyDaysAgo = now - 30 * 86400000;
      const currentYear = new Date().getFullYear();

      result = result.filter((item) => {
        const dateStr = item.updatedAt || item.createdAt;
        if (!dateStr) return true;
        const time = new Date(dateStr).getTime();
        switch (modifiedFilter) {
          case "TODAY":
            return time >= startOfToday;
          case "LAST_7_DAYS":
            return time >= sevenDaysAgo;
          case "LAST_30_DAYS":
            return time >= thirtyDaysAgo;
          case "THIS_YEAR":
            return new Date(dateStr).getFullYear() === currentYear;
          default:
            return true;
        }
      });
    }

    return result;
  }, [rawItems, peopleFilter, modifiedFilter, actorId, members]);
  const folders =
    repository.forbidden || repository.query.isError
      ? []
      : (repository.query.data?.folders ?? []);
  const breadcrumbs =
    repository.forbidden || repository.query.isError
      ? []
      : (repository.query.data?.breadcrumbs ?? []);
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
    void repository.query.refetch();
  };

  const canDelete = (material: MaterialItem) =>
    currentRole === "OWNER" ||
    currentRole === "MANAGER" ||
    ((currentRole === "CREATOR" || currentRole === "CLIENT") &&
      material.createdBy === actorId);

  const canRestore = (material: MaterialItem) =>
    currentRole === "OWNER" ||
    currentRole === "MANAGER" ||
    ((currentRole === "CREATOR" || currentRole === "CLIENT") &&
      material.deletedBy === actorId &&
      material.createdBy === actorId);

  const canPermanentDelete = (material: MaterialItem) =>
    Boolean(material.deletedAt) &&
    material.status !== "PURGE_IN_PROGRESS" &&
    canDelete(material);

  const canPromoteDraft = (material: MaterialItem) =>
    Boolean(material.draft) && !material.deletedAt && canDelete(material);

  const canMoveMaterial = (material: MaterialItem) =>
    !material.deletedAt &&
    material.status !== "PURGE_IN_PROGRESS" &&
    (isClient || material.scopeType !== "CLIENT_VAULT") &&
    canDelete(material);

  const canRename = (material: MaterialItem) =>
    !material.deletedAt &&
    material.status !== "PURGE_IN_PROGRESS" &&
    (material.capabilities?.canRename ?? canDelete(material));

  const canMutateFolders =
    (isClient && tab === "CLIENT_VAULT") ||
    (!isClient &&
      tab === "WORKSPACE" &&
      (currentRole === "OWNER" ||
        currentRole === "MANAGER" ||
        currentRole === "CREATOR"));

  const handleFileDroppedToFolder = async (
    materialId: string,
    targetFolderId: string | null,
    targetFolderName: string,
  ) => {
    if (!repository.workspace) return;
    const item = items.find((m) => m.id === materialId);
    if (item && (item.folderId ?? null) === (targetFolderId ?? null)) {
      return;
    }
    try {
      await materialService.moveMaterial(
        repository.workspace,
        materialId,
        targetFolderId,
      );
      uploaded();
      toast.success(`Đã di chuyển tệp vào "${targetFolderName}"`);
    } catch (e) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể di chuyển tệp vào thư mục này",
      );
    }
  };

  const handleExternalDragOver = (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(DRAG_MATERIAL_MIME)) {
      return;
    }
    if (event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      if (!isExternalDragOver) {
        setIsExternalDragOver(true);
      }
    }
  };

  const handleExternalDragLeave = (event: React.DragEvent) => {
    if (
      event.currentTarget === event.target ||
      !event.currentTarget.contains(event.relatedTarget as Node | null)
    ) {
      setIsExternalDragOver(false);
    }
  };

  const handleExternalDrop = async (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(DRAG_MATERIAL_MIME)) {
      return;
    }
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    setIsExternalDragOver(false);

    if (!repository.workspace) return;

    const extracted = await extractFromDataTransfer(event.dataTransfer);
    if (extracted.skippedCount > 0) {
      toast.warning(
        `Đã bỏ qua ${extracted.skippedCount} tệp không hợp lệ (${extracted.skippedReasons.join(", ")})`,
      );
    }
    if (extracted.validFiles.length === 0) {
      toast.error(
        "Không có tệp hợp lệ để tải lên (PNG, JPG, WEBP, MP4, MOV, PDF ≤ 1 GiB)",
      );
      return;
    }

    const targetClientProfileId =
      workspaceObj?.clientProfileId ??
      uploadProfilesQuery.data?.[0]?.id ??
      undefined;

    const visibility: MaterialVisibility = targetClientProfileId
      ? "CLIENT"
      : "INTERNAL";

    void startUploadBatch({
      workspaceId: repository.workspace,
      files: extracted.validFiles,
      baseFolderId: folderId,
      visibility,
      clientProfileId:
        visibility === "CLIENT" ? targetClientProfileId : undefined,
      isClientRole: isClient,
      rootFolderName: extracted.rootFolderName,
    }).then(() => {
      uploaded();
    });
  };

  const forbidden =
    isAxiosError(repository.query.error) &&
    repository.query.error.response?.status === 403;

  return (
    <div
      onDragOver={handleExternalDragOver}
      onDragLeave={handleExternalDragLeave}
      onDrop={(e) => void handleExternalDrop(e)}
      className="relative space-y-4"
    >
      {/* Full-canvas Google Drive dropzone overlay when dragging OS files/folders */}
      {isExternalDragOver && (
        <div className="pointer-events-none fixed inset-4 z-40 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-orange bg-brand-orange/10 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-brand-orange/30 bg-card/95 px-8 py-6 text-center shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-md">
              <FolderUp className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Thả tệp hoặc thư mục từ thiết bị vào đây để tải lên
            </p>
            <p className="text-xs text-muted-foreground">
              Giữ nguyên cấu trúc thư mục và tự động chạy ngầm ở góc dưới phải
            </p>
          </div>
        </div>
      )}

      {/* Primary Toolbar */}
      <MaterialToolbar
        search={search}
        onSearchChange={setSearch}
        mediaKind={mediaKind}
        onMediaKindChange={(next) => {
          setMediaKind(next);
          setPage(0);
        }}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          setPage(0);
        }}
        trashMode={trashMode}
        onTrashModeChange={(next) => {
          setTrashMode(next);
          setFolderId(null);
          setPage(0);
        }}
        draftMode={draftMode}
        onDraftModeChange={(next) => {
          setDraftMode(next);
          setFolderId(null);
          setPage(0);
        }}
        peopleFilter={peopleFilter}
        onPeopleFilterChange={setPeopleFilter}
        members={members}
        currentUserId={actorId}
        modifiedFilter={modifiedFilter}
        onModifiedFilterChange={setModifiedFilter}
        folderId={folderId}
        tab={tab}
        onTabChange={(next) => {
          setTab(next);
          setTrashMode(false);
          setDraftMode(false);
          setFolderId(null);
          setPage(0);
        }}
        isClient={isClient}
        onShareVault={() => setShareOpen(true)}
        onUploaded={uploaded}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resourceTab={props.activeResourceTab}
        onResourceTabChange={props.onResourceTabChange}
        resourceCounts={props.resourceCounts}
        driveAction={
          !isClient && !trashMode && !draftMode && repository.workspace ? (
            <Popover open={driveOpen} onOpenChange={setDriveOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-1.5 rounded-lg border-border text-xs font-semibold shadow-2xs transition-all",
                    driveOpen
                      ? "border-brand-orange/60 bg-brand-orange/10 text-brand-orange"
                      : "bg-background text-foreground hover:border-brand-orange/40 hover:bg-brand-orange/5 hover:text-brand-orange",
                  )}
                >
                  <CloudDownload className="h-3.5 w-3.5 text-brand-orange" />
                  <span>{t("library.simple.fromDrive", "Đồng bộ từ Google Drive")}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      driveOpen && "rotate-180 text-brand-orange",
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={6}
                className="w-[360px] sm:w-[460px] rounded-xl border border-border/80 bg-card p-2.5 shadow-xl"
              >
                <CustomerDrivePanel
                  folderId={folderId ?? undefined}
                  showInlineProgress={false}
                  onImportStarted={() => setDriveOpen(false)}
                />
              </PopoverContent>
            </Popover>
          ) : null
        }
      />

      {/* Folder Section + Breadcrumbs (supports drag & drop file-to-folder) */}
      {repository.workspace && !trashMode && !draftMode && (
        <MaterialFolderSection
          workspaceId={repository.workspace}
          breadcrumbs={breadcrumbs}
          folders={folders}
          trashMode={trashMode}
          canCreate={canMutateFolders}
          canMutate={canMutateFolders}
          currentFolderId={folderId}
          onOpenFolder={(id) => {
            setFolderId(id);
            setPage(0);
            setSelected(null);
          }}
          onChanged={uploaded}
          onFileDroppedToFolder={handleFileDroppedToFolder}
        />
      )}

      {/* Trash Mode View */}
      {trashMode && repository.workspace ? (
        <div className="space-y-3">
          {(items.length > 0 || folders.length > 0) &&
            (currentRole === "OWNER" ||
              currentRole === "MANAGER" ||
              currentRole === "CREATOR") && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-2.5">
                <span className="text-xs text-muted-foreground">
                  {t(
                    "library.trash.quotaNotice",
                    "Xoá vĩnh viễn các mục trong thùng rác để giải phóng dung lượng lưu trữ.",
                  )}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={pending || repository.query.isFetching}
                  onClick={() => setPurgeTarget("all")}
                  className="h-8 gap-1.5 rounded-[4px] text-xs text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("library.trash.emptyTrash", "Dọn sạch thùng rác")}
                </Button>
              </div>
            )}

          {repository.query.isPending ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-border/70 bg-card">
              <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
            </div>
          ) : (
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
              folders={folders}
              busy={
                pending || repository.query.isFetching || search !== debounced
              }
              onBusyChange={setTrashBusy}
            />
          )}
        </div>
      ) : repository.forbidden || repository.query.isError ? (
        <div
          role="alert"
          className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            {t(
              `library.repository.${repository.forbidden || forbidden ? "forbidden" : "loadError"}`,
              "Không thể tải danh sách tệp trong kho",
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[4px]"
            onClick={() =>
              repository.forbidden
                ? repository.retryAccess()
                : void repository.refresh()
            }
          >
            {t("library.repository.retry", "Thử lại")}
          </Button>
        </div>
      ) : repository.query.isPending ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          aria-busy="true"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/70 bg-card p-3"
              aria-hidden="true"
            >
              <div className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-card p-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {draftMode
              ? t("library.trash.emptyDrafts", "Chưa có bản nháp AI nào")
              : search || mediaKind
                ? t("library.repository.emptySearch", "Không tìm thấy tệp phù hợp")
                : t(
                    "library.simple.emptyTitle",
                    "Chưa có tệp nào trong vị trí này",
                  )}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Tệp ({total})
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((material) => (
                <MaterialRepositoryCard
                  key={`${material.id}:${material.version}`}
                  material={material}
                  viewMode="grid"
                  canDelete={canDelete(material)}
                  canPermanentDelete={canPermanentDelete(material)}
                  canRestore={canRestore(material)}
                  canPromoteDraft={canPromoteDraft(material)}
                  canMove={canMoveMaterial(material)}
                  canRename={canRename(material)}
                  hideDraftBadge={draftMode}
                  onSelect={setSelected}
                  onDownload={(target) => void downloader.download(target)}
                  onRename={setRenameTarget}
                  onWatermark={setWatermarkTarget}
                  onDelete={(target) => setConfirm(target)}
                  onPermanentDelete={(target) => setPurgeTarget(target)}
                  onRestore={(target) => repository.restore.mutate(target)}
                  onPromoteDraft={(target) => repository.promote.mutate(target)}
                  onMoveRequest={(target) => setMovingMaterial(target)}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
              {items.map((material) => (
                <MaterialRepositoryCard
                  key={`${material.id}:${material.version}`}
                  material={material}
                  viewMode="list"
                  canDelete={canDelete(material)}
                  canPermanentDelete={canPermanentDelete(material)}
                  canRestore={canRestore(material)}
                  canPromoteDraft={canPromoteDraft(material)}
                  canMove={canMoveMaterial(material)}
                  canRename={canRename(material)}
                  hideDraftBadge={draftMode}
                  onSelect={setSelected}
                  onDownload={(target) => void downloader.download(target)}
                  onRename={setRenameTarget}
                  onWatermark={setWatermarkTarget}
                  onDelete={(target) => setConfirm(target)}
                  onPermanentDelete={(target) => setPurgeTarget(target)}
                  onRestore={(target) => repository.restore.mutate(target)}
                  onPromoteDraft={(target) => repository.promote.mutate(target)}
                  onMoveRequest={(target) => setMovingMaterial(target)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {t("library.simple.page", {
              page: page + 1,
              total: Math.ceil(total / 20),
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-[4px]"
              disabled={pending || page === 0 || repository.query.isFetching}
              onClick={() => setPage(page - 1)}
            >
              {t("library.trash.previous", "Trước")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-[4px]"
              disabled={
                pending ||
                (page + 1) * 20 >= total ||
                repository.query.isFetching
              }
              onClick={() => setPage(page + 1)}
            >
              {t("library.trash.next", "Tiếp")}
            </Button>
          </div>
        </div>
      )}

      {/* Quick Move-to-Folder Dialog */}
      {repository.workspace && movingMaterial && (
        <MaterialFolderPicker
          open={Boolean(movingMaterial)}
          onOpenChange={(open) => {
            if (!open) setMovingMaterial(null);
          }}
          workspaceId={repository.workspace}
          tab={tab}
          title={`Di chuyển "${movingMaterial.name}"`}
          confirmLabel="Chuyển tới đây"
          onConfirm={async (targetFolderId) => {
            await materialService.moveMaterial(
              repository.workspace!,
              movingMaterial.id,
              targetFolderId,
            );
            setMovingMaterial(null);
            uploaded();
            toast.success("Đã di chuyển tệp thành công");
          }}
        />
      )}

      {/* Client Cross-Workspace / Vault Import Modal */}
      {repository.workspace && isClient && (
        <ShareFromClientVaultModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          workspaceId={repository.workspace}
          onShared={uploaded}
        />
      )}

      {/* Watermark Dialog */}
      {watermarkTarget && repository.workspace && (
        <WatermarkStudioModal
          isOpen={Boolean(watermarkTarget)}
          onClose={() => setWatermarkTarget(null)}
          material={watermarkTarget}
          workspaceId={repository.workspace}
          onSuccess={() => {
            setWatermarkTarget(null);
            uploaded();
          }}
        />
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

      <RenameMaterialModal
        open={Boolean(renameTarget)}
        material={renameTarget}
        workspaceId={repository.workspace ?? ""}
        onClose={() => setRenameTarget(null)}
        onSuccess={uploaded}
      />

      <MediaDetailPanel
        workspaceId={repository.workspace}
        material={
          repository.forbidden || repository.query.isError ? null : selected
        }
        canEdit={Boolean(selected && canDelete(selected))}
        canDelete={Boolean(selected && canDelete(selected))}
        canPermanentDelete={Boolean(selected && canPermanentDelete(selected))}
        canRestore={Boolean(selected && canRestore(selected))}
        canPromoteDraft={Boolean(selected && canPromoteDraft(selected))}
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
        onWatermark={(latest) => setWatermarkTarget(latest)}
        onDelete={(latest) => {
          setConfirm(latest);
          setSelected(null);
        }}
        onPermanentDelete={(latest) => {
          setPurgeTarget(latest);
          setSelected(null);
        }}
        onRestore={(latest) => repository.restore.mutate(latest)}
        onWatermarked={uploaded}
      />
    </div>
  );
}
