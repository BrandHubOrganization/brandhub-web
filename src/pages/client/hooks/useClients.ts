import { useState, useEffect, useCallback } from "react";
import { mockClientService } from "../services/mockClientService";
import type {
  Client,
  CreateClientDTO,
  UpdateServicePackageDTO,
} from "../types/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/store/workspaceStore";

export function useClients() {
  const { t } = useTranslation();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const workspaceId = currentWorkspace?.id ?? "";

  const [clients, setClients] = useState<Client[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockClientService.getClients(workspaceId, {
        search: searchTerm,
      });
      setClients(data.content);
      setTotalElements(data.totalElements);
    } catch {
      toast.error(t("client.loadListError"));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, workspaceId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = async (dto: CreateClientDTO) => {
    try {
      const created = await mockClientService.createClient(workspaceId, dto);
      setClients((prev) => [created, ...prev]);
      setTotalElements((prev) => prev + 1);
      toast.success(t("client.createSuccess", { name: created.name }));
      return created;
    } catch (error) {
      toast.error(t("client.createError"));
      throw error;
    }
  };

  const handleUpdateServicePackage = async (
    id: string,
    dto: UpdateServicePackageDTO,
  ) => {
    try {
      const updated = await mockClientService.updateServicePackage(
        workspaceId,
        id,
        dto,
      );
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(t("client.servicePackage.upgradeSuccess"));
      return updated;
    } catch (error) {
      toast.error(t("client.updatePackageError"));
      throw error;
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await mockClientService.deleteClient(workspaceId, id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setTotalElements((prev) => Math.max(0, prev - 1));
      toast.success(t("client.deleteSuccess"));
    } catch (error) {
      toast.error(t("client.deleteError"));
      throw error;
    }
  };

  return {
    clients,
    totalElements,
    isLoading,
    searchTerm,
    setSearchTerm,
    refreshClients: fetchClients,
    createClient: handleCreateClient,
    updateServicePackage: handleUpdateServicePackage,
    deleteClient: handleDeleteClient,
  };
}
