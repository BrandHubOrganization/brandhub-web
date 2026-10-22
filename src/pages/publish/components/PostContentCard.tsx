import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ExternalLink, CheckCircle2, Clock, AlertTriangle, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PostedDetailData } from "../types/postDetail";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

interface PostContentCardProps {
  post: PostedDetailData;
  workspaceId: string;
}

export function PostContentCard({ post, workspaceId }: PostContentCardProps) {
  const { t } = useTranslation();
  const meta = PLATFORM_META[post.platform];

  return (
    <div className="bg-card border-border rounded-xl border p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="border-border bg-background flex size-6 items-center justify-center rounded-md border"
              title={meta?.label || post.platform}
            >
              {meta?.icon}
            </span>
            <span className="text-foreground text-xs font-semibold">{meta?.label}</span>

            {/* Status */}
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
            {post.status === "FAILED" && (
              <span className="bg-destructive/10 text-destructive border-destructive/30 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-medium">
                <AlertTriangle className="size-3" />
                Thất bại
              </span>
            )}
          </div>
          <h1 className="text-foreground text-lg font-bold sm:text-xl">{post.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {post.platformUrl && (
            <a href={post.platformUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>{t("publish.detail.viewOnPlatform", "Mở trên MXH")}</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
          )}

          <Link to={`/workspaces/${workspaceId}/editor?postId=${post.postId}`}>
            <Button variant="orange" size="sm" className="gap-1.5 text-xs">
              <FileEdit className="size-3.5" />
              <span>{t("publish.detail.editDraft", "Chỉnh sửa bài viết")}</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Caption & Hashtags (2 cols) */}
        <div className="space-y-4 md:col-span-2">
          <div className="bg-muted/30 border-border rounded-xl border p-4">
            <h3 className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
              {t("publish.detail.captionTitle", "Nội dung bài viết")}
            </h3>
            <p className="text-foreground text-xs leading-relaxed whitespace-pre-line mt-2">
              {post.caption}
            </p>
          </div>

          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="bg-brand-orange-soft text-brand-orange rounded-md px-2 py-0.5 text-2xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media Preview (1 col) */}
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-3xs font-semibold uppercase tracking-wider">
            {t("publish.detail.mediaTitle", "Hình ảnh / Video đính kèm")}
          </h3>
          {post.mediaUrls.length > 0 ? (
            <div className="border-border overflow-hidden rounded-xl border bg-black/5 dark:bg-white/5">
              <img
                src={post.mediaUrls[0]}
                alt={post.title}
                className="h-56 w-full object-cover transition-transform hover:scale-105 duration-300"
              />
            </div>
          ) : (
            <div className="bg-muted/40 border-border text-muted-foreground flex h-36 items-center justify-center rounded-xl border text-xs">
              Không có hình ảnh đính kèm
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
