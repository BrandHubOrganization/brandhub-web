import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Plus, Building2, ShieldCheck } from "lucide-react";
import { SearchHeader } from "@/pages/client/components/SearchHeader";
import { Pagination } from "@/pages/client/components/Pagination";
import { useClients } from "@/pages/client/hooks/useClients";
import type { Client } from "@/pages/client/types/client";
import { ClientTable } from "@/pages/client/components/ClientTable";
import { ClientModals } from "@/pages/client/ClientModals";

export function ClientsSection() {
  const { t } = useTranslation();
  const memberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const isOwner = memberRole === "OWNER";

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

  const [page, setPage] = useState<number>(0);
  const size = 10;
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedClientForPackage, setSelectedClientForPackage] =
    useState<Client | null>(null);
  const [selectedClientForDelete, setSelectedClientForDelete] =
    useState<Client | null>(null);

  const totalPages = Math.ceil(totalElements / size) || 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isOwner && (
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs font-semibold text-white"
          >
            <Plus className="size-3.5" />
            {t("client.list.createButton")}
          </Button>
        )}
      </div>

      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(0);
        }}
        placeholder={t("client.list.searchPlaceholder")}
        totalElements={totalElements}
        totalLabel={t("client.list.totalLabel")}
        icon={<Building2 className="text-brand-orange size-3.5" />}
        extraActions={
          isOwner ? (
            <span className="text-3xs hidden items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-600 sm:inline-flex">
              <ShieldCheck className="size-3" />{" "}
              {t("client.list.agencyOwnerBadge")}
            </span>
          ) : undefined
        }
      />

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
    </div>
  );
}
