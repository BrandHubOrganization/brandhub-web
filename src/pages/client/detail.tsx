import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// Feature Imports
import { mockClientService } from "./services/mockClientService";
import type { Client } from "./types/client";
import { ClientBanner } from "./components/ClientBanner";
import { ClientAnalyticsCards } from "./components/ClientAnalyticsCards";
import { ClientSocialAccounts } from "./components/ClientSocialAccounts";
import { ClientContentRequests } from "./components/ClientContentRequests";

export function ClientDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchClientDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await mockClientService.getClientById(id);
      setClient(data);
    } catch {
      toast.error("Không thể tải thông tin chi tiết của Client");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientDetail();
  }, [fetchClientDetail]);

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
      <PageWrapper title="Chi tiết Client">
        <div className="space-y-4 p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Không tìm thấy thông tin thương hiệu này.
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/clients")}
            className="text-xs"
          >
            Quay lại danh sách Client
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={client.name}
      description={`Chi tiết thương hiệu và lịch sử nội dung của ${client.name}`}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/clients")}
          className="cursor-pointer gap-1.5 text-xs"
        >
          <ArrowLeft className="size-3.5" /> Quay lại
        </Button>
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
    </PageWrapper>
  );
}

export default ClientDetailPage;
