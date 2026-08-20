import { useState, useEffect, useCallback } from "react";
import { mockClientService } from "../services/mockClientService";
import type {
  Client,
  CreateClientDTO,
  UpdateServicePackageDTO,
} from "../types/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useClients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockClientService.getClients({ search: searchTerm });
      setClients(data.content);
      setTotalElements(data.totalElements);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách thương hiệu khách hàng");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = async (dto: CreateClientDTO) => {
    try {
      const created = await mockClientService.createClient(dto);
      setClients((prev) => [created, ...prev]);
      setTotalElements((prev) => prev + 1);
      toast.success(`Đã thêm khách hàng "${created.name}" thành công!`);
      return created;
    } catch (error) {
      toast.error("Không thể tạo thương hiệu khách hàng mới");
      throw error;
    }
  };

  const handleUpdateServicePackage = async (
    id: string,
    dto: UpdateServicePackageDTO,
  ) => {
    try {
      const updated = await mockClientService.updateServicePackage(id, dto);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(t("client.servicePackage.upgradeSuccess"));
      return updated;
    } catch (error) {
      toast.error("Không thể cập nhật gói dịch vụ");
      throw error;
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await mockClientService.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setTotalElements((prev) => Math.max(0, prev - 1));
      toast.success(t("client.deleteSuccess"));
    } catch (error) {
      toast.error("Không thể xóa khách hàng");
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
