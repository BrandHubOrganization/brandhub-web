import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  ChevronRight,
  FileText,
  Film,
  Folder,
  FolderOpen,
  FolderSync,
  Home,
  Image as ImageIcon,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { materialService } from "@/services/materialService";
import { workspaceService } from "@/services/workspaceService";
import { formatBytes } from "./MaterialRepositoryCard";

const PERSONAL_VAULT_KEY = "PERSONAL_VAULT";

export function ShareFromClientVaultModal({
  open,
  onOpenChange,
  workspaceId,
  onShared,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onShared: () => void;
}) {
  const [source, setSource] = useState<string>(PERSONAL_VAULT_KEY);
  const [folderId, setFolderId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setFolderId(undefined);
      setSearch("");
      setSelectedFolderIds([]);
      setSelectedMaterialIds([]);
    }
  }, [open]);

  const workspacesQuery = useQuery({
    queryKey: ["client-share-workspaces", workspaceId],
    enabled: open,
    queryFn: () => workspaceService.list(),
    select: (res) =>
      (res.data.data ?? []).filter(
        (w) => w.id !== workspaceId && w.myRole === "CLIENT",
      ),
  });

  const browserQuery = useQuery({
    queryKey: ["client-vault-share-browser", source, folderId, search],
    enabled: open && Boolean(source),
    queryFn: ({ signal }) => {
      if (source === PERSONAL_VAULT_KEY) {
        return materialService.browseClientVault(
          {
            folderId,
            search: search.trim() || undefined,
            page: 0,
            size: 50,
          },
          signal,
        );
      }
      return materialService.browse(
        source,
        {
          tab: "CLIENT_VAULT",
          folderId,
          page: 0,
          size: 50,
          search: search.trim(),
          deleted: false,
        },
        signal,
      );
    },
  });

  const folders = browserQuery.data?.folders ?? [];
  const files = browserQuery.data?.files.items ?? [];
  const breadcrumbs = browserQuery.data?.breadcrumbs ?? [];
  const totalSelected = selectedFolderIds.length + selectedMaterialIds.length;
  const hasAnyContent = folders.length > 0 || files.length > 0;

  const toggleFolder = (id: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAllCurrentView = () => {
    const allFolderIds = folders.map((f) => f.id);
    const allFileIds = files.map((f) => f.id);
    const allSelected =
      allFolderIds.every((id) => selectedFolderIds.includes(id)) &&
      allFileIds.every((id) => selectedMaterialIds.includes(id));

    if (allSelected) {
      setSelectedFolderIds((prev) =>
        prev.filter((id) => !allFolderIds.includes(id)),
      );
      setSelectedMaterialIds((prev) =>
        prev.filter((id) => !allFileIds.includes(id)),
      );
    } else {
      setSelectedFolderIds((prev) =>
        Array.from(new Set([...prev, ...allFolderIds])),
      );
      setSelectedMaterialIds((prev) =>
        Array.from(new Set([...prev, ...allFileIds])),
      );
    }
  };

  const handleImport = async (shareAll = false) => {
    setBusy(true);
    try {
      const sourceWorkspaceId =
        source === PERSONAL_VAULT_KEY ? null : source;
      await materialService.shareClientVaultToWorkspace(
        workspaceId,
        shareAll ? [] : selectedFolderIds,
        sourceWorkspaceId,
        shareAll,
        shareAll ? [] : selectedMaterialIds,
      );
      setSelectedFolderIds([]);
      setSelectedMaterialIds([]);
      onShared();
      onOpenChange(false);
      toast.success(
        shareAll
          ? "Đã import toàn bộ tài nguyên sang Workspace này"
          : `Đã import ${totalSelected} mục sang Workspace này`,
      );
    } catch (e) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể import tài nguyên sang Workspace này",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl [&>[data-slot=sheet-close]]:rounded-lg [&>[data-slot=sheet-close]]:p-1 [&>[data-slot=sheet-close]]:text-white [&>[data-slot=sheet-close]]:opacity-85 [&>[data-slot=sheet-close]]:hover:bg-white/10 [&>[data-slot=sheet-close]]:hover:opacity-100"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/80 bg-[#16171B] px-6 py-4 text-left text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white">
              <FolderSync className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-white">
                Import tệp & thư mục sang Workspace
              </SheetTitle>
              <SheetDescription className="text-xs text-zinc-400">
                Chọn thư mục hoặc từng tệp từ Kho cá nhân hoặc Workspace khác của bạn.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Controls Strip */}
        <div className="space-y-3 border-b border-border/70 bg-muted/20 px-6 py-3.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                Nguồn tài nguyên
              </label>
              <Select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setFolderId(undefined);
                  setSelectedFolderIds([]);
                  setSelectedMaterialIds([]);
                }}
                className="h-9 rounded-xl bg-background text-xs font-medium text-foreground"
              >
                <option value={PERSONAL_VAULT_KEY}>
                  Kho lưu trữ cá nhân của tôi (Tất cả)
                </option>
                {(workspacesQuery.data ?? []).map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    Workspace: {ws.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                Tìm kiếm tệp
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên tệp..."
                  className="h-9 rounded-xl bg-background pl-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Breadcrumb navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setFolderId(undefined)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors ${
                  !folderId
                    ? "bg-brand-orange/15 text-brand-orange font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Home className="h-3 w-3" />
                <span>Thư mục gốc</span>
              </button>

              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span
                    key={crumb.id}
                    className="inline-flex items-center gap-1"
                  >
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setFolderId(crumb.id)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
                        isLast
                          ? "bg-brand-orange/15 text-brand-orange font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <FolderOpen className="h-3 w-3" />
                      <span className="max-w-[140px] truncate">
                        {crumb.name}
                      </span>
                    </button>
                  </span>
                );
              })}
            </div>

            {hasAnyContent && (
              <button
                type="button"
                onClick={toggleSelectAllCurrentView}
                className="text-xs font-semibold text-brand-orange hover:underline"
              >
                Chọn / bỏ chọn trang này
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Folders & Files List */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {browserQuery.isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
            </div>
          ) : !hasAnyContent ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-6 text-center">
              <Folder className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-xs font-semibold text-foreground">
                Không có thư mục hoặc tệp nào ở vị trí này
              </p>
              <p className="text-[11px] text-muted-foreground">
                Hãy thử đổi nguồn tài nguyên hoặc quay lại thư mục gốc.
              </p>
            </div>
          ) : (
            <>
              {/* Folders section */}
              {folders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                    Thư mục ({folders.length})
                  </p>
                  <div className="space-y-1.5">
                    {folders.map((folder) => {
                      const checked = selectedFolderIds.includes(folder.id);
                      return (
                        <div
                          key={folder.id}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                            checked
                              ? "border-brand-orange bg-brand-orange/10 text-foreground"
                              : "border-border/80 bg-card hover:bg-muted/40 text-foreground"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleFolder(folder.id)}
                            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                          >
                            <div
                              className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                                checked
                                  ? "border-brand-orange bg-brand-orange text-white"
                                  : "border-muted-foreground/40 bg-background"
                              }`}
                            >
                              {checked && <Check className="h-3 w-3" />}
                            </div>
                            <Folder className="h-4 w-4 shrink-0 text-brand-orange fill-brand-orange/20" />
                            <span className="truncate text-xs font-semibold text-foreground">
                              {folder.name}
                            </span>
                          </button>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setFolderId(folder.id)}
                            className="h-7 rounded-lg px-2.5 text-xs font-semibold text-brand-orange hover:bg-brand-orange/15 hover:text-brand-orange"
                          >
                            Mở thư mục →
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Individual Files section */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                    Tệp lẻ ({files.length})
                  </p>
                  <div className="space-y-1.5">
                    {files.map((file) => {
                      const checked = selectedMaterialIds.includes(file.id);
                      const isImage =
                        file.mediaKind === "IMAGE" ||
                        file.mimeType?.startsWith("image/");
                      const isVideo =
                        file.mediaKind === "VIDEO" ||
                        file.mimeType?.startsWith("video/");

                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => toggleMaterial(file.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                            checked
                              ? "border-brand-orange bg-brand-orange/10 text-foreground"
                              : "border-border/80 bg-card hover:bg-muted/40 text-foreground"
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <div
                              className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                                checked
                                  ? "border-brand-orange bg-brand-orange text-white"
                                  : "border-muted-foreground/40 bg-background"
                              }`}
                            >
                              {checked && <Check className="h-3 w-3" />}
                            </div>

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                              {isImage && file.url ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : isVideo ? (
                                <Film className="h-4 w-4 text-brand-orange" />
                              ) : isImage ? (
                                <ImageIcon className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {file.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {formatBytes(file.fileSize)}
                              </p>
                            </div>
                          </div>

                          {checked && (
                            <span className="shrink-0 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold text-white">
                              Đã chọn
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t border-border/80 bg-card px-6 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Đã chọn:{" "}
              <strong className="text-foreground">
                {selectedFolderIds.length} thư mục, {selectedMaterialIds.length}{" "}
                tệp
              </strong>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {hasAnyContent && !folderId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void handleImport(true)}
                  className="h-9 rounded-xl text-xs font-semibold text-foreground hover:border-brand-orange hover:text-brand-orange"
                >
                  Import toàn bộ nguồn này
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                disabled={busy || totalSelected === 0}
                onClick={() => void handleImport(false)}
                className="h-9 gap-1.5 rounded-xl bg-brand-orange px-4 text-xs font-semibold text-white hover:bg-brand-orange/90"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Import {totalSelected > 0 ? `(${totalSelected})` : ""}</span>
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
