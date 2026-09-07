import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";

import { mockClientService } from "./services/mockClientService";
import type { Client } from "./types/client";
import { SearchHeader } from "./components/SearchHeader";
import { ClientTable } from "./components/ClientTable";
import { Pagination } from "./components/Pagination";
import { ClientListErrorBanner } from "./components/ClientListErrorBanner";
import { ClientModals } from "./ClientModals";
import { useClientListActions } from "./hooks/useClientListActions";

const PAGE_SIZE = 8;

export function ClientListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const isOwner =
    currentMemberRole === "OWNER" || currentMemberRole === "MANAGER";

  const [clients, setClients] = useState<Client[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(
    searchParams.get("create") === "1",
  );
  const [clientForPackage, setClientForPackage] = useState<Client | null>(null);
  const [clientForDelete, setClientForDelete] = useState<Client | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const { content, totalElements: total } =
        await mockClientService.getClients({ search, page, size: PAGE_SIZE });
      setClients(content);
      setTotalElements(total);
    } catch (err) {
      console.error("Failed to load clients:", err);
      setIsError(true);
      toast.error(t("client.loadListError"));
    } finally {
      setIsLoading(false);
    }
  }, [search, page, t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const { handleCreateClient, handleUpdatePackage, handleDeleteClient } =
    useClientListActions(load, setPage, setClientForPackage);

  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  return (
    <PageWrapper
      title={t("client.list.title")}
      description={t("client.list.description")}
      actions={
        isOwner && (
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white"
          >
            <Plus className="size-3.5" /> {t("client.list.createButton")}
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <SearchHeader
          searchTerm={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          placeholder={t("client.list.searchPlaceholder")}
          totalElements={totalElements}
          totalLabel={t("client.list.totalLabel")}
          icon={<Building2 className="size-3.5" />}
        />

        {isError && !isLoading ? (
          <ClientListErrorBanner onRetry={() => load()} />
        ) : (
          <div className="border-border bg-card overflow-hidden rounded-xl border">
            <ClientTable
              clients={clients}
              isLoading={isLoading}
              isOwner={isOwner}
              onSelectPackage={setClientForPackage}
              onSelectDelete={setClientForDelete}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ClientModals
        createClient={handleCreateClient}
        updateServicePackage={handleUpdatePackage}
        deleteClient={handleDeleteClient}
        isCreateOpen={isCreateOpen}
        onCloseCreate={() => setIsCreateOpen(false)}
        selectedClientForPackage={clientForPackage}
        onClosePackage={() => setClientForPackage(null)}
        selectedClientForDelete={clientForDelete}
        onCloseDelete={() => setClientForDelete(null)}
      />
    </PageWrapper>
  );
}

export default ClientListPage;
