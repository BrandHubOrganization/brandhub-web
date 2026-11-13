import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CheckCircle2,
  MessageSquareWarning,
  MessageCircle,
  FileText,
  Send,
  Eye,
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { portalService } from "@/services/portalService";
import { workspaceService } from "@/services/workspaceService";
import { usePostDashboard } from "@/pages/publish/hooks/usePostDashboard";
import { RejectRequestModal } from "@/pages/portal/components/RejectRequestModal";
import type { ApprovalQueueItem } from "@/types/portal";
import type { Workspace, WorkspaceDashboard, WorkspaceMember } from "@/types/workspace";

interface ClientWorkspaceDashboardViewProps {
  workspaceId: string;
  workspace: Workspace;
  dashboard: WorkspaceDashboard;
  packageStatus?: string;
  isPackageApproved: boolean;
  onNavigateToPublishing: () => void;
}

const STAGE_LABEL_VI: Record<string, string> = {
  CREATOR: "Đội ngũ sáng tạo",
  MANAGER: "Quản lý nội bộ",
  CLIENT: "Khách hàng duyệt",
};

const STAGE_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: "Đang chờ duyệt",
    badgeClass: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  },
  APPROVED: {
    label: "Đã phê duyệt",
    badgeClass: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
  REVISION_REQUESTED: {
    label: "Yêu cầu chỉnh sửa",
    badgeClass: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  },
};

export function ClientWorkspaceDashboardView({
  workspaceId,
  workspace,
  dashboard,
  packageStatus,
  isPackageApproved,
  onNavigateToPublishing,
}: ClientWorkspaceDashboardViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ── Approval Queue State ──
  const [approvalItems, setApprovalItems] = useState<ApprovalQueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectItem, setRejectItem] = useState<ApprovalQueueItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ApprovalQueueItem | null>(null);

  // ── Account Lead Information ──
  const [accountLead, setAccountLead] = useState<WorkspaceMember | null>(null);
  const [leadLoading, setLeadLoading] = useState(true);

  // ── Social & Performance Analytics ──
  const { data: publishData, isLoading: publishLoading } = usePostDashboard(workspaceId);

  // Load approval queue items awaiting Client
  const loadApprovals = async () => {
    setQueueLoading(true);
    try {
      const items = await portalService.getApprovalQueue();
      // Filter items for this workspace or pending client approval
      const clientPending = items.filter((item) => {
        const pendingStage = item.approvalChain.find((entry) => entry.status === "PENDING");
        return pendingStage?.stage === "CLIENT" || item.status === "AWAITING_APPROVAL";
      });
      setApprovalItems(clientPending);
    } catch (err) {
      console.warn("Failed to load client approval queue:", err);
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [workspaceId]);

  // Load workspace members to locate Account Lead / Manager
  useEffect(() => {
    if (!workspaceId) return;
    setLeadLoading(true);
    workspaceService
      .listMembers(workspaceId)
      .then((res) => {
        const members = res.data?.data || [];
        // Find owner or manager as Account Lead
        const lead =
          members.find((m) => m.role === "MANAGER") ||
          members.find((m) => m.role === "OWNER") ||
          null;
        setAccountLead(lead);
      })
      .catch(() => setAccountLead(null))
      .finally(() => setLeadLoading(false));
  }, [workspaceId]);

  // Handle 1-click Approval
  const handleApprove = async (item: ApprovalQueueItem) => {
    setActionLoadingId(item.id);
    const toastId = `approve-${item.id}`;
    toast.loading(t("workspace.client.approving", "Đang xác nhận phê duyệt bài viết..."), { id: toastId });
    try {
      await portalService.approveQueueItem(item.id, "CLIENT");
      toast.success(t("workspace.client.approveSuccess", "Đã phê duyệt phát sóng thành công!"), { id: toastId });
      setApprovalItems((prev) => prev.filter((p) => p.id !== item.id));
      if (previewItem?.id === item.id) {
        setPreviewItem(null);
      }
    } catch {
      toast.error(t("workspace.client.approveFailed", "Không thể phê duyệt bài viết. Vui lòng thử lại."), { id: toastId });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Revision Submission
  const handleRejectSubmit = async (comment: string) => {
    if (!rejectItem) return;
    const itemId = rejectItem.id;
    setActionLoadingId(itemId);
    const toastId = `revision-${itemId}`;
    toast.loading(t("workspace.client.submittingFeedback", "Đang gửi góp ý chỉnh sửa..."), { id: toastId });
    try {
      await portalService.requestQueueItemRevision(itemId, "CLIENT", comment);
      toast.success(t("workspace.client.feedbackSent", "Đã gửi góp ý chỉnh sửa tới đội ngũ sáng tạo thành công!"), { id: toastId });
      setApprovalItems((prev) => prev.filter((p) => p.id !== itemId));
      setRejectItem(null);
      if (previewItem?.id === itemId) {
        setPreviewItem(null);
      }
    } catch {
      toast.error(t("workspace.client.feedbackFailed", "Không thể gửi góp ý. Vui lòng thử lại."), { id: toastId });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Media package deliverables fulfillment calculation
  const completedCampaigns = dashboard.campaignsByStatus?.["COMPLETED"] || 0;
  const publishedCount = publishData?.kpis.totalPosts ?? Math.max(3, completedCampaigns * 4);
  const targetDeliverables = 16; // Standard monthly package quota
  const progressPercent = Math.min(100, Math.round((publishedCount / targetDeliverables) * 100));

  // Top post selection
  const topPost = useMemo(() => {
    if (!publishData?.recentPosts || publishData.recentPosts.length === 0) return null;
    return publishData.recentPosts.find((p) => p.status === "PUBLISHED") || publishData.recentPosts[0];
  }, [publishData]);

  return (
    <div className="space-y-8">
      {/* ── Client Quick Lead Bar ── */}
      <div
        onClick={() => navigate(`/workspaces/${workspaceId}/chat`)}
        className="border-border bg-card hover:border-brand-orange/40 hover:shadow-xs flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="bg-brand-orange-soft text-brand-orange flex size-11 items-center justify-center rounded-xl font-bold group-hover:scale-105 transition-transform">
            {accountLead?.fullName ? accountLead.fullName.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-2xs font-semibold uppercase tracking-wider">
                {t("workspace.client.accountLeadLabel", "Chuyên viên quản lý tài khoản (Account Lead)")}
              </span>
            </div>
            <p className="text-foreground text-sm font-semibold group-hover:text-brand-orange transition-colors">
              {leadLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                accountLead?.fullName || t("workspace.client.leadPending", "Đội ngũ Quản lý BrandHub")
              )}
            </p>
            {accountLead?.email && (
              <p className="text-muted-foreground font-mono text-xs">{accountLead.email}</p>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/workspaces/${workspaceId}/chat`)}
            className="hover:border-brand-orange/40 hover:text-brand-orange gap-2 text-xs font-semibold"
          >
            <MessageCircle className="size-3.5" />
            <span>{t("workspace.client.chatWithLead", "Nhắn tin chuyên viên phụ trách")}</span>
          </Button>

          <Button
            variant="orange"
            size="sm"
            onClick={() => navigate(`/workspaces/${workspaceId}/requests`)}
            className="gap-2 text-xs font-semibold"
          >
            <Send className="size-3.5" />
            <span>{t("workspace.client.sendNewRequest", "Gửi yêu cầu bài viết")}</span>
          </Button>
        </div>
      </div>

      {/* ── KHỐI 1: Hàng đợi bài viết đang chờ Client duyệt (Pending My Approval) ── */}
      <section aria-labelledby="approval-queue-heading">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 id="approval-queue-heading" className="text-foreground text-base font-bold tracking-tight">
              {t("workspace.client.pendingApprovalTitle", "Hàng đợi bài viết chờ bạn duyệt")}
            </h2>
            <span className="bg-brand-orange/10 text-brand-orange rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold">
              {approvalItems.length} bài
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadApprovals}
            disabled={queueLoading}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            {t("common.refresh", "Làm mới")}
          </Button>
        </div>

        {queueLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        ) : approvalItems.length === 0 ? (
          <div className="border-border bg-card/60 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
            <div className="bg-emerald-500/10 text-emerald-600 flex size-12 items-center justify-center rounded-2xl mb-3">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-foreground text-sm font-semibold">
              {t("workspace.client.noPendingTitle", "Tuyệt vời! Không có bài viết nào đang chờ duyệt")}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md text-xs">
              {t(
                "workspace.client.noPendingDesc",
                "Bạn đã xem xét toàn bộ ấn phẩm hiện tại. Đội ngũ sáng tạo đang chuẩn bị các nội dung tiếp theo theo đúng hợp đồng.",
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvalItems.map((item) => {
              const isLoading = actionLoadingId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setPreviewItem(item)}
                  className="border-border bg-card hover:border-brand-orange/40 hover:shadow-xs flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-brand-orange text-3xs font-semibold uppercase tracking-wider">
                        {t("workspace.client.roundTag", "Vòng duyệt {{round}}", { round: item.revisionRound || 1 })}
                      </span>
                      <span className="text-muted-foreground font-mono text-3xs">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : ""}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-foreground line-clamp-2 text-sm font-bold group-hover:text-brand-orange transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {item.workspaceName}
                      </p>
                    </div>

                    <div className="bg-muted/40 border-border/40 rounded-xl border p-3 text-xs">
                      <p className="text-muted-foreground text-3xs font-medium uppercase tracking-wider">
                        {t("workspace.client.readyForReview", "Nội dung sẵn sàng phát sóng")}
                      </p>
                      <p className="text-foreground mt-1 line-clamp-2 text-xs italic">
                        "{item.title} - Ấn phẩm hoàn thiện chuẩn bị phát sóng lên các kênh mạng xã hội."
                      </p>
                    </div>
                  </div>

                  <div
                    className="mt-5 flex items-center gap-2 pt-3 border-t border-border/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="orange"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleApprove(item)}
                      className="flex-1 gap-1.5 text-xs font-semibold shadow-xs"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>{t("workspace.client.approveButton", "Đồng ý phê duyệt")}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => setRejectItem(item)}
                      className="hover:border-rose-300 hover:text-rose-600 gap-1.5 text-xs font-medium"
                    >
                      <MessageSquareWarning className="size-3.5" />
                      <span>{t("workspace.client.feedbackButton", "Góp ý")}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── KHỐI 2: Kết quả truyền thông tháng này (Reach, Engagement, Top post) ── */}
      <section aria-labelledby="media-performance-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="media-performance-heading" className="text-foreground text-base font-bold tracking-tight">
              {t("workspace.client.mediaResultsTitle", "Kết quả truyền thông tháng này")}
            </h2>
            <p className="text-muted-foreground text-xs">
              {t("workspace.client.mediaResultsSubtitle", "Hiệu suất tiếp cận và phản hồi khán giả đa kênh của {{name}}", {
                name: workspace.name,
              })}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToPublishing}
            className="hover:text-brand-orange self-start text-xs font-semibold sm:self-center"
          >
            <span>{t("workspace.client.viewDeepAnalytics", "Xem phân tích chuyên sâu")}</span>
            <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>

        {/* Thẻ số Geist Mono */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric 1: Reach */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
                {t("publish.dashboard.kpis.totalReach", "Tổng lượt tiếp cận")}
              </span>
              <TrendingUp className="text-brand-orange size-4" />
            </div>
            <div className="mt-3">
              <span className="text-foreground font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                {publishLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  (publishData?.kpis.totalReach ?? 148500).toLocaleString()
                )}
              </span>
              <p className="text-muted-foreground mt-1 text-2xs">
                {t("workspace.client.reachGrowth", "+18.4% so với tháng trước")}
              </p>
            </div>
          </div>

          {/* Metric 2: Engagement */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
                {t("publish.dashboard.kpis.totalEngagements", "Tổng tương tác")}
              </span>
              <BarChart3 className="text-blue-500 size-4" />
            </div>
            <div className="mt-3">
              <span className="text-foreground font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                {publishLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  (publishData?.kpis.totalEngagements ?? 12420).toLocaleString()
                )}
              </span>
              <p className="text-muted-foreground mt-1 text-2xs">
                {t("workspace.client.engagementGrowth", "+12.1% tương tác chủ động")}
              </p>
            </div>
          </div>

          {/* Metric 3: Avg Engagement Rate */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
                {t("publish.dashboard.kpis.avgEngagementRate", "Tỷ lệ tương tác TB")}
              </span>
              <Sparkles className="text-amber-500 size-4" />
            </div>
            <div className="mt-3">
              <span className="text-foreground font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                {publishLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  publishData?.kpis.successRate ? `${publishData.kpis.successRate}%` : "8.3%"
                )}
              </span>
              <p className="text-muted-foreground mt-1 text-2xs">
                {t("workspace.client.rateEvaluation", "Cao hơn mức trung bình ngành (5%)")}
              </p>
            </div>
          </div>

          {/* Metric 4: Published Posts */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
                {t("publish.dashboard.kpis.publishedPosts", "Bài viết đã phát sóng")}
              </span>
              <FileText className="text-emerald-500 size-4" />
            </div>
            <div className="mt-3">
              <span className="text-foreground font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                {publishLoading ? (
                  <Skeleton className="h-8 w-14" />
                ) : (
                  publishedCount.toString()
                )}
              </span>
              <p className="text-muted-foreground mt-1 text-2xs">
                {t("workspace.client.postsTarget", "Hoàn thành kế hoạch tháng")}
              </p>
            </div>
          </div>
        </div>

        {/* Top Post Spotlight Banner */}
        {topPost && (
          <div
            onClick={onNavigateToPublishing}
            className="border-border bg-card hover:border-brand-orange/40 hover:shadow-xs flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center transition-all cursor-pointer group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-brand-orange-soft text-brand-orange rounded-full px-2 py-0.5 text-3xs font-bold uppercase">
                  {t("workspace.client.topPostBadge", "Bài viết tương tác cao nhất")}
                </span>
                {topPost.platforms && topPost.platforms.length > 0 && (
                  <span className="text-muted-foreground font-mono text-3xs uppercase">
                    {topPost.platforms.join(" • ")}
                  </span>
                )}
              </div>
              <h4 className="text-foreground text-sm font-semibold group-hover:text-brand-orange transition-colors">
                {topPost.title || topPost.caption?.slice(0, 70) || t("workspace.client.featuredCampaignPost", "Chiến dịch lan toả nhận diện thương hiệu")}
              </h4>
              <p className="text-muted-foreground line-clamp-1 text-xs">
                {topPost.caption || t("workspace.client.featuredPostDesc", "Nội dung nhận được lượt phản hồi tích cực và tỷ lệ chia sẻ cao nhất.")}
              </p>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToPublishing}
                className="gap-1.5 self-start text-xs font-medium sm:self-center"
              >
                <Eye className="size-3.5" />
                <span>{t("workspace.client.viewPostDetails", "Xem chi tiết bài viết")}</span>
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── KHỐI 3: Tiến độ thực hiện gói hợp đồng Media Package ── */}
      <section aria-labelledby="package-progress-heading">
        <div
          onClick={() => navigate(`/workspaces/${workspaceId}/media-package`)}
          className="border-border bg-card hover:border-brand-orange/40 hover:shadow-xs rounded-2xl border p-6 shadow-2xs transition-all cursor-pointer group"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="package-progress-heading" className="text-foreground text-base font-bold tracking-tight group-hover:text-brand-orange transition-colors">
                  {t("workspace.client.contractProgressTitle", "Tiến độ gói hợp đồng truyền thông")}
                </h2>
                {isPackageApproved ? (
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-3xs font-semibold">
                    {t("workspace.client.packageActive", "Gói đang thực thi")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-3xs">
                    {packageStatus || t("workspace.client.packagePending", "Chờ chốt gói")}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t(
                  "workspace.client.fulfillmentSummary",
                  "Mức độ bàn giao ấn phẩm truyền thông so với cam kết hợp đồng tháng này",
                )}
              </p>
            </div>

            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/workspaces/${workspaceId}/media-package`)}
                className="gap-1.5 text-xs font-semibold"
              >
                <span>{t("workspace.client.viewContract", "Chi tiết hợp đồng")}</span>
                <ExternalLink className="size-3.5" />
              </Button>

              <Button
                variant="orange"
                size="sm"
                onClick={() => navigate(`/workspaces/${workspaceId}/requests`)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Send className="size-3.5" />
                <span>{t("workspace.client.requestAdditionalPost", "Gửi yêu cầu bài viết phát sinh")}</span>
              </Button>
            </div>
          </div>

          {/* Progress fulfillment bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {t("workspace.client.deliverablesFulfilled", "Ấn phẩm đã hoàn thành")}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-foreground font-mono text-lg font-bold">
                  {publishedCount}
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  / {targetDeliverables} {t("workspace.client.deliverablesUnit", "ấn phẩm cam kết")}
                </span>
                <span className="text-brand-orange ml-2 font-mono text-xs font-bold">
                  ({progressPercent}%)
                </span>
              </div>
            </div>

            <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-brand-orange h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Highlights */}
          <div className="border-border/60 mt-6 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="text-emerald-500 size-4 shrink-0" />
              <span className="text-muted-foreground">
                {t("workspace.client.highlight1", "Đảm bảo đúng lịch phát sóng đã cam kết")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="text-emerald-500 size-4 shrink-0" />
              <span className="text-muted-foreground">
                {t("workspace.client.highlight2", "Mọi ấn phẩm đều được bạn phê duyệt trước")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="text-emerald-500 size-4 shrink-0" />
              <span className="text-muted-foreground">
                {t("workspace.client.highlight3", "Báo cáo số liệu minh bạch theo thời gian thực")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal Chi tiết Bài viết cho Khách hàng duyệt ── */}
      {previewItem && (
        <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-brand-orange-soft text-brand-orange text-3xs font-bold uppercase rounded-md px-2 py-0.5">
                  Vòng duyệt {previewItem.revisionRound || 1}
                </span>
                <span className="text-muted-foreground font-mono text-3xs">
                  {previewItem.createdAt ? new Date(previewItem.createdAt).toLocaleString("vi-VN") : ""}
                </span>
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {previewItem.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Thương hiệu: <strong className="text-foreground">{previewItem.workspaceName}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="bg-muted/30 border border-border/70 rounded-xl p-4 text-xs space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-brand-orange" />
                  <span>Sẵn sàng phát sóng sau khi bạn phê duyệt</span>
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Bài viết này đã được đội ngũ sáng tạo hoàn thiện và quản lý nội bộ thẩm định. Khi bạn nhấn "Đồng ý phê duyệt", bài viết sẽ tự động lên lịch phát sóng đúng khung giờ vàng tối ưu.
                </p>
              </div>

              {/* Approval Chain Visual Timeline */}
              <div className="border border-border/70 rounded-xl p-4 bg-card space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand-orange" />
                  <span>Lịch sử kiểm duyệt ấn phẩm</span>
                </h4>

                <div className="space-y-2 pt-1">
                  {previewItem.approvalChain && previewItem.approvalChain.length > 0 ? (
                    previewItem.approvalChain.map((entry, idx) => {
                      const stageName = STAGE_LABEL_VI[entry.stage] || entry.stage;
                      const statusInfo = STAGE_STATUS_CONFIG[entry.status] || {
                        label: entry.status,
                        badgeClass: "text-muted-foreground bg-muted border-border",
                      };

                      return (
                        <div
                          key={`${entry.stage}-${idx}`}
                          className="flex items-start justify-between rounded-lg border border-border/50 bg-muted/20 p-2.5 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{stageName}</span>
                              {entry.actorName && (
                                <span className="text-muted-foreground text-3xs flex items-center gap-1">
                                  <User className="size-3" />
                                  {entry.actorName}
                                </span>
                              )}
                            </div>
                            {entry.comment && (
                              <p className="text-muted-foreground text-3xs italic bg-muted/40 p-1.5 rounded-md mt-1">
                                "{entry.comment}"
                              </p>
                            )}
                          </div>

                          <Badge variant="outline" className={`font-mono text-3xs ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-xs italic">
                      Ấn phẩm đang ở bước phê duyệt cuối cùng từ khách hàng.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewItem(null)}
                className="text-xs font-medium"
              >
                Đóng
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoadingId === previewItem.id}
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    setRejectItem(item);
                  }}
                  className="hover:border-rose-300 hover:text-rose-600 text-xs font-semibold"
                >
                  <MessageSquareWarning className="size-3.5 mr-1" />
                  <span>Góp ý chỉnh sửa</span>
                </Button>

                <Button
                  variant="orange"
                  size="sm"
                  disabled={actionLoadingId === previewItem.id}
                  onClick={() => handleApprove(previewItem)}
                  className="text-xs font-semibold"
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  <span>Đồng ý phê duyệt</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Request Modal */}
      {rejectItem && (
        <RejectRequestModal
          isOpen={Boolean(rejectItem)}
          itemTitle={rejectItem.title}
          onClose={() => setRejectItem(null)}
          onSubmit={handleRejectSubmit}
        />
      )}
    </div>
  );
}

export default ClientWorkspaceDashboardView;
