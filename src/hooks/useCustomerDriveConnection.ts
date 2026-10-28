import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { customerDriveService } from "@/services/customerDriveService";
import { customerDriveReturnPath } from "@/lib/customerDriveReturnPath";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

interface ConnectionContext {
  workspace: string;
  actor: string;
  workspaceIds: string[];
}
export function useCustomerDriveConnection(workspaceId?: string) {
  const { t } = useTranslation();
  const selected = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);
  const workspace = workspaceId ?? selected;
  const allowed =
    !!workspace &&
    workspace === selected &&
    !!actor &&
    ["OWNER", "MANAGER"].includes(role ?? "");
  const client = useQueryClient();
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const current = (context: ConnectionContext) =>
    mounted.current &&
    useAuthStore.getState().user?.id === context.actor &&
    useWorkspaceStore.getState().currentWorkspace?.id === context.workspace &&
    ["OWNER", "MANAGER"].includes(
      useWorkspaceStore.getState().currentMemberRole ?? "",
    );
  const capture = (): ConnectionContext | null => {
    const state = useWorkspaceStore.getState();
    const user = useAuthStore.getState().user;
    if (
      !allowed ||
      !workspace ||
      !user ||
      user.id !== actor ||
      !["OWNER", "MANAGER"].includes(state.currentMemberRole ?? "") ||
      state.currentWorkspace?.id !== workspace
    )
      return null;
    return {
      workspace,
      actor: user.id,
      workspaceIds: [
        ...new Set([
          workspace,
          ...state.workspaceList
            .filter(
              (item) => item.agencyId === state.currentWorkspace?.agencyId,
            )
            .map((item) => item.id),
        ]),
      ],
    };
  };
  const status = useQuery({
    queryKey: ["customer-drive", workspace, actor],
    queryFn: ({ signal }) => customerDriveService.status(workspace!, signal),
    enabled: allowed,
    retry: false,
    staleTime: 0,
  });
  const authorize = useMutation({
    mutationFn: async (context: ConnectionContext) => ({
      context,
      url: await customerDriveService.authorize(context.workspace),
    }),
    onSuccess: ({ context, url }) => {
      if (!current(context)) return;
      let target: URL;
      try {
        target = new URL(url);
      } catch {
        toast.error(t("library.drive.failed"));
        return;
      }
      if (target.origin !== "https://accounts.google.com") {
        toast.error(t("library.drive.failed"));
        return;
      }
      sessionStorage.setItem("brandhub-drive-workspace", context.workspace);
      sessionStorage.setItem("brandhub-drive-actor", context.actor);
      sessionStorage.setItem(
        "brandhub-drive-return",
        customerDriveReturnPath(context.workspace, window.location.pathname),
      );
      window.location.assign(target.href);
    },
    onError: (_error, context) => {
      if (current(context)) toast.error(t("library.drive.failed"));
    },
  });
  const disconnect = useMutation({
    mutationFn: async (context: ConnectionContext) => {
      await customerDriveService.disconnect(context.workspace);
      return context;
    },
    onSuccess: (context) => {
      const matches = (key: readonly unknown[]) =>
        key[2] === context.actor &&
        context.workspaceIds.includes(String(key[1]));
      client.removeQueries({
        predicate: (query) =>
          matches(query.queryKey) &&
          [
            "materials",
            "material-detail",
            "material-storage-usage",
            "repository-upload-profiles",
          ].includes(String(query.queryKey[0])),
      });
      void client.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "customer-drive" && matches(query.queryKey),
      });
      if (current(context))
        toast.success(t("workspace.agencyStorage.disconnectSuccess"));
    },
    onError: (_error, context) => {
      void client.invalidateQueries({
        predicate: (query) =>
          context.workspaceIds.includes(String(query.queryKey[1])),
      });
      if (current(context))
        toast.error(t("workspace.agencyStorage.disconnectFailed"));
    },
  });
  return {
    allowed,
    workspace,
    actor,
    status,
    busy: authorize.isPending || disconnect.isPending,
    connect: () => {
      const context = capture();
      if (context) authorize.mutate(context);
    },
    disconnect: async () => {
      const context = capture();
      if (!context) return false;
      await disconnect.mutateAsync(context);
      return current(context);
    },
  };
}
