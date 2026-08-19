import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Plus, Building2, ShieldCheck } from "lucide-react";

// Common Reusable Components
import { SearchHeader } from "./components/SearchHeader";
import { Pagination } from "./components/Pagination";

// Local Feature Imports
import { useClients } from "./hooks/useClients";
import type {
  Client,
  CreateClientDTO,
  UpdateServicePackageDTO,
} from "./types/client";
import { ClientTable } from "./components/ClientTable";
import { CreateEditClientModal } from "./components/CreateEditClientModal";
import { ServicePackageModal } from "./components/ServicePackageModal";
import { DeleteClientModal } from "./components/DeleteClientModal";

export function ClientListPage() {
  const { user } = useAuthStore();
  const isOwner = (user?.role?.toUpperCase() ?? "") === "AGENCY_OWNER";

  // Custom Hook
  const {
    clients,
    totalElements,
    isLoading,
    searchTerm,
    setSearchTerm,
    createClient,
    updateServicePackage,
    deleteClient,
  } = useClients();

  // Local UI States
  const [page, setPage] = useState<number>(0);
  const size = 10;
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedClientForPackage, setSelectedClientForPackage] =
    useState<Client | null>(null);
  const [selectedClientForDelete, setSelectedClientForDelete] =
    useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handlers
  const handleCreateSubmit = async (dto: CreateClientDTO) => {
    setIsSubmitting(true);
    try {
      await createClient(dto);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePackageSubmit = async (
    id: string,
    dto: UpdateServicePackageDTO,
  ) => {
    setIsSubmitting(true);
    try {
      await updateServicePackage(id, dto);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClientForDelete) return;
    setIsSubmitting(true);
    try {
      await deleteClient(selectedClientForDelete.id);
      setSelectedClientForDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalElements / size) || 1;

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
        {/* Reusable Common SearchHeader */}
        <SearchHeader
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPage(0);
          }}
          placeholder="Tìm kiếm thương hiệu, email, ngành hàng..."
          totalElements={totalElements}
          totalLabel="Client"
          icon={<Building2 className="size-3.5 text-[#f05a28]" />}
          extraActions={
            isOwner ? (
              <span className="hidden items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600 sm:inline-flex">
                <ShieldCheck className="size-3" /> AGENCY OWNER
              </span>
            ) : undefined
          }
        />

        {/* Table & Reusable Common Pagination */}
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <ClientTable
            clients={clients}
            isLoading={isLoading}
            isOwner={isOwner}
            onSelectPackage={setSelectedClientForPackage}
            onSelectDelete={setSelectedClientForDelete}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateEditClientModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isSubmitting}
      />

      <ServicePackageModal
        isOpen={!!selectedClientForPackage}
        client={selectedClientForPackage}
        onClose={() => setSelectedClientForPackage(null)}
        onSubmit={handleUpdatePackageSubmit}
        isLoading={isSubmitting}
      />

      <DeleteClientModal
        isOpen={!!selectedClientForDelete}
        clientName={selectedClientForDelete?.name}
        onClose={() => setSelectedClientForDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
      />
    </PageWrapper>
  );
}

export default ClientListPage;
