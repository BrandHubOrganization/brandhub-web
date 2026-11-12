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
      {/* Breadcrumb Bar + New Folder Button (Google Drive style) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card px-3.5 py-2.5 shadow-2xs">
        <nav
          aria-label="Đường dẫn thư mục"
          className="flex flex-wrap items-center gap-1 text-xs"
        >
          <button
            type="button"
            onClick={() => onOpenFolder(null)}
            onDragOver={(e) => handleDragOver(e, "ROOT")}
            onDragLeave={(e) => handleDragLeave(e, "ROOT")}
            onDrop={(e) =>
              void handleDropOnFolder(e, null, "Kho lưu trữ gốc")
            }
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
              dragOverTargetId === "ROOT"
                ? "ring-2 ring-brand-orange bg-brand-orange/15 text-brand-orange font-bold"
                : currentFolderId === null
                  ? "bg-brand-orange/10 text-brand-orange font-semibold"
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
              <span key={crumb.id} className="inline-flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                <button
                  type="button"
                  onClick={() => onOpenFolder(crumb.id)}
                  onDragOver={(e) => handleDragOver(e, `crumb-${crumb.id}`)}
                  onDragLeave={(e) => handleDragLeave(e, `crumb-${crumb.id}`)}
                  onDrop={(e) =>
                    void handleDropOnFolder(e, crumb.id, crumb.name)
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                    isDragTarget
                      ? "ring-2 ring-brand-orange bg-brand-orange/15 text-brand-orange font-bold"
                      : isLast
                        ? "bg-brand-orange/10 text-brand-orange font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="max-w-[180px] truncate">{crumb.name}</span>
                </button>
              </span>
            );
          })}
        </nav>

        {!trashMode && canCreate && (
          <div className="flex items-center gap-2">
            {isCreating ? (
              <div className="flex items-center gap-1.5">
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
                  placeholder="Nhập tên thư mục..."
                  className="h-8 w-48 rounded-lg text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={busy || !name.trim()}
                  onClick={() => void create()}
                  className="h-8 rounded-lg bg-brand-orange px-3 text-xs font-semibold text-white hover:bg-brand-orange/90"
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
                  className="h-8 rounded-lg px-2 text-xs"
                >
                  Huỷ
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsCreating(true)}
                className="h-8 gap-1.5 rounded-xl text-xs font-semibold hover:border-brand-orange/50 hover:text-brand-orange"
              >
                <FolderPlus className="h-3.5 w-3.5 text-brand-orange" />
                <span>Thư mục mới</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Google Drive-style Folder Pill Cards */}
      {folders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Thư mục ({folders.length}) • Kéo tệp thả vào thư mục để di chuyển
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                  className={`group relative flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all duration-150 ${
                    isDropOver
                      ? "scale-[1.02] border-brand-orange bg-brand-orange/10 ring-2 ring-brand-orange shadow-md"
                      : "border-border/80 bg-card hover:border-brand-orange/40 hover:bg-muted/30 hover:shadow-xs"
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
                        className="h-7 text-xs"
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
                        <p className="truncate text-xs font-semibold text-foreground">
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
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
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
                              className="gap-2 text-xs"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
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
                              className="gap-2 text-xs text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
                              className="gap-2 text-xs"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Đổi tên</span>
                            </DropdownMenuItem>
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
                              className="gap-2 text-xs text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
          </div>
        </div>
      )}
    </div>
  );
}
