import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Settings, Package, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/store/workspaceStore";

// Feature Imports
import { mockClientService } from "./services/mockClientService";
import type { Client } from "./types/client";
import { ClientBanner } from "./components/ClientBanner";
import { ClientAnalyticsCards } from "./components/ClientAnalyticsCards";
import { ClientSocialAccounts } from "./components/ClientSocialAccounts";
import { ClientContentRequests } from "./components/ClientContentRequests";
import { ServicePackageModal } from "./components/ServicePackageModal";
import { ClientSettingsModal } from "./components/ClientSettingsModal";

const AM_OPTIONS = [
  { id: "am-1", name: "Nguyễn Văn An" },
  { id: "am-2", name: "Phạm Minh Dung" },
  { id: "am-3", name: "Lê Hoàng Cường" },
];

export function ClientDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const membersPath = currentWorkspace
    ? `/workspaces/${currentWorkspace.id}/members`
    : "/dashboard";

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [packageOpen, setPackageOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const fetchClientDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await mockClientService.getClientById(id);
      setClient(data);
    } catch {
      toast.error(t("client.detail.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientDetail();
  }, [fetchClientDetail]);

  async function handleAssign(amId: string) {
    if (!client) return;
    const am = AM_OPTIONS.find((o) => o.id === amId);
    setClient({
      ...client,
      assignedAccountManagerId: amId,
      assignedAccountManagerName: am?.name ?? client.assignedAccountManagerName,
    });
    setAssignOpen(false);
    toast.success(t("client.detail.assignSuccess"));
  }

  if (isLoading) {
    return (
      <PageWrapper
        title={t("client.detail.title")}
        description={t("client.detail.loading")}
      >
        <div className="space-y-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!client) {
    return (
      <PageWrapper title={t("client.detail.title")}>
        <div className="space-y-4 p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {t("client.detail.notFound")}
          </p>
          <Button
            size="sm"
            onClick={() => navigate(membersPath)}
            className="text-xs"
          >
            {t("client.detail.backToList")}
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={client.name}
      description={t("client.detail.descriptionTemplate", {
        name: client.name,
      })}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(membersPath)}
            className="cursor-pointer gap-1.5 text-xs"
          >
            <ArrowLeft className="size-3.5" /> {t("client.detail.back")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={() => setAssignOpen(true)}
          >
            <UserCog className="size-3.5" /> {t("client.detail.assignAm")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={() => setPackageOpen(true)}
          >
            <Package className="size-3.5" /> {t("client.detail.servicePackage")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-3.5" /> {t("client.detail.settings")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner Thông tin Thương hiệu */}
        <ClientBanner client={client} />

        {/* Thống kê Tổng quan (Analytics Cards) */}
        {client.analyticsSummary && (
          <ClientAnalyticsCards analytics={client.analyticsSummary} />
        )}

        {/* Grid: Tài khoản MXH & Yêu cầu Nội dung */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ClientSocialAccounts accounts={client.linkedAccounts} />
          <ClientContentRequests requests={client.contentRequests} />
        </div>
      </div>

      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl border p-5">
            <h3 className="text-foreground text-sm font-semibold">
              {t("client.detail.assignAm")}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("client.detail.assignSubtitle")}
            </p>
            <div className="mt-4 space-y-2">
              {AM_OPTIONS.map((am) => (
                <button
                  key={am.id}
                  type="button"
                  className="bg-muted text-foreground w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
                  onClick={() => handleAssign(am.id)}
                >
                  {am.name}
                  {am.id === client.assignedAccountManagerId && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      · {t("client.detail.current")}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => setAssignOpen(false)}
            >
              {t("client.detail.cancel")}
            </Button>
          </div>
        </div>
      )}

      <ServicePackageModal
        isOpen={packageOpen}
        client={packageOpen ? client : null}
        onClose={() => setPackageOpen(false)}
        onSubmit={async (id, dto) => {
          await mockClientService.updateServicePackage(id, dto);
          setPackageOpen(false);
          await fetchClientDetail();
        }}
        isLoading={false}
      />

      <ClientSettingsModal
        isOpen={settingsOpen}
        client={settingsOpen ? client : null}
        onClose={() => setSettingsOpen(false)}
        onSubmit={async (id, dto) => {
          await mockClientService.updateClientSettings(id, dto);
          await fetchClientDetail();
        }}
      />
    </PageWrapper>
  );
}

export default ClientDetailPage;
