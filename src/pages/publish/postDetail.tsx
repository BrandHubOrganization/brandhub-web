import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostDetail } from "@/pages/publish/hooks/usePostDetail";
import { PostPlatformTabs } from "@/pages/publish/components/PostPlatformTabs";
import { PostEngagementCards } from "@/pages/publish/components/PostEngagementCards";
import { PostContentCard } from "@/pages/publish/components/PostContentCard";
import { PostCommentsSection } from "@/pages/publish/components/PostCommentsSection";
import type { Platform } from "@/types/post";

function PostDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export function PostDetailPage() {
  const { id: workspaceId = "", postId = "" } = useParams<{ id: string; postId: string }>();
  const { t } = useTranslation();
  const { data, isLoading, isRefreshing, isError, refreshMetrics, refetch } =
    usePostDetail(workspaceId, postId);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const activePlatform: Platform =
    selectedPlatform || data?.targetPlatforms?.[0] || data?.platform || "FACEBOOK";
  const activePlatformData = (data && data.platformData?.[activePlatform]) || null;
  const activeMetrics = activePlatformData?.metrics || data?.metrics;
  const displayPost =
    data && activePlatformData
      ? {
          ...data,
          platform: activePlatform,
          status: activePlatformData.status,
          platformUrl: activePlatformData.platformUrl || data.platformUrl,
        }
      : data
        ? { ...data, platform: activePlatform }
        : null;

  return (
    <PageWrapper
      title={t("publish.detail.title", "Chi tiết bài viết")}
      description={t(
        "publish.detail.subtitle",
        "Thống kê hiệu quả tương tác thực tế và bình luận từ nền tảng mạng xã hội.",
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
        {isLoading && !data && <PostDetailSkeleton />}
        {isError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl border p-6 text-center">
            <p className="text-sm font-semibold">
              {t("publish.detail.loadError", "Không thể tải chi tiết bài viết.")}
            </p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-3 text-xs">
              {t("publish.retry", "Thử lại")}
            </Button>
          </div>
        )}
        {data && displayPost && activeMetrics && (
          <>
            <PostPlatformTabs
              platforms={data.targetPlatforms}
              selectedPlatform={activePlatform}
              platformData={data.platformData}
              fallbackStatus={data.status}
              onSelectPlatform={setSelectedPlatform}
              onRetry={refreshMetrics}
            />
            <PostContentCard post={displayPost} workspaceId={workspaceId} />
            <PostEngagementCards
              metrics={activeMetrics}
              onRefreshMetrics={refreshMetrics}
              isRefreshing={isRefreshing}
            />
            <PostCommentsSection
              workspaceId={workspaceId}
              postId={postId}
              activePlatform={activePlatform}
              refreshKey={activeMetrics.lastSyncedAt}
            />
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default PostDetailPage;
