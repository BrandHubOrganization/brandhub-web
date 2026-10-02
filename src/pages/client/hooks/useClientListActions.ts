import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { mockClientService } from "../services/mockClientService";
import type { Client } from "../types/client";

export function useClientListActions(
  workspaceId: string,
  load: () => Promise<void>,
  setPage: (page: number) => void,
  setClientForPackage: (client: Client | null) => void,
) {
  const { t } = useTranslation();

  async function handleCreateClient(
    dto: Parameters<typeof mockClientService.createClient>[1],
  ) {
    try {
      const created = await mockClientService.createClient(workspaceId, dto);
      toast.success(t("client.createSuccess", { name: created.name }));
      setPage(0);
      await load();
      return created;
    } catch {
      toast.error(t("client.createError"));
      throw new Error("createClient failed");
    }
  }

  async function handleUpdatePackage(
    id: string,
    dto: Parameters<typeof mockClientService.updateServicePackage>[2],
  ) {
    try {
      const updated = await mockClientService.updateServicePackage(
        workspaceId,
        id,
        dto,
      );
      toast.success(t("client.servicePackage.upgradeSuccess"));
      setClientForPackage(null);
      await load();
      return updated;
    } catch {
      toast.error(t("client.updatePackageError"));
      throw new Error("updateServicePackage failed");
    }
  }

  async function handleDeleteClient(id: string) {
    try {
      await mockClientService.deleteClient(workspaceId, id);
      toast.success(t("client.deleteSuccess"));
      await load();
    } catch {
      toast.error(t("client.deleteError"));
    }
  }

  return { handleCreateClient, handleUpdatePackage, handleDeleteClient };
}
