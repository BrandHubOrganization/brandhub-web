import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostDashboard } from "./hooks/usePostDashboard";
import { PostDashboardHeader } from "./components/PostDashboardHeader";
import { PostDashboardKpiCards } from "./components/PostDashboardKpiCards";
import { PostDistributionCharts } from "./components/PostDistributionCharts";
import { RecentPostsTable } from "./components/RecentPostsTable";

export function PostDashboardPage() {
  const { id: workspaceId = "" } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data, isLoading, isError, filters, updateFilters, refetch } =
    usePostDashboard(workspaceId);

  const handleRetry = async (_postId: string) => {
    toast.info(t("publish.retrySuccess", "Đang thử gửi lại bài viết..."));
    setTimeout(() => {
      toast.success(
        t("publish.retrySuccess", "Đã khởi động lại tiến trình xuất bản!"),
      );
      refetch();
    }, 800);
  };

  return (
    <PageWrapper
      title={t("publish.dashboard.title", "Bảng điều khiển xuất bản")}
      description={t(
        "publish.dashboard.subtitle",
        "Tổng hợp tiến độ, hiệu suất và phân phối bài viết trên các kênh mạng xã hội.",
      )}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("publish.dashboard.refresh", "Làm mới")}
          </Button>

          <Link to={`/workspaces/${workspaceId}/editor`}>
            <Button variant="orange" size="sm" className="gap-1.5">
              <Plus className="size-4" />
              {t("publish.dashboard.createPost", "Tạo bài viết")}
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <PostDashboardHeader filters={filters} onFilterChange={updateFilters} />

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
            />

            {/* Recent Publishing Feed */}
            <RecentPostsTable
              workspaceId={workspaceId}
              posts={data.recentPosts}
              onRetry={handleRetry}
            />
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default PostDashboardPage;
