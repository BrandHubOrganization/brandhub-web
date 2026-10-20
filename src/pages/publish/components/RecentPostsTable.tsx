import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ExternalLink, RotateCw, AlertTriangle, Clock, CheckCircle2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecentPostItem } from "../types/dashboard";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

interface RecentPostsTableProps {
  workspaceId: string;
  posts: RecentPostItem[];
  onRetry?: (postId: string) => void;
}

export function RecentPostsTable({
  workspaceId,
  posts,
  onRetry,
}: RecentPostsTableProps) {
  const { t } = useTranslation();

  if (posts.length === 0) {
    return (
      <div className="bg-card border-border flex flex-col items-center justify-center rounded-xl border p-12 text-center">
        <div className="bg-muted text-muted-foreground mb-3 flex size-12 items-center justify-center rounded-full">
          <FileEdit className="size-6" />
        </div>
        <h3 className="text-foreground text-sm font-semibold">
          {t("publish.dashboard.noPostsFound", "Không tìm thấy bài viết nào")}
        </h3>
        <p className="text-muted-foreground text-2xs mt-1 max-w-sm">
          {t(
            "publish.dashboard.noPostsFoundDesc",
            "Không có bài viết nào phù hợp với bộ lọc hiện tại. Thử thay đổi điều kiện lọc hoặc tạo bài viết mới.",
          )}
        </p>
        <Link to={`/workspaces/${workspaceId}/editor`} className="mt-4">
          <Button variant="orange" size="sm">
            {t("publish.dashboard.createPostNow", "Tạo bài viết ngay")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border">
      <div className="border-border border-b px-5 py-4">
        <h2 className="text-foreground text-sm font-bold">
          {t("publish.dashboard.recentPosts.title", "Hoạt động xuất bản gần đây")}
        </h2>
        <p className="text-muted-foreground text-2xs mt-0.5">
          {t("publish.dashboard.recentPosts.subtitle", "Danh sách bài viết mới nhất và trạng thái phân phối")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-border text-muted-foreground bg-muted/30 border-b">
              <th className="px-5 py-3 font-medium">Tiêu đề bài viết</th>
              <th className="px-5 py-3 font-medium">Nền tảng</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
              <th className="px-5 py-3 font-medium">Tác giả</th>
              <th className="px-5 py-3 font-medium">Thời gian</th>
              <th className="px-5 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                {/* Title & Caption snippet */}
                <td className="max-w-[280px] px-5 py-3.5">
                  <p className="text-foreground truncate font-medium">{post.title}</p>
                  <p className="text-muted-foreground text-2xs mt-0.5 truncate">{post.caption}</p>
                  {post.errorMessage && (
                    <div className="text-destructive mt-1 flex items-center gap-1 text-2xs">
                      <AlertTriangle className="size-3 shrink-0" />
                      <span className="truncate">{post.errorMessage}</span>
                    </div>
                  )}
                </td>

                {/* Platforms */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {post.platforms.map((platform) => {
                      const meta = PLATFORM_META[platform];
                      return (
                        <span
                          key={platform}
                          className="border-border bg-background flex size-6 items-center justify-center rounded-md border"
                          title={meta?.label || platform}
                        >
                          {meta?.icon}
                        </span>
                      );
                    })}
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  {post.status === "PUBLISHED" && (
                    <span className="bg-success/10 text-success border-success/30 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-medium">
                      <CheckCircle2 className="size-3" />
                      Đã đăng
                    </span>
                  )}
                  {post.status === "SCHEDULED" && (
                    <span className="bg-muted text-muted-foreground border-border inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-medium">
                      <Clock className="size-3" />
                      Đã lên lịch
                    </span>
                  )}
                  {post.status === "IN_PROGRESS" && (
                    <span className="bg-warning/10 text-warning border-warning/30 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-medium">
                      <RotateCw className="size-3 animate-spin" />
                      Đang xử lý
                    </span>
                  )}
                  {post.status === "FAILED" && (
                    <span className="bg-destructive/10 text-destructive border-destructive/30 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-medium">
                      <AlertTriangle className="size-3" />
                      Thất bại
                    </span>
                  )}
                </td>

                {/* Author */}
                <td className="px-5 py-3.5">
                  <span className="text-foreground font-medium">{post.authorName}</span>
                </td>

                {/* Time */}
                <td className="text-muted-foreground px-5 py-3.5 font-mono text-2xs">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : post.scheduledAt
                    ? new Date(post.scheduledAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {post.status === "FAILED" && onRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRetry(post.postId)}
                        className="text-destructive hover:bg-destructive/10 h-7 px-2 text-2xs"
                      >
                        <RotateCw className="mr-1 size-3" />
                        Thử lại
                      </Button>
                    )}
                    <Link to={`/workspaces/${workspaceId}/posts/${post.postId}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-2xs">
                        Chi tiết
                        <ExternalLink className="ml-1 size-3" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
