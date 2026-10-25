import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { materialService } from "@/services/materialService";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { MaterialItem } from "@/types/material";

interface MutationResult {
  material: MaterialItem;
  workspace: string;
  actor: string;
}
type Context = ReturnType<typeof useTrashContext>;

function isCurrent(context: { workspace: string; actor: string }) {
  return (
    useWorkspaceStore.getState().currentWorkspace?.id === context.workspace &&
    useAuthStore.getState().user?.id === context.actor
  );
}

function errorKey(error: unknown) {
  const code = isAxiosError(error)
    ? error.response?.data?.error?.code
    : undefined;
  if (code === "MATERIAL_RETENTION_EXPIRED") return "retentionExpired";
  if (code === "MATERIAL_MUTATION_FORBIDDEN") return "mutationForbidden";
  return code === "MATERIAL_PURGE_IN_PROGRESS" ? "purging" : "mutationFailed";
}

function useTrashContext() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["materials", workspace, actor] });
  const failure = (error: unknown) => {
    if (!workspace || !actor || !isCurrent({ workspace, actor })) return;
    toast.error(t(`library.trash.${errorKey(error)}`));
    void refresh();
  };
  return { t, workspace, role, actor, refresh, failure };
}

async function mutate(
  context: Context,
  material: MaterialItem,
  restore: boolean,
): Promise<MutationResult> {
  const { workspace, actor } = context;
  if (!workspace || !actor || !isCurrent({ workspace, actor }))
    throw new Error("Missing workspace");
  const result = restore
    ? await materialService.restoreMaterial(workspace, material)
    : await materialService.deleteMaterial(workspace, material);
  return { material: result, workspace, actor };
}

function useRestoreMaterial(context: Context) {
  return useMutation({
    mutationFn: (material: MaterialItem) => mutate(context, material, true),
    onSuccess: (result) => {
      if (!isCurrent(result)) return;
      toast.success(
        context.t("library.trash.restoredSuccess", {
          name: result.material.name,
        }),
      );
      void context.refresh();
    },
    onError: context.failure,
  });
}

function useDeleteMaterial(
  context: Context,
  restore: (material: MaterialItem) => void,
) {
  return useMutation({
    mutationFn: (material: MaterialItem) => mutate(context, material, false),
    onSuccess: (result) => {
      if (!isCurrent(result)) return;
      void context.refresh();
      toast.success(
        context.t("library.trash.deletedSuccess", {
          name: result.material.name,
        }),
        {
          action: {
            label: context.t("library.trash.undo"),
            onClick: () => {
              if (isCurrent(result)) restore(result.material);
            },
          },
        },
      );
    },
    onError: context.failure,
  });
}

export function useMaterialTrash(
  deleted: boolean,
  page: number,
  search: string,
) {
  const context = useTrashContext();
  const { workspace, actor, role, refresh } = context;
  const query = useQuery({
    queryKey: ["materials", workspace, actor, deleted, page, search],
    enabled: !!workspace && !!actor,
    refetchInterval: 60_000,
    queryFn: async () =>
      deleted
        ? materialService.trash(workspace!, page, search)
        : {
            items: await materialService.list(workspace!, undefined, search),
            total: 0,
          },
  });
  const restore = useRestoreMaterial(context);
  const remove = useDeleteMaterial(context, restore.mutate);
  return { query, workspace, role, actor, remove, restore, refresh };
}
