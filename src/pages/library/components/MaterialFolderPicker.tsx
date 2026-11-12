import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Folder, FolderOpen, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

interface InlineProps {
  workspace: string;
  exclude?: string;
  onChoose: (id: string | null) => void;
  onCancel: () => void;
  open?: undefined;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  tab?: "WORKSPACE" | "CLIENT_VAULT";
  exclude?: string;
  title?: string;
  confirmLabel?: string;
  onConfirm: (targetFolderId: string | null) => Promise<void> | void;
}

export function MaterialFolderPicker(props: InlineProps | DialogProps) {
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);
  const [parent, setParent] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const isDialog = "open" in props && props.open !== undefined;
  const workspace = isDialog ? props.workspaceId : props.workspace;
  const exclude = props.exclude;
  const effectiveTab =
    role === "CLIENT"
      ? "CLIENT_VAULT"
      : isDialog && props.tab === "CLIENT_VAULT"
        ? "CLIENT_VAULT"
        : "LIBRARY";

  const query = useQuery({
    queryKey: [
      "material-folder-picker",
      workspace,
      actor,
      role,
      effectiveTab,
      parent,
    ],
    enabled: isDialog ? Boolean(props.open && workspace) : Boolean(workspace),
    queryFn: ({ signal }) =>
      materialService.browse(
        workspace,
        {
          page: 0,
          size: 1,
          search: "",
          deleted: false,
          folderId: parent,
          tab: effectiveTab,
        },
        signal,
      ),
    retry: false,
  });

  const folders = (query.data?.folders ?? []).filter((f) => f.id !== exclude);
  const breadcrumbs = query.data?.breadcrumbs ?? [];

  const handleConfirm = async () => {
    const targetId = parent ?? null;
    if (isDialog) {
      setSubmitting(true);
      try {
        await props.onConfirm(targetId);
      } finally {
        setSubmitting(false);
      }
    } else {
      props.onChoose(targetId);
    }
  };

  const handleCancel = () => {
    if (isDialog) {
      props.onOpenChange(false);
    } else {
      props.onCancel();
    }
  };

  const content = (
    <div className="space-y-3">
      {/* Breadcrumb bar */}
      <nav
        aria-label="Đường dẫn thư mục đích"
        className="flex flex-wrap items-center gap-1 rounded-xl border border-border/70 bg-muted/30 px-2.5 py-2 text-xs"
      >
        <button
          type="button"
          onClick={() => setParent(undefined)}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors ${
            !parent
              ? "bg-brand-orange text-white font-semibold shadow-2xs"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Thư mục gốc</span>
        </button>

        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <span key={crumb.id} className="inline-flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setParent(crumb.id)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
                  isLast
                    ? "bg-brand-orange text-white font-semibold shadow-2xs"
                    : "text-foreground hover:bg-muted font-medium"
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span className="max-w-[140px] truncate">{crumb.name}</span>
              </button>
            </span>
          );
        })}
      </nav>

      {/* Folder list */}
      <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-border/70 bg-card p-2">
        {query.isPending ? (
          <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-orange" />
            Đang tải thư mục...
          </div>
        ) : query.isError ? (
          <p className="py-6 text-center text-xs text-destructive">
            Không thể tải danh sách thư mục
          </p>
        ) : folders.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Không có thư mục con nào tại đây. Nhấn xác nhận để chuyển vào vị trí hiện tại.
          </p>
        ) : (
          folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setParent(folder.id)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:border-brand-orange/30 hover:bg-brand-orange/10 hover:text-brand-orange"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Folder className="h-4 w-4 shrink-0 text-brand-orange fill-brand-orange/20" />
                <span className="truncate">{folder.name}</span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Mở →
              </span>
            </button>
          ))
        )}
      </div>

      {!isDialog && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 rounded-lg text-xs text-foreground"
          >
            Huỷ
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={
              query.isPending ||
              query.isError ||
              parent === exclude ||
              submitting
            }
            onClick={() => void handleConfirm()}
            className="h-8 rounded-lg bg-brand-orange px-3.5 text-xs font-semibold text-white hover:bg-brand-orange/90"
          >
            Chuyển tới đây
          </Button>
        </div>
      )}
    </div>
  );

  if (isDialog) {
    return (
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">
              {props.title ?? "Chọn thư mục đích"}
            </DialogTitle>
          </DialogHeader>
          {content}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="rounded-xl text-xs"
            >
              Huỷ
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                query.isPending ||
                query.isError ||
                parent === exclude ||
                submitting
              }
              onClick={() => void handleConfirm()}
              className="rounded-xl bg-brand-orange px-4 text-xs font-semibold text-white hover:bg-brand-orange/90"
            >
              {submitting && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {props.confirmLabel ?? "Chuyển tới đây"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <section
      className="rounded-xl border border-border/80 bg-muted/20 p-3"
      aria-label="Chọn thư mục đích"
    >
      {content}
    </section>
  );
}
