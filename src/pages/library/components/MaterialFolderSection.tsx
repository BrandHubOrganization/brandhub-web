import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  Home,
  MoreVertical,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { materialService } from "@/services/materialService";
import type { MaterialFolderItem } from "@/types/material";

export const DRAG_MATERIAL_MIME = "application/x-brandhub-material-id";
export const DRAG_MATERIAL_NAME_MIME = "application/x-brandhub-material-name";

export function MaterialFolderSection({
  workspaceId,
  breadcrumbs,
  folders,
  trashMode,
  canCreate = true,
  canMutate = true,
  currentFolderId,
  viewMode = "grid",
  ownerNames,
  listChildren,
  onOpenFolder,
  onChanged,
  onFileDroppedToFolder,
}: {
  workspaceId: string;
  breadcrumbs: MaterialFolderItem[];
  folders: MaterialFolderItem[];
  trashMode: boolean;
  canCreate?: boolean;
  canMutate?: boolean;
  currentFolderId: string | null;
  viewMode?: "grid" | "list";
  ownerNames?: Map<string, string>;
  listChildren?: React.ReactNode;
  onOpenFolder: (id: string | null) => void;
  onChanged: () => void;
  onFileDroppedToFolder?: (
    materialId: string,
    targetFolderId: string | null,
    targetFolderName: string,
  ) => Promise<void>;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await materialService.createFolder(
        workspaceId,
        name.trim(),
        currentFolderId ?? undefined,
      );
      setName("");
      setIsCreating(false);
      onChanged();
      toast.success("Đã tạo thư mục mới");
    } catch (e) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể tạo thư mục",
      );
    } finally {
      setBusy(false);
    }
  };

  const commitRename = async (folderId: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    setBusy(true);
    try {
      await materialService.renameFolder(
        workspaceId,
        folderId,
        renameValue.trim(),
      );
      setRenamingId(null);
      onChanged();
      toast.success("Đã đổi tên thư mục");
    } catch (e: unknown) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể đổi tên thư mục",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDragOver = (
    event: React.DragEvent,
    targetKey: string,
  ) => {
    if (!event.dataTransfer.types.includes(DRAG_MATERIAL_MIME)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    if (dragOverTargetId !== targetKey) {
      setDragOverTargetId(targetKey);
    }
  };

  const handleDragLeave = (event: React.DragEvent, targetKey: string) => {
    event.stopPropagation();
    if (dragOverTargetId === targetKey) {
      setDragOverTargetId(null);
    }
  };

  const handleDropOnFolder = async (
    event: React.DragEvent,
    targetFolderId: string | null,
    targetFolderName: string,
  ) => {
    const materialId = event.dataTransfer.getData(DRAG_MATERIAL_MIME);
    setDragOverTargetId(null);
    if (!materialId) return;
    event.preventDefault();
    event.stopPropagation();

    if (targetFolderId === currentFolderId) {
      return;
    }

    if (onFileDroppedToFolder) {
      await onFileDroppedToFolder(materialId, targetFolderId, targetFolderName);
      return;
    }

    try {
      await materialService.moveMaterial(workspaceId, materialId, targetFolderId);
      onChanged();
      toast.success(`Đã chuyển tệp vào "${targetFolderName}"`);
    } catch (e) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể di chuyển tệp vào thư mục này",
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Inline Breadcrumb Trail (only displayed when navigating inside subfolders) */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Đường dẫn thư mục"
          className="flex flex-wrap items-center gap-1.5 px-1 text-xs"
        >
          <button
            type="button"
            onClick={() => onOpenFolder(null)}
            onDragOver={(e) => handleDragOver(e, "ROOT")}
            onDragLeave={(e) => handleDragLeave(e, "ROOT")}
            onDrop={(e) =>
              void handleDropOnFolder(e, null, "Kho lưu trữ gốc")
            }
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              dragOverTargetId === "ROOT"
                ? "bg-brand-orange/15 font-bold text-brand-orange ring-2 ring-brand-orange"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Nhấn để về thư mục gốc hoặc kéo thả tệp vào đây"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Kho của tôi</span>
          </button>

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const isDragTarget = dragOverTargetId === `crumb-${crumb.id}`;
            return (
              <span key={crumb.id} className="inline-flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                <button
                  type="button"
                  onClick={() => onOpenFolder(crumb.id)}
                  onDragOver={(e) => handleDragOver(e, `crumb-${crumb.id}`)}
                  onDragLeave={(e) => handleDragLeave(e, `crumb-${crumb.id}`)}
                  onDrop={(e) =>
                    void handleDropOnFolder(e, crumb.id, crumb.name)
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors ${
                    isDragTarget
                      ? "bg-brand-orange/15 font-bold text-brand-orange ring-2 ring-brand-orange"
                      : isLast
                        ? "bg-brand-orange/10 font-semibold text-brand-orange"
                        : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="max-w-[180px] truncate">{crumb.name}</span>
                </button>
              </span>
            );
          })}
        </nav>
      )}

      {/* Folder Section: Header with "Thư mục (N)" */}
      {(!trashMode && (canCreate || folders.length > 0 || (viewMode === "list" && Boolean(listChildren)))) && (
        <div className="space-y-2">
          {viewMode === "grid" && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                Thư mục ({folders.length})
              </span>
            </div>
          )}

          {viewMode === "list" ? (
            /* ── UNIFIED LIST VIEW (Folders on top, Files below) ── */
            <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
              {/* List header */}
              <div className="flex items-center gap-3 bg-muted/30 px-3.5 py-2.5 text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                <span className="w-4 shrink-0" />
                <span className="w-9 shrink-0" />
                <span className="min-w-0 flex-1 whitespace-nowrap">Tên</span>
                <span className="hidden w-[130px] shrink-0 whitespace-nowrap sm:block">Chủ sở hữu</span>
                <span className="hidden w-[110px] shrink-0 whitespace-nowrap sm:block">Ngày sửa đổi</span>
                <span className="hidden w-[90px] shrink-0 text-right whitespace-nowrap sm:block">Kích thước</span>
                <span className="w-8 shrink-0" />
              </div>

              {folders.map((folder) => {
                const isDropOver = dragOverTargetId === `folder-${folder.id}`;
                const isRenaming = renamingId === folder.id;
                const ownerName =
                  folder.createdByName ||
                  (folder.createdBy ? ownerNames?.get(folder.createdBy) : undefined) ||
                  "—";
                const modifiedSource = folder.updatedAt || folder.createdAt;
                const modifiedDate = modifiedSource
                  ? new Date(modifiedSource).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "—";

                return (
                  <div
                    key={folder.id}
                    onDragOver={
                      !trashMode && canMutate
                        ? (e) => handleDragOver(e, `folder-${folder.id}`)
                        : undefined
                    }
                    onDragLeave={
                      !trashMode && canMutate
                        ? (e) => handleDragLeave(e, `folder-${folder.id}`)
                        : undefined
                    }
                    onDrop={
                      !trashMode && canMutate
                        ? (e) =>
                            void handleDropOnFolder(e, folder.id, folder.name)
                        : undefined
                    }
                    className={`group flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                      isDropOver
                        ? "bg-brand-orange/10"
                        : "bg-card hover:bg-muted/40"
                    }`}
                  >
                    {/* Spacer for drag handle column */}
                    <div className="w-4 shrink-0" />

                    {/* Folder icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isDropOver
                          ? "bg-brand-orange text-white"
                          : "bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white"
                      }`}
                    >
                      <Folder className="h-4 w-4 fill-current" />
                    </div>

                    {/* Name */}
                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void commitRename(folder.id);
                              if (e.key === "Escape") setRenamingId(null);
                            }}
                            onBlur={() => void commitRename(folder.id)}
                            className="h-7 rounded-[4px] text-xs"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={trashMode}
                          onClick={() => onOpenFolder(folder.id)}
                          className="text-left"
                        >
                          <p className="truncate text-xs font-semibold text-foreground group-hover:underline">
                            {folder.name}
                          </p>
                          {isDropOver && (
                            <p className="text-[10px] font-semibold text-brand-orange">
                              Thả tệp để chuyển vào đây
                            </p>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Owner, Modified date, Size */}
                    <span className="hidden w-[130px] shrink-0 truncate text-xs text-muted-foreground sm:block">
                      {ownerName}
                    </span>
                    <span className="hidden w-[110px] shrink-0 text-xs tabular-nums text-muted-foreground sm:block">
                      {modifiedDate}
                    </span>
                    <span className="hidden w-[90px] shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:block">
                      —
                    </span>

                    {/* Menu */}
                    <div className="w-8 shrink-0 text-right">
                      {canMutate && !isRenaming && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-lg p-1 text-muted-foreground opacity-75 transition-colors hover:bg-muted hover:text-foreground group-hover:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border/80 bg-card p-1.5 shadow-xl">
                            {trashMode ? (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    void materialService
                                      .restoreFolder(workspaceId, folder.id)
                                      .then(() => {
                                          onChanged();
                                          toast.success("Đã khôi phục thư mục");
                                        })
                                        .catch(() =>
                                          toast.error("Không thể khôi phục thư mục"),
                                        );
                                    }}
                                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 focus:bg-muted/80"
                                  >
                                    <RotateCcw className="size-3.5 text-muted-foreground" />
                                    <span>Khôi phục</span>
                                  </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    void materialService
                                      .purgeFolder(workspaceId, folder.id)
                                      .then(() => {
                                        onChanged();
                                        toast.success("Đã xoá vĩnh viễn thư mục");
                                      })
                                      .catch((e) =>
                                        toast.error(
                                          (
                                            e as {
                                              response?: {
                                                data?: { message?: string };
                                              };
                                            }
                                          )?.response?.data?.message ??
                                            "Không thể xoá vĩnh viễn thư mục",
                                        ),
                                      );
                                  }}
                                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 className="size-3.5 text-destructive" />
                                  <span>Xoá vĩnh viễn</span>
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setRenamingId(folder.id);
                                    setRenameValue(folder.name);
                                  }}
                                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 focus:bg-muted/80"
                                >
                                  <Pencil className="size-3.5 text-muted-foreground" />
                                  <span>Đổi tên</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="-mx-1 my-1 bg-border/60" />
                                <DropdownMenuItem
                                  onSelect={() => {
                                    void materialService
                                      .deleteFolder(workspaceId, folder.id)
                                      .then(() => {
                                        onChanged();
                                        toast.success(
                                          "Đã chuyển thư mục vào thùng rác",
                                        );
                                      })
                                      .catch(() =>
                                        toast.error("Không thể xoá thư mục"),
                                      );
                                  }}
                                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 className="size-3.5 text-destructive" />
                                  <span>Chuyển vào thùng rác</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* New Folder row in list view */}
              {!trashMode && canCreate && (
                isCreating ? (
                  <div className="flex items-center gap-3 bg-brand-orange/10 px-3.5 py-2.5">
                    <div className="w-4 shrink-0" />
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                      <FolderPlus className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Input
                        autoFocus
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void create();
                          if (event.key === "Escape") {
                            setIsCreating(false);
                            setName("");
                          }
                        }}
                        placeholder="Tên thư mục..."
                        className="h-7 max-w-[260px] rounded-lg border-none bg-transparent text-xs shadow-none focus-visible:ring-0 focus-visible:border-none"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy || !name.trim()}
                      onClick={() => void create()}
                      className="h-7 shrink-0 rounded-lg bg-brand-orange px-2.5 text-xs font-semibold text-white hover:bg-brand-orange/90"
                    >
                      Tạo
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsCreating(false);
                        setName("");
                      }}
                      className="h-7 shrink-0 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Huỷ
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="group flex w-full items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-brand-orange/5 hover:text-brand-orange"
                  >
                    <div className="w-4 shrink-0" />
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand-orange/10 group-hover:text-brand-orange">
                      <FolderPlus className="h-4 w-4" />
                    </div>
                    <span className="font-semibold">Thư mục mới</span>
                  </button>
                )
              )}

              {/* File rows below folders in unified list view */}
              {listChildren}
            </div>
          ) : (
            /* ── GRID VIEW (existing) ── */
            <div className="flex flex-wrap items-center gap-2.5">
              {folders.map((folder) => {
                const isDropOver = dragOverTargetId === `folder-${folder.id}`;
                const isRenaming = renamingId === folder.id;

                return (
                  <div
                    key={folder.id}
                    onDragOver={
                      !trashMode && canMutate
                        ? (e) => handleDragOver(e, `folder-${folder.id}`)
                        : undefined
                    }
                    onDragLeave={
                      !trashMode && canMutate
                        ? (e) => handleDragLeave(e, `folder-${folder.id}`)
                        : undefined
                    }
                    onDrop={
                      !trashMode && canMutate
                        ? (e) =>
                            void handleDropOnFolder(e, folder.id, folder.name)
                        : undefined
                    }
                    className={`group relative flex w-full sm:w-[260px] md:w-[280px] items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all duration-150 ${
                      isDropOver
                        ? "border-brand-orange bg-brand-orange/10 ring-1 ring-brand-orange shadow-xs"
                        : "border-border/80 bg-card hover:border-brand-orange/50 hover:bg-muted/30 shadow-2xs"
                    }`}
                  >
                  {isRenaming ? (
                    <div className="flex flex-1 items-center gap-1.5">
                      <Folder className="h-4 w-4 shrink-0 text-brand-orange" />
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void commitRename(folder.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={() => void commitRename(folder.id)}
                        className="h-7 rounded-[4px] text-xs"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={trashMode}
                      onClick={() => onOpenFolder(folder.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isDropOver
                            ? "bg-brand-orange text-white"
                            : "bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white"
                        }`}
                      >
                        <Folder className="h-4 w-4 fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground group-hover:underline">
                          {folder.name}
                        </p>
                        {isDropOver && (
                          <p className="text-[10px] font-semibold text-brand-orange">
                            Thả tệp để chuyển vào đây
                          </p>
                        )}
                      </div>
                    </button>
                  )}

                  {canMutate && !isRenaming && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg p-1 text-muted-foreground opacity-75 transition-colors hover:bg-muted hover:text-foreground group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border/80 bg-card p-1.5 shadow-xl">
                        {trashMode ? (
                          <>
                            <DropdownMenuItem
                              onSelect={() => {
                                void materialService
                                  .restoreFolder(workspaceId, folder.id)
                                  .then(() => {
                                      onChanged();
                                      toast.success("Đã khôi phục thư mục");
                                    })
                                    .catch(() =>
                                      toast.error("Không thể khôi phục thư mục"),
                                    );
                                }}
                                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 focus:bg-muted/80"
                              >
                                <RotateCcw className="size-3.5 text-muted-foreground" />
                                <span>Khôi phục</span>
                              </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                void materialService
                                  .purgeFolder(workspaceId, folder.id)
                                  .then(() => {
                                    onChanged();
                                    toast.success("Đã xoá vĩnh viễn thư mục");
                                  })
                                  .catch((e) =>
                                    toast.error(
                                      (
                                        e as {
                                          response?: {
                                            data?: { message?: string };
                                          };
                                        }
                                      )?.response?.data?.message ??
                                        "Không thể xoá vĩnh viễn thư mục",
                                    ),
                                  );
                              }}
                              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                              <span>Xoá vĩnh viễn</span>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onSelect={() => {
                                setRenamingId(folder.id);
                                setRenameValue(folder.name);
                              }}
                              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 focus:bg-muted/80"
                            >
                              <Pencil className="size-3.5 text-muted-foreground" />
                              <span>Đổi tên</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="-mx-1 my-1 bg-border/60" />
                            <DropdownMenuItem
                              onSelect={() => {
                                void materialService
                                  .deleteFolder(workspaceId, folder.id)
                                  .then(() => {
                                    onChanged();
                                    toast.success(
                                      "Đã chuyển thư mục vào thùng rác",
                                    );
                                  })
                                  .catch(() =>
                                    toast.error("Không thể xoá thư mục"),
                                  );
                              }}
                              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                              <span>Chuyển vào thùng rác</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                );
              })}

              {/* New Folder Button / Inline Form */}
              {!trashMode && canCreate && (
                isCreating ? (
                  <div className="flex h-[52px] w-full sm:w-[260px] md:w-[280px] items-center gap-1.5 rounded-xl bg-brand-orange/10 px-3 shadow-xs">
                    <FolderPlus className="h-4 w-4 shrink-0 text-brand-orange" />
                    <Input
                      autoFocus
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void create();
                        if (event.key === "Escape") {
                          setIsCreating(false);
                          setName("");
                        }
                      }}
                      placeholder="Tên thư mục..."
                      className="h-7 min-w-0 flex-1 rounded-lg border-none bg-transparent text-xs shadow-none focus-visible:ring-0 focus-visible:border-none"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy || !name.trim()}
                      onClick={() => void create()}
                      className="h-7 shrink-0 rounded-lg bg-brand-orange px-2.5 text-xs font-semibold text-white hover:bg-brand-orange/90"
                    >
                      Tạo
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsCreating(false);
                        setName("");
                      }}
                      className="h-7 shrink-0 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Huỷ
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="group flex h-[52px] w-full sm:w-auto items-center gap-2 rounded-xl border border-dashed border-border/90 bg-muted/20 px-3.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:border-brand-orange/60 hover:bg-brand-orange/5 hover:text-brand-orange shadow-2xs"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand-orange/10 group-hover:text-brand-orange">
                      <FolderPlus className="h-4 w-4" />
                    </div>
                    <span className="whitespace-nowrap font-semibold">Thư mục mới</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
