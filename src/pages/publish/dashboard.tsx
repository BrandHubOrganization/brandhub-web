import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostDashboard } from "./hooks/usePostDashboard";
import { postDashboardService } from "./services/postDashboardService";
import { PostDashboardHeader } from "./components/PostDashboardHeader";
import { PostDashboardKpiCards } from "./components/PostDashboardKpiCards";
import { PostDistributionCharts } from "./components/PostDistributionCharts";
import { RecentPostsTable } from "./components/RecentPostsTable";

interface PostDashboardViewProps {
  workspaceId: string;
}

export function PostDashboardView({ workspaceId }: PostDashboardViewProps) {
  const { t } = useTranslation();
  const [retryingPostId, setRetryingPostId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch, filters, updateFilters } =
    usePostDashboard(workspaceId);

  const handleRetry = async (postId: string) => {
    setRetryingPostId(postId);
    const toastId = `retry-${postId}`;
    toast.loading(t("publish.retrying", "Đang thử gửi lại bài viết..."), { id: toastId });
    try {
      await postDashboardService.retryPublish(workspaceId, postId);
      toast.success(
        t("publish.retrySuccess", "Đã khởi động lại tiến trình xuất bản!"),
        { id: toastId },
      );
      refetch();
    } catch {
      toast.error(
        t("publish.retryFailed", "Không thể thử lại bài viết. Vui lòng kiểm tra lại cấu hình tài khoản."),
        { id: toastId },
      );
    } finally {
      setRetryingPostId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-sm font-bold">
            {t("publish.dashboard.overviewTitle", "Hiệu suất Xuất bản Mạng xã hội")}
          </h2>
          <p className="text-muted-foreground text-2xs mt-0.5">
            {t(
              "publish.dashboard.overviewSubtitle",
              "Tổng hợp chỉ số phân phối bài viết và tương tác qua các kênh mạng xã hội kết nối",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>{t("publish.dashboard.refresh", "Làm mới")}</span>
          </Button>

          <Link to={`/workspaces/${workspaceId}/editor`}>
            <Button variant="orange" size="sm" className="gap-1.5 text-xs font-semibold">
              <Plus className="size-3.5" />
              <span>{t("publish.dashboard.createPost", "Tạo bài viết")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <PostDashboardHeader
        filters={filters}
        onFilterChange={updateFilters}
      />

      {/* Loading skeleton */}
      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-72 rounded-xl lg:col-span-2" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl border p-6 text-center">
          <p className="text-sm font-semibold">
            {t("publish.loadError", "Không thể tải dữ liệu bảng điều khiển.")}
          </p>
          <button
            onClick={refetch}
            className="text-destructive mt-2 text-xs font-medium underline hover:opacity-80"
          >
            {t("publish.retry", "Thử lại")}
          </button>
        </div>
      )}

      {/* Render Dashboard Content */}
      {data && (
        <>
          {/* KPI Cards */}
          <PostDashboardKpiCards kpis={data.kpis} />

          {/* Visual Analytics Charts */}
          <PostDistributionCharts
            platformBreakdown={data.platformBreakdown}
            publishingTrends={data.publishingTrends}
            kpis={data.kpis}
          />

          {/* Recent Publishing Feed */}
          <RecentPostsTable
            workspaceId={workspaceId}
            posts={data.recentPosts}
            onRetry={handleRetry}
            retryingPostId={retryingPostId}
          />
        </>
      )}
    </div>
  );
}

export function PostDashboardPage() {
  const { id: workspaceId = "" } = useParams<{ id: string }>();
  const { t } = useTranslation();

  return (
    <PageWrapper
      title={t("publish.dashboard.title", "Bảng điều khiển xuất bản")}
      description={t(
        "publish.dashboard.subtitle",
        "Tổng hợp tiến độ, hiệu suất và phân phối bài viết trên các kênh mạng xã hội.",
      )}
    >
      <PostDashboardView workspaceId={workspaceId} />
    </PageWrapper>
  );
}

export default PostDashboardPage;
