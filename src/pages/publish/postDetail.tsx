import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostDetail } from "./hooks/usePostDetail";
import { PostEngagementCards } from "./components/PostEngagementCards";
import { PostContentCard } from "./components/PostContentCard";
import { PostPublishingTimeline } from "./components/PostPublishingTimeline";
import { PostCommentsSection } from "./components/PostCommentsSection";

export function PostDetailPage() {
  const { id: workspaceId = "", postId = "" } = useParams<{
    id: string;
    postId: string;
  }>();
  const { t } = useTranslation();
  const { data, isLoading, isRefreshing, isError, refreshMetrics, refetch } =
    usePostDetail(workspaceId, postId);

  return (
    <PageWrapper
      title={data?.title || t("publish.detail.title", "Chi tiết bài viết")}
      description={t(
        "publish.detail.subtitle",
        "Thống kê hiệu quả tương tác thực tế, đường dẫn bài đăng và lịch sử kiểm toán.",
      )}
      actions={
        <Link to={`/workspaces/${workspaceId}/dashboard?tab=publishing`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" />
            <span>{t("publish.detail.backToDashboard", "Quay lại Bảng điều khiển")}</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Loading Skeleton */}
        {isLoading && !data && (
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl border p-6 text-center">
            <p className="text-sm font-semibold">
              {t("publish.detail.loadError", "Không thể tải chi tiết bài viết.")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="mt-3 text-xs"
            >
              {t("publish.retry", "Thử lại")}
            </Button>
          </div>
        )}

        {/* Loaded Data */}
        {data && (
          <>
            {/* Post Content & Media */}
            <PostContentCard post={data} workspaceId={workspaceId} />

            {/* Engagement Metrics (Likes, Comments, Shares, Reach) */}
            <PostEngagementCards
              metrics={data.metrics}
              onRefreshMetrics={refreshMetrics}
              isRefreshing={isRefreshing}
            />

            {/* Social Comments List (Live or Snapshot) */}
            <PostCommentsSection
              workspaceId={workspaceId}
              postId={postId}
            />

            {/* Timeline: RabbitMQ Dispatch Logs & Workspace Audit History */}
            <PostPublishingTimeline
              executionLogs={data.executionLogs}
              auditHistory={data.auditHistory}
            />
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default PostDetailPage;
