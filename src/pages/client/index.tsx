import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Plus, Building2, ShieldCheck } from "lucide-react";

// Common Reusable Components
import { SearchHeader } from "./components/SearchHeader";
import { Pagination } from "./components/Pagination";

// Local Feature Imports
import { useClients } from "./hooks/useClients";
import type { Client } from "./types/client";
import { ClientTable } from "./components/ClientTable";
import { ClientModals } from "./ClientModals";

export function ClientListPage() {
  const memberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const isOwner = memberRole === "OWNER";

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
              <span className="hidden items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-3xs font-semibold text-emerald-600 sm:inline-flex">
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
      <ClientModals
        createClient={createClient}
        updateServicePackage={updateServicePackage}
        deleteClient={deleteClient}
        isCreateOpen={isCreateOpen}
        onCloseCreate={() => setIsCreateOpen(false)}
        selectedClientForPackage={selectedClientForPackage}
        onClosePackage={() => setSelectedClientForPackage(null)}
        selectedClientForDelete={selectedClientForDelete}
        onCloseDelete={() => setSelectedClientForDelete(null)}
      />
    </PageWrapper>
  );
}

export default ClientListPage;
