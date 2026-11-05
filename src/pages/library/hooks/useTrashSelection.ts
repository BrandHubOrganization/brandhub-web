import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type { MaterialFolderItem, MaterialItem } from "@/types/material";

export interface TrashRow {
  key: string;
  name: string;
  file?: MaterialItem;
  folder?: MaterialFolderItem;
  canRestore: boolean;
  canPurge: boolean;
}

export function useTrashSelection({
  workspace,
  files,
  folders,
  onBusyChange,
}: {
  workspace: string;
  files: MaterialItem[];
  folders: MaterialFolderItem[];
  onBusyChange: (busy: boolean) => void;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const actor = useAuthStore((state) => state.user?.id);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const running = useRef(false);
  const folderMutable = role === "MANAGER" || role === "CREATOR";
  const rows: TrashRow[] = [
    ...folders.map((folder) => ({
      key: `folder:${folder.id}`,
      name: folder.name,
      folder,
      canRestore: folderMutable,
      canPurge: folderMutable,
    })),
    ...files.map((file) => ({
      key: `file:${file.id}`,
      name: file.name,
      file,
      canRestore:
        !!file.capabilities?.canRestore && file.status !== "PURGE_IN_PROGRESS",
      canPurge:
        !!file.capabilities?.canPurge && file.status !== "PURGE_IN_PROGRESS",
    })),
  ];
  const eligible = rows.filter((row) => row.canRestore || row.canPurge);
  const selected = eligible.filter((row) => checked.has(row.key));
  const current = () =>
    useWorkspaceStore.getState().currentWorkspace?.id === workspace &&
    useAuthStore.getState().user?.id === actor &&
    useWorkspaceStore.getState().currentMemberRole === role;
  const mutation = useMutation({
    mutationFn: async (action: "restore" | "purge") => {
      if (running.current || !actor || !current() || !selected.length) return;
      if (
        selected.some(
          (row) => !(action === "restore" ? row.canRestore : row.canPurge),
        )
      )
        return;
      running.current = true;
      onBusyChange(true);
      const succeeded = new Set<string>();
      const failed: string[] = [];
      const completedFolders = new Set<string>();
      const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
      const covered = (id?: string | null) => {
        const visited = new Set<string>();
        while (id && !visited.has(id)) {
          if (completedFolders.has(id)) return true;
          visited.add(id);
          id = folderMap.get(id)?.parentFolderId;
        }
        return false;
      };
      // Parents precede children, so a successful subtree mutation is never repeated.
      const depth = (row: TrashRow) => {
        let id = row.folder?.parentFolderId;
        let n = 0;
        const seen = new Set<string>();
        while (id && !seen.has(id)) {
          seen.add(id);
          n++;
          id = folderMap.get(id)?.parentFolderId;
        }
        return n;
      };
      const targets = [...selected].sort(
        (a, b) =>
          (a.file ? (action === "restore" ? -1 : 1000) : depth(a)) -
          (b.file ? (action === "restore" ? -1 : 1000) : depth(b)),
      );
      try {
        for (const row of targets) {
          if (!current()) break;
          try {
            if (covered(row.folder?.parentFolderId ?? row.file?.folderId)) {
              if (action === "purge") {
                succeeded.add(row.key);
                continue;
              }
              // Folder restore only restores its deletion batch. An independently
              // trashed child may still need its own restore after its parent.
              const trash = await materialService.browse(workspace, {
                deleted: true,
                page: 0,
                size: 1,
                search: "",
              });
              if (!current()) break;
              if (
                row.folder &&
                !trash.folders.some((folder) => folder.id === row.folder!.id)
              ) {
                succeeded.add(row.key);
                continue;
              }
            }
            if (row.folder) {
              if (action === "restore")
                await materialService.restoreFolder(workspace, row.folder.id);
              else await materialService.purgeFolder(workspace, row.folder.id);
              completedFolders.add(row.folder.id);
            } else if (row.file) {
              if (action === "restore")
                await materialService.restoreMaterial(workspace, row.file);
              else await materialService.purgeMaterial(workspace, row.file);
            }
            succeeded.add(row.key);
          } catch {
            failed.push(row.name);
          }
        }
        if (!current()) return;
        setChecked(
          (previous) =>
            new Set([...previous].filter((key) => !succeeded.has(key))),
        );
        if (succeeded.size)
          toast.success(
            t(
              `library.trash.${action === "restore" ? "batchRestored" : "batchPurged"}`,
              { count: succeeded.size },
            ),
          );
        if (failed.length)
          toast.error(
            t("library.trash.batchFailed", {
              count: failed.length,
              names: failed.join(", "),
            }),
          );
        await Promise.all([
          client.invalidateQueries({
            queryKey: ["materials", workspace, actor],
          }),
          client.invalidateQueries({
            queryKey: ["material-storage-usage", workspace, actor],
          }),
        ]);
      } finally {
        running.current = false;
        onBusyChange(false);
      }
    },
  });
  return {
    rows,
    eligible,
    selected,
    mutation,
    toggle: (key: string) =>
      setChecked((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      }),
    selectPage: () =>
      setChecked(
        selected.length === eligible.length
          ? new Set()
          : new Set(eligible.map((row) => row.key)),
      ),
    clear: () => setChecked(new Set()),
  };
}
