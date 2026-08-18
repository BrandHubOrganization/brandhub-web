import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clientService } from "@/services/clientService";
import type { Client } from "@/types/client";
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  UserCheck,
  Share2,
  FileText,
  BarChart3,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchClientDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await clientService.getClientById(id);
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
      <PageWrapper title="Chi tiết Client" description="Đang tải dữ liệu...">
        <div className="space-y-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Không tìm thấy thông tin thương hiệu này.</p>
          <Button size="sm" onClick={() => navigate("/clients")} className="text-xs">
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
          className="text-xs gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" /> Quay lại
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Section 1: Overview Banner */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {client.logoUrl ? (
              <img
                src={client.logoUrl}
                alt={client.name}
                className="size-16 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-[#fff0eb] text-[#f05a28] font-bold text-xl">
                {client.name.charAt(0)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
                <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded">
                  {client.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1"><Building2 className="size-3 text-[#f05a28]" /> {client.industry}</span>
                <span className="flex items-center gap-1"><Mail className="size-3 text-muted-foreground" /> {client.contactEmail}</span>
                {client.contactPhone && (
                  <span className="flex items-center gap-1"><Phone className="size-3 text-muted-foreground" /> {client.contactPhone}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border">
            <UserCheck className="size-5 text-[#f05a28] shrink-0" />
            <div className="text-xs">
              <span className="text-muted-foreground block text-[10px]">Account Manager</span>
              <span className="font-semibold text-foreground">
                {client.assignedAccountManagerName || "Chưa phân công"}
              </span>
            </div>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        {client.analyticsSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="size-3.5 text-blue-500" /> Tổng số bài đăng
              </span>
              <span className="text-xl font-bold text-foreground">{client.analyticsSummary.totalPosts}</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="size-3.5 text-emerald-500" /> Đã xuất bản
              </span>
              <span className="text-xl font-bold text-foreground">{client.analyticsSummary.publishedPosts}</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Zap className="size-3.5 text-amber-500" /> Yêu cầu chờ xử lý
              </span>
              <span className="text-xl font-bold text-foreground">{client.analyticsSummary.activeRequests}</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <BarChart3 className="size-3.5 text-[#f05a28]" /> Tương tác trung bình
              </span>
              <span className="text-xl font-bold text-foreground">{client.analyticsSummary.engagementRate}%</span>
            </div>
          </div>
        )}

        {/* Section 2: Linked Social Accounts & Content Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linked Social Accounts */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Share2 className="size-4 text-[#f05a28]" />
              <h3 className="text-sm font-bold text-foreground">Tài khoản Mạng xã hội đã liên kết</h3>
            </div>

            <div className="space-y-3">
              {client.linkedAccounts && client.linkedAccounts.length > 0 ? (
                client.linkedAccounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-[#f05a28]/10 text-[#f05a28] font-bold text-xs flex items-center justify-center">
                        {acc.platform.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground block">{acc.accountName}</span>
                        <span className="text-[10px] text-muted-foreground">{acc.accountHandle} ({acc.platform})</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Đã kết nối
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Chưa có tài khoản mạng xã hội nào được liên kết.</p>
              )}
            </div>
          </div>

          {/* Current Content Requests */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileText className="size-4 text-[#f05a28]" />
              <h3 className="text-sm font-bold text-foreground">Yêu cầu Nội dung mới nhất</h3>
            </div>

            <div className="space-y-3">
              {client.contentRequests && client.contentRequests.length > 0 ? (
                client.contentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10">
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{req.title}</span>
                      <span className="text-[10px] text-muted-foreground">Tạo bởi: {req.authorName} &bull; {req.createdAt}</span>
                    </div>
                    <span className="text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded">
                      {req.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Chưa có yêu cầu nội dung nào mới.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default ClientDetailPage;
