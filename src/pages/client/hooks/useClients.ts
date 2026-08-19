import { useState, useEffect, useCallback } from "react";
import { clientService } from "../services/clientService";
import type {
  Client,
  CreateClientDTO,
  UpdateServicePackageDTO,
} from "../types/client";
import { toast } from "sonner";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await clientService.getClients({ search: searchTerm });
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
      const created = await clientService.createClient(dto);
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
      const updated = await clientService.updateServicePackage(id, dto);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success("Đã nâng cấp/cập nhật gói dịch vụ!");
      return updated;
    } catch (error) {
      toast.error("Không thể cập nhật gói dịch vụ");
      throw error;
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await clientService.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setTotalElements((prev) => Math.max(0, prev - 1));
      toast.success("Đã xóa thương hiệu khách hàng!");
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
