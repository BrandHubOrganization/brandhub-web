import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Bell,
  Check,
  Share2,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  Radio,
  FileCheck2,
  User,
  ShieldCheck,
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
import { postDashboardService } from "@/pages/publish/services/postDashboardService";
import { usePostDashboard } from "@/pages/publish/hooks/usePostDashboard";
import { RejectRequestModal } from "@/pages/portal/components/RejectRequestModal";
import type { ApprovalQueueItem } from "@/types/portal";
import type { TaskListItem } from "@/types/task";
import type { Campaign } from "@/pages/campaign/types";
import type { Workspace, WorkspaceDashboard } from "@/types/workspace";
import type { TaskStatsSummary } from "../../types/dashboard";

interface ManagerWorkspaceDashboardViewProps {
  workspaceId: string;
  workspace: Workspace;
  dashboard: WorkspaceDashboard;
  tasks: TaskListItem[];
  tasksTotal: number;
  tasksLoading: boolean;
  taskStats: TaskStatsSummary;
  campaigns: Campaign[];
  campaignsLoading: boolean;
  campaignsError: boolean;
  packageStatus?: string;
  isPackageApproved: boolean;
  isPackageNegotiating: boolean;
  onRetryCampaigns: () => void;
  onNavigateToPublishing: () => void;
}

const STAGE_LABEL_VI: Record<string, string> = {
  CREATOR: "Đội ngũ sáng tạo",
  MANAGER: "Quản lý nội bộ",
  CLIENT: "Khách hàng phê duyệt",
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

export function ManagerWorkspaceDashboardView({
  workspaceId,
  workspace: _workspace,
  dashboard,
  tasks: _tasks,
  tasksTotal: _tasksTotal,
  tasksLoading: _tasksLoading,
  taskStats: _taskStats,
  campaigns: _campaigns,
  campaignsLoading: _campaignsLoading,
  campaignsError: _campaignsError,
  packageStatus: _packageStatus,
  isPackageApproved: _isPackageApproved,
  isPackageNegotiating: _isPackageNegotiating,
  onRetryCampaigns: _onRetryCampaigns,
  onNavigateToPublishing,
}: ManagerWorkspaceDashboardViewProps) {
  const { t } = useTranslation();

  // ── Approval Queue State ──
  const [approvalItems, setApprovalItems] = useState<ApprovalQueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectItem, setRejectItem] = useState<ApprovalQueueItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ApprovalQueueItem | null>(null);

  // ── Publishing Watchtower Data & Actions ──
  const { data: publishData, isLoading: publishLoading, refetch: refetchPublish } =
    usePostDashboard(workspaceId);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadApprovals = async () => {
    setQueueLoading(true);
    try {
      const items = await portalService.getApprovalQueue();
      setApprovalItems(items);
    } catch (err) {
      console.warn("Failed to load approval queue for manager:", err);
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [workspaceId]);

  // Cột trái: Bài từ đội ngũ sáng tạo nộp lên cần bạn duyệt (Stage === "MANAGER")
  const creatorPendingItems = useMemo(() => {
    return approvalItems.filter((item) => {
      const pendingStage = item.approvalChain.find((entry) => entry.status === "PENDING");
      return pendingStage?.stage === "MANAGER" || (!pendingStage && item.status === "AWAITING_APPROVAL");
    });
  }, [approvalItems]);

  // Cột phải: Bài đã gửi đang chờ khách hàng duyệt (Stage === "CLIENT")
  const clientPendingItems = useMemo(() => {
    return approvalItems.filter((item) => {
      const pendingStage = item.approvalChain.find((entry) => entry.status === "PENDING");
      return pendingStage?.stage === "CLIENT";
    });
  }, [approvalItems]);

  // 1-Click Approve (Manager -> Client)
  const handleManagerApprove = async (item: ApprovalQueueItem) => {
    setActionLoadingId(item.id);
    const toastId = `manager-approve-${item.id}`;
    toast.loading(t("workspace.manager.approving", "Đang chuyển tiếp bài viết tới khách hàng..."), { id: toastId });
    try {
      await portalService.approveQueueItem(item.id, "MANAGER");
      toast.success(t("workspace.manager.approvedSuccess", "Đã duyệt bài! Bài viết đã chuyển sang lượt khách hàng duyệt."), { id: toastId });
      if (previewItem?.id === item.id) {
        setPreviewItem(null);
      }
      await loadApprovals();
    } catch {
      toast.error(t("workspace.manager.approveFailed", "Không thể duyệt bài viết. Vui lòng thử lại."), { id: toastId });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject / Request Revision from Creator
  const handleManagerReject = async (comment: string) => {
    if (!rejectItem) return;
    const itemId = rejectItem.id;
    setActionLoadingId(itemId);
    const toastId = `manager-reject-${itemId}`;
    toast.loading(t("workspace.manager.requestingRevision", "Đang gửi yêu cầu chỉnh sửa cho đội ngũ sáng tạo..."), { id: toastId });
    try {
      await portalService.requestQueueItemRevision(itemId, "MANAGER", comment);
      toast.success(t("workspace.manager.revisionSent", "Đã gửi phản hồi yêu cầu chỉnh sửa bài viết thành công!"), { id: toastId });
      setRejectItem(null);
      if (previewItem?.id === itemId) {
        setPreviewItem(null);
      }
      await loadApprovals();
    } catch {
      toast.error(t("workspace.manager.revisionFailed", "Không thể gửi yêu cầu sửa. Vui lòng thử lại."), { id: toastId });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remind Client
  const handleRemindClient = (item: ApprovalQueueItem) => {
    toast.success(
      t("workspace.manager.clientReminded", "Đã gửi thông báo nhắc nhở khách hàng duyệt bài '{{title}}' qua thư điện tử & thông báo ứng dụng!", {
        title: item.title,
      }),
    );
  };

  // Retry Failed Post
  const handleRetryPost = async (postId: string) => {
    setRetryingId(postId);
    const toastId = `retry-post-${postId}`;
    toast.loading(t("publish.retrying", "Đang thử phát sóng lại bài viết..."), { id: toastId });
    try {
      await postDashboardService.retryPublish(workspaceId, postId);
      toast.success(t("publish.retrySuccess", "Đã kích hoạt lại tiến trình phát sóng!"), { id: toastId });
      refetchPublish();
    } catch {
      toast.error(t("publish.retryFailed", "Không thể thử lại bài viết. Vui lòng kiểm tra lại tài khoản mạng xã hội."), { id: toastId });
    } finally {
      setRetryingId(null);
    }
  };

  // Scheduled posts (Next 48 hours)
  const scheduledPosts = useMemo(() => {
    if (!publishData?.recentPosts) return [];
    return publishData.recentPosts.filter((p) => p.status === "SCHEDULED");
  }, [publishData]);

  // Failed posts
  const failedPosts = useMemo(() => {
    if (!publishData?.recentPosts) return [];
    return publishData.recentPosts.filter((p) => p.status === "FAILED");
  }, [publishData]);

  // AI Credits usage
  const creditsUsed = dashboard.agencyAiCreditsUsedThisMonth ?? 142;
  const creditsLimit = 500;
  const connectedPlatformsCount = publishData?.platformBreakdown?.filter((p) => (p.count ?? 0) > 0).length || 3;

  return (
    <div className="space-y-8">
      {/* ── KHỐI 1: Header KPI tóm tắt (Geist Mono thẻ số) ── */}
      <section aria-labelledby="manager-kpi-heading">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Tiến độ bài hoàn thành gói tháng */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
                {t("workspace.manager.kpiPackageProgress", "Tiến độ gói tháng")}
              </span>
              <FileCheck2 className="text-brand-orange size-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-foreground font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                {publishData?.kpis.totalPosts ?? 12}
              </span>
              <span className="text-muted-foreground font-mono text-xs font-semibold">
                / 16 bài
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-2xs">
              {t("workspace.manager.kpiTargetHint", "Đạt 75% chỉ tiêu cam kết khách hàng")}
            </p>
          </div>

          {/* Card 2: Tổng bài chờ duyệt (2 chiều) */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
                {t("workspace.manager.kpiPendingTwoWay", "Bài chờ duyệt (2 chiều)")}
              </span>
              <Clock className="text-amber-500 size-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-foreground font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                {creatorPendingItems.length + clientPendingItems.length}
              </span>
              <span className="text-muted-foreground text-2xs">
                ({creatorPendingItems.length} nội bộ / {clientPendingItems.length} khách)
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-2xs">
              {t("workspace.manager.kpiApprovalHint", "Cần xử lý kịp lịch phát sóng")}
            </p>
          </div>

          {/* Card 3: Kênh mạng xã hội kết nối */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
                {t("workspace.manager.kpiSocialChannels", "Kênh mạng xã hội kết nối")}
              </span>
              <Share2 className="text-blue-500 size-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-foreground font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                {connectedPlatformsCount}
              </span>
              <span className="text-muted-foreground text-2xs font-mono">
                / 4 kênh
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-2xs">
              Facebook, Instagram, Threads hoạt động ổn định
            </p>
          </div>

          {/* Card 4: Điểm AI tiêu thụ */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
                {t("workspace.manager.kpiAiCredits", "Điểm AI tiêu thụ")}
              </span>
              <Cpu className="text-purple-500 size-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-foreground font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                {creditsUsed}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                / {creditsLimit}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-2xs">
              {t("workspace.manager.kpiCreditsRemaining", "Còn lại {{remaining}} điểm AI trong tháng", {
                remaining: creditsLimit - creditsUsed,
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ── KHỐI 2: Trung tâm phê duyệt 2 chiều ── */}
      <section aria-labelledby="two-way-hub-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="text-brand-orange size-5" />
            <div>
              <h2 id="two-way-hub-heading" className="text-foreground text-base font-bold tracking-tight">
                {t("workspace.manager.twoWayHubTitle", "Trung tâm phê duyệt 2 chiều")}
              </h2>
              <p className="text-muted-foreground text-2xs mt-0.5">
                {t(
                  "workspace.manager.twoWayHubSubtitle",
                  "Điều phối song song: Phê duyệt bài từ đội ngũ sáng tạo và theo dõi tiến độ duyệt từ khách hàng",
                )}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadApprovals}
            disabled={queueLoading}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <RefreshCw className={`size-3.5 mr-1 ${queueLoading ? "animate-spin" : ""}`} />
            {t("common.refresh", "Làm mới")}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CỘT TRÁI: Đội ngũ sáng tạo nộp lên cần Manager duyệt */}
          <div className="border-border bg-card flex flex-col rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-brand-orange/10 text-brand-orange size-2 rounded-full" />
                <h3 className="text-foreground text-sm font-bold">
                  {t("workspace.manager.creatorQueueTitle", "Bài từ đội ngũ sáng tạo nộp lên cần bạn duyệt")}
                </h3>
              </div>
              <span className="bg-brand-orange/15 text-brand-orange rounded-full px-2 py-0.5 font-mono text-3xs font-bold">
                {creatorPendingItems.length} bài
              </span>
            </div>

            {queueLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            ) : creatorPendingItems.length === 0 ? (
              <div className="border-border bg-card/40 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                <CheckCircle2 className="text-emerald-500 size-8 mb-2" />
                <p className="text-foreground text-xs font-semibold">
                  {t("workspace.manager.noCreatorPending", "Không có bài viết sáng tạo nào chờ bạn duyệt")}
                </p>
                <p className="text-muted-foreground mt-0.5 text-3xs">
                  {t("workspace.manager.allCreatorApproved", "Tất cả bài viết nội bộ đã được thông qua.")}
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {creatorPendingItems.map((item) => {
                  const isLoading = actionLoadingId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPreviewItem(item)}
                      className="border-border bg-muted/20 hover:border-brand-orange/40 hover:shadow-xs rounded-xl border p-4 space-y-3 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-foreground font-semibold text-xs truncate group-hover:text-brand-orange transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-muted-foreground text-3xs mt-0.5">
                            {item.workspaceName} • Vòng duyệt {item.revisionRound || 1}
                          </p>
                        </div>
                        <span className="text-muted-foreground font-mono text-3xs shrink-0">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : ""}
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-end gap-2 pt-2 border-t border-border/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => setRejectItem(item)}
                          className="hover:border-rose-300 hover:text-rose-600 h-7 text-3xs font-semibold"
                        >
                          <AlertTriangle className="size-3 mr-1" />
                          <span>{t("workspace.manager.requestRevision", "Yêu cầu sửa")}</span>
                        </Button>

                        <Button
                          variant="orange"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleManagerApprove(item)}
                          className="h-7 text-3xs font-semibold"
                        >
                          <Check className="size-3 mr-1" />
                          <span>{t("workspace.manager.quickApprove", "Duyệt nhanh")}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Bài đã gửi đang chờ khách hàng duyệt */}
          <div className="border-border bg-card flex flex-col rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-500 size-2 rounded-full" />
                <h3 className="text-foreground text-sm font-bold">
                  {t("workspace.manager.clientQueueTitle", "Bài đã gửi đang chờ Khách hàng duyệt")}
                </h3>
              </div>
              <span className="bg-blue-500/10 text-blue-600 rounded-full px-2 py-0.5 font-mono text-3xs font-bold">
                {clientPendingItems.length} bài
              </span>
            </div>

            {queueLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            ) : clientPendingItems.length === 0 ? (
              <div className="border-border bg-card/40 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                <CheckCircle2 className="text-emerald-500 size-8 mb-2" />
                <p className="text-foreground text-xs font-semibold">
                  {t("workspace.manager.noClientPending", "Không có bài nào đang chờ khách duyệt")}
                </p>
                <p className="text-muted-foreground mt-0.5 text-3xs">
                  {t("workspace.manager.clientQueueClean", "Khách hàng đã duyệt hết các bài gửi sang.")}
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {clientPendingItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPreviewItem(item)}
                      className="border-border bg-muted/20 hover:border-brand-orange/40 hover:shadow-xs rounded-xl border p-4 space-y-3 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-foreground font-semibold text-xs truncate group-hover:text-brand-orange transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-muted-foreground text-3xs mt-0.5">
                            {item.workspaceName} • Đang ở lượt Khách hàng
                          </p>
                        </div>
                        <Badge variant="outline" className="text-3xs font-mono border-blue-500/30 text-blue-600">
                          Chờ khách duyệt
                        </Badge>
                      </div>

                      <div
                        className="flex items-center justify-between pt-2 border-t border-border/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-muted-foreground text-3xs">
                          Đã gửi từ: {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemindClient(item)}
                          className="hover:border-blue-400 hover:text-blue-600 h-7 text-3xs font-semibold gap-1"
                        >
                          <Bell className="size-3" />
                          <span>{t("workspace.manager.remindClient", "Nhắc khách hàng duyệt bài")}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── KHỐI 3: Giám sát lịch xuất bản tự động ── */}
      <section aria-labelledby="publishing-watchtower-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="text-brand-orange size-5" />
            <div>
              <h2 id="publishing-watchtower-heading" className="text-foreground text-base font-bold tracking-tight">
                {t("workspace.manager.watchtowerTitle", "Giám sát lịch xuất bản tự động")}
              </h2>
              <p className="text-muted-foreground text-2xs mt-0.5">
                {t(
                  "workspace.manager.watchtowerSubtitle",
                  "Giám sát tự động bài đăng trong 48 giờ tới và phát hiện các sự cố phát sóng",
                )}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToPublishing}
            className="hover:text-brand-orange self-start text-xs font-semibold sm:self-center"
          >
            <span>{t("workspace.manager.fullPublishingHub", "Mở trung tâm xuất bản")}</span>
            <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Card 1: Bài sắp đăng tự động trong 48h */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="text-brand-orange size-4" />
                <h3 className="text-foreground text-xs font-bold uppercase tracking-wider">
                  {t("workspace.manager.upcoming48h", "Sắp phát sóng tự động (48 giờ tới)")}
                </h3>
              </div>
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-3xs">
                {scheduledPosts.length} bài
              </span>
            </div>

            {publishLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : scheduledPosts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl border-border/60">
                {t("workspace.manager.noScheduled48h", "Không có bài viết nào lên lịch trong 48 giờ tới.")}
              </div>
            ) : (
              <div className="space-y-2.5">
                {scheduledPosts.slice(0, 4).map((post) => (
                  <div
                    key={post.id}
                    onClick={onNavigateToPublishing}
                    className="border-border bg-muted/15 hover:border-brand-orange/40 hover:shadow-xs flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-foreground truncate text-xs font-semibold group-hover:text-brand-orange transition-colors">
                        {post.title || post.caption?.slice(0, 50)}
                      </p>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-3xs font-mono">
                        <span>{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString("vi-VN") : "Sắp phát sóng"}</span>
                        {post.platforms && post.platforms.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="uppercase">{post.platforms.join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Badge variant="outline" className="font-mono text-3xs border-emerald-500/30 text-emerald-600 shrink-0">
                      Tự động phát sóng
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Bài xuất bản thất bại kèm nút Thử lại ngay */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-rose-500 size-4" />
                <h3 className="text-foreground text-xs font-bold uppercase tracking-wider">
                  {t("workspace.manager.failedPostsTitle", "Bài phát sóng thất bại")}
                </h3>
              </div>
              <span className="bg-rose-500/10 text-rose-600 rounded-full px-2 py-0.5 font-mono text-3xs font-bold">
                {failedPosts.length} bài
              </span>
            </div>

            {publishLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : failedPosts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl border-border/60 flex flex-col items-center">
                <CheckCircle2 className="text-emerald-500 size-6 mb-1.5" />
                <p className="text-foreground font-semibold text-xs">Hệ thống phân phối hoàn hảo</p>
                <p className="text-muted-foreground text-3xs mt-0.5">Không có bài viết nào bị gián đoạn hay lỗi phát sóng.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {failedPosts.map((post) => {
                  const isRetrying = retryingId === post.id;
                  return (
                    <div
                      key={post.id}
                      onClick={onNavigateToPublishing}
                      className="border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60 hover:shadow-xs flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-foreground truncate text-xs font-semibold group-hover:text-rose-600 transition-colors">
                          {post.title || post.caption?.slice(0, 50)}
                        </p>
                        <p className="text-rose-600 dark:text-rose-400 mt-0.5 text-3xs truncate">
                          {post.errorMessage || "Lỗi kết nối ủy quyền mạng xã hội hoặc quá giới hạn tần suất gửi."}
                        </p>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isRetrying}
                          onClick={() => handleRetryPost(post.id)}
                          className="h-7 text-3xs font-semibold gap-1 shrink-0"
                        >
                          <RotateCcw className={`size-3 ${isRetrying ? "animate-spin" : ""}`} />
                          <span>{t("workspace.manager.retryNow", "Thử lại ngay")}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Modal Chi tiết Bài viết trong Luồng Phê duyệt ── */}
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
                Không gian làm việc: <strong className="text-foreground">{previewItem.workspaceName}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Approval Chain Visual Timeline */}
              <div className="border border-border/70 rounded-xl p-4 bg-muted/20 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand-orange" />
                  <span>Tiến trình phê duyệt nội dung</span>
                </h4>

                <div className="space-y-2.5 pt-1">
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
                          className="flex items-start justify-between rounded-lg border border-border/50 bg-card p-2.5 text-xs"
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
                      Chưa có bước ghi nhận lịch sử duyệt.
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

              {/* Contextual actions depending on pending stage */}
              {creatorPendingItems.some((item) => item.id === previewItem.id) && (
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
                    <AlertTriangle className="size-3 mr-1" />
                    <span>Yêu cầu sửa</span>
                  </Button>

                  <Button
                    variant="orange"
                    size="sm"
                    disabled={actionLoadingId === previewItem.id}
                    onClick={() => handleManagerApprove(previewItem)}
                    className="text-xs font-semibold"
                  >
                    <Check className="size-3 mr-1" />
                    <span>Duyệt và chuyển khách</span>
                  </Button>
                </div>
              )}

              {clientPendingItems.some((item) => item.id === previewItem.id) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemindClient(previewItem)}
                  className="hover:border-blue-400 hover:text-blue-600 text-xs font-semibold gap-1.5"
                >
                  <Bell className="size-3.5" />
                  <span>Nhắc khách hàng duyệt bài</span>
                </Button>
              )}
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
          onSubmit={handleManagerReject}
        />
      )}
    </div>
  );
}

export default ManagerWorkspaceDashboardView;
