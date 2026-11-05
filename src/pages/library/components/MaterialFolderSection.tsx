import { isAxiosError } from "axios";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronRight, Folder, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { materialService } from "@/services/materialService";
import { MaterialFolderPicker } from "@/pages/library/components/MaterialFolderPicker";
import type { MaterialFolderItem } from "@/types/material";
export function MaterialFolderSection({
  workspace,
  folders,
  breadcrumbs,
  folderId,
  onOpen,
  mutable,
  deleted = false,
  showFiles = true,
}: {
  workspace: string;
  folders: MaterialFolderItem[];
  breadcrumbs: MaterialFolderItem[];
  folderId?: string;
  onOpen: (id?: string) => void;
  mutable: boolean;
  deleted?: boolean;
  showFiles?: boolean;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [editing, setEditing] = useState<MaterialFolderItem | null>();
  const [moving, setMoving] = useState<MaterialFolderItem>();
  const [deleting, setDeleting] = useState<MaterialFolderItem>();
  const [purging, setPurging] = useState<MaterialFolderItem>();
  const [name, setName] = useState("");
  const label = (key: string) => t(`materials.repository.${key}`);
  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      if (purging) toast.success(t("library.trash.folderPurged"));
      setPurging(undefined);
      setDeleting(undefined);
      setEditing(undefined);
      setMoving(undefined);
      void client.invalidateQueries({ queryKey: ["materials"] });
      void client.invalidateQueries({ queryKey: ["material-folder-picker"] });
    },
    onError: (error) =>
      toast.error(
        isAxiosError(error) &&
          error.response?.data?.error?.code === "MATERIAL_REFERENCED"
          ? t("library.trash.folderPurgeBlocked")
          : label("failed"),
      ),
  });
  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {folderId ? (
          <nav
            aria-label={label("breadcrumb")}
            className="flex flex-wrap items-center gap-1 text-xs"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-medium"
              onClick={() => onOpen()}
            >
              {label("root")}
            </Button>
            {breadcrumbs.map((folder) => (
              <span key={folder.id} className="flex min-w-0 items-center">
                <ChevronRight className="text-muted-foreground size-3 shrink-0" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 max-w-44 truncate px-2 text-xs font-medium"
                  onClick={() => onOpen(folder.id)}
                >
                  {folder.name}
                </Button>
              </span>
            ))}
          </nav>
        ) : (
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {folders.length ? label("folders") : ""}
          </h3>
        )}

        {mutable && !deleted && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
            onClick={() => {
              setEditing(null);
              setName("");
            }}
          >
            <Plus className="size-3.5" />
            {label("createFolder")}
          </Button>
        )}
      </div>

      {editing !== undefined && (
        <form
          className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-2.5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate(() =>
              editing
                ? materialService.renameFolder(workspace, editing.id, name)
                : materialService.createFolder(workspace, name, folderId),
            );
          }}
        >
          <Input
            aria-label={label("folderName")}
            placeholder={label("folderName")}
            autoFocus
            required
            maxLength={255}
            className="h-8 max-w-xs text-xs"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={mutation.isPending}
          >
            {label("save")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setEditing(undefined)}
          >
            {label("cancel")}
          </Button>
        </form>
      )}

      {moving && (
        <MaterialFolderPicker
          workspace={workspace}
          exclude={moving.id}
          onChoose={(target) =>
            mutation.mutate(() =>
              materialService.moveFolder(workspace, moving.id, target),
            )
          }
          onCancel={() => setMoving(undefined)}
        />
      )}

      {folders.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {folders.map((folder) => (
            <article
              key={folder.id}
              className="border-border bg-card hover:border-brand-orange/40 flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 shadow-2xs transition-colors"
            >
              <Button
                variant="ghost"
                className="h-9 min-w-0 flex-1 justify-start gap-2 px-1.5 text-xs font-medium"
                disabled={deleted}
                onClick={() => onOpen(folder.id)}
              >
                <Folder className="text-brand-orange size-4 shrink-0" />
                <span className="truncate">{folder.name}</span>
              </Button>
              {mutable && (
                <div className="flex flex-wrap gap-1">
                  {deleted ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate(() =>
                            materialService.restoreFolder(workspace, folder.id),
                          )
                        }
                      >
                        {label("restore")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={mutation.isPending}
                        onClick={() => setPurging(folder)}
                      >
                        {t("library.trash.purge")}
                      </Button>
                    </>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={t("library.simple.actions", {
                            name: folder.name,
                          })}
                        >
                          <MoreHorizontal className="size-3.5" />
                          <span className="sr-only">
                            {t("library.simple.more")}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={mutation.isPending}
                          onSelect={() => {
                            setEditing(folder);
                            setName(folder.name);
                          }}
                        >
                          {label("rename")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={mutation.isPending}
                          onSelect={() => setMoving(folder)}
                        >
                          {label("move")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={mutation.isPending}
                          onSelect={() => setDeleting(folder)}
                        >
                          {label("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={!!deleting || !!purging}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setDeleting(undefined);
            setPurging(undefined);
          }
        }}
      >
        <DialogContent
          className="rounded-xl"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("cancel-folder-delete")?.focus();
          }}
        >
          <DialogTitle>
            {purging
              ? t("library.trash.folderPurgeTitle")
              : label("deleteFolderConfirm")}
          </DialogTitle>
          <DialogDescription className="break-words">
            {purging
              ? t("library.trash.folderPurgeDescription", {
                  name: purging.name,
                })
              : deleting?.name}
          </DialogDescription>

          <DialogFooter>
            <Button
              id="cancel-folder-delete"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => {
                setDeleting(undefined);
                setPurging(undefined);
              }}
            >
              {label("cancel")}
            </Button>
            <Button
              variant="destructive"
              loading={mutation.isPending}
              disabled={mutation.isPending}
              onClick={() => {
                if (mutation.isPending) return;
                if (purging)
                  mutation.mutate(() =>
                    materialService.purgeFolder(workspace, purging.id),
                  );
                else if (deleting)
                  mutation.mutate(() =>
                    materialService.deleteFolder(workspace, deleting.id),
                  );
              }}
            >
              {t(`library.trash.${purging ? "purge" : "moveToTrash"}`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showFiles && folders.length > 0 && (
        <h3 className="text-muted-foreground pt-1 text-xs font-semibold tracking-wider uppercase">
          {label("files")}
        </h3>
      )}
    </section>
  );
}
