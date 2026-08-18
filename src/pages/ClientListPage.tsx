import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import { clientService } from "@/services/clientService";
import type {
  Client,
  CreateClientDTO,
  UpdateServicePackageDTO,
} from "@/types/client";

// Modals
import { CreateEditClientModal } from "@/components/clients/CreateEditClientModal";
import { ServicePackageModal } from "@/components/clients/ServicePackageModal";
import { DeleteClientModal } from "@/components/clients/DeleteClientModal";

// Icons & Toast
import {
  Building2,
  Search,
  Plus,
  Zap,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function ClientListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRole = user?.role?.toUpperCase() ?? "";
  const isOwner = userRole === "AGENCY_OWNER";

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Pagination
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [page, setPage] = useState<number>(0);
  const size = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedClientForPackage, setSelectedClientForPackage] =
    useState<Client | null>(null);
  const [selectedClientForDelete, setSelectedClientForDelete] =
    useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch Data
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await clientService.getClients({
        page,
        size,
        search: debouncedSearch,
      });
      setClients(data.content);
      setTotal(data.totalElements);
    } catch {
      toast.error("Không thể tải danh sách Client");
    } finally {
      setIsLoading(false);
    }
  }, [page, size, debouncedSearch]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Create Client
  const handleCreateClient = async (dto: CreateClientDTO) => {
    setIsSubmitting(true);
    try {
      const created = await clientService.createClient(dto);
      setClients((prev) => [created, ...prev]);
      setTotal((prev) => prev + 1);
      toast.success(`Đã tạo thành công Client "${created.name}"`);
    } catch {
      toast.error("Tạo Client thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Package with Optimistic UI & Rollback
  const handleUpdatePackage = async (
    clientId: string,
    dto: UpdateServicePackageDTO,
  ) => {
    const backupClients = [...clients];

    // 1. Optimistic Update local state immediately
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              servicePackage: {
                ...c.servicePackage,
                packageTier: dto.packageTier,
                monthlyPostQuota: dto.monthlyPostLimit,
                expiryDate: dto.expiryDate || c.servicePackage.expiryDate,
              },
            }
          : c,
      ),
    );

    setIsSubmitting(true);
    try {
      // 2. Call API
      await clientService.updateServicePackage(clientId, dto);
      toast.success("Cập nhật gói dịch vụ thành công!");
    } catch {
      // 3. Rollback on API error
      setClients(backupClients);
      toast.error(
        "Cập nhật gói dịch vụ thất bại. Đã khôi phục dữ liệu ban đầu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Client
  const handleDeleteClient = async (id: string) => {
    setIsSubmitting(true);
    try {
      await clientService.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success("Đã xóa Client thành công!");
    } catch {
      toast.error("Không thể xóa Client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / size) || 1;

  return (
    <PageWrapper
      title="Quản lý Brand Clients"
      description="Quản lý danh sách thương hiệu, gói dịch vụ và phân công Account Manager."
      actions={
        isOwner && (
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="cursor-pointer gap-1.5 bg-[#f05a28] text-xs font-semibold text-white hover:bg-[#f05a28]/90"
          >
            <Plus className="size-3.5" />
            Tạo Client Mới
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* Search & Filter Header */}
        <div className="bg-card border-border flex flex-col justify-between gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-3.5" />
            <Input
              placeholder="Tìm kiếm thương hiệu, email, ngành hàng..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(0);
              }}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className="bg-muted flex items-center gap-1 rounded-md px-2.5 py-1 font-medium">
              <Building2 className="size-3.5 text-[#f05a28]" /> Tổng số: {total}{" "}
              Client
            </span>
            {isOwner && (
              <span className="hidden items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600 sm:inline-flex">
                <ShieldCheck className="size-3" /> AGENCY OWNER
              </span>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-border bg-muted/40 text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                  <th className="px-4 py-3">Thương hiệu / Client</th>
                  <th className="px-4 py-3">Account Manager</th>
                  <th className="px-4 py-3 text-center">Active Posts</th>
                  <th className="px-4 py-3">Gói Dịch Vụ</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y text-xs">
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="size-8 shrink-0 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Skeleton className="mx-auto h-4 w-12" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Skeleton className="mx-auto h-5 w-16" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Skeleton className="ml-auto h-7 w-20" />
                      </td>
                    </tr>
                  ))
                ) : clients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      Không tìm thấy Client nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-muted/30 group transition-colors"
                    >
                      {/* Logo & Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {client.logoUrl ? (
                            <img
                              src={client.logoUrl}
                              alt={client.name}
                              className="border-border size-8 shrink-0 rounded-full border object-cover"
                            />
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff0eb] text-xs font-bold text-[#f05a28]">
                              {client.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-foreground block truncate font-bold transition-colors group-hover:text-[#f05a28]">
                              {client.name}
                            </span>
                            <span className="text-muted-foreground block truncate text-[11px]">
                              {client.contactEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Account Manager */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {client.assignedAccountManagerAvatar ? (
                            <img
                              src={client.assignedAccountManagerAvatar}
                              alt=""
                              className="size-5 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="bg-muted flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
                              A
                            </div>
                          )}
                          <span className="text-foreground font-medium">
                            {client.assignedAccountManagerName ||
                              "Chưa phân công"}
                          </span>
                        </div>
                      </td>

                      {/* Active Posts Count */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-foreground font-semibold">
                          {client.activePostsCount}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          /{client.servicePackage.monthlyPostQuota}
                        </span>
                      </td>

                      {/* Service Package Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            client.servicePackage.packageTier === "ENTERPRISE"
                              ? "border-purple-500/20 bg-purple-500/10 text-purple-600"
                              : client.servicePackage.packageTier === "GROWTH"
                                ? "border-[#f05a28]/20 bg-[#f05a28]/10 text-[#f05a28]"
                                : "border-blue-500/20 bg-blue-500/10 text-blue-600"
                          }`}
                        >
                          <Zap className="size-3" />{" "}
                          {client.servicePackage.packageTier}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${
                            client.status === "ACTIVE"
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                              : "border border-gray-500/20 bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground size-7 cursor-pointer"
                            title="Xem chi tiết Client"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          {isOwner && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground size-7 cursor-pointer hover:text-[#f05a28]"
                                title="Đổi gói dịch vụ"
                                onClick={() =>
                                  setSelectedClientForPackage(client)
                                }
                              >
                                <Zap className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground size-7 cursor-pointer hover:text-rose-500"
                                title="Xóa Client"
                                onClick={() =>
                                  setSelectedClientForDelete(client)
                                }
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-border bg-muted/20 flex items-center justify-between border-t px-4 py-3 text-xs">
            <span className="text-muted-foreground">
              Trang{" "}
              <span className="text-foreground font-semibold">{page + 1}</span>{" "}
              / {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="h-7 cursor-pointer gap-1 text-xs"
              >
                <ChevronLeft className="size-3.5" /> Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 cursor-pointer gap-1 text-xs"
              >
                Sau <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEditClientModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateClient}
        isLoading={isSubmitting}
      />

      <ServicePackageModal
        isOpen={!!selectedClientForPackage}
        client={selectedClientForPackage}
        onClose={() => setSelectedClientForPackage(null)}
        onSubmit={handleUpdatePackage}
        isLoading={isSubmitting}
      />

      <DeleteClientModal
        isOpen={!!selectedClientForDelete}
        client={selectedClientForDelete}
        onClose={() => setSelectedClientForDelete(null)}
        onConfirm={handleDeleteClient}
        isLoading={isSubmitting}
      />
    </PageWrapper>
  );
}

export default ClientListPage;
