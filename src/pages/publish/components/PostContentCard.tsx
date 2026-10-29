import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ExternalLink, CheckCircle2, Clock, AlertTriangle, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";
import type { PostedDetailData } from "@/pages/publish/types/postDetail";

interface PostContentCardProps {
  post: PostedDetailData;
  workspaceId: string;
}

const STATUS_CONFIG = {
  PUBLISHED: { icon: CheckCircle2, key: "publish.status.PUBLISHED", fallback: "Đã đăng", cls: "bg-success/10 text-success border-success/25" },
  SCHEDULED: { icon: Clock, key: "publish.status.SCHEDULED", fallback: "Đã lên lịch", cls: "bg-muted text-muted-foreground border-border" },
  FAILED: { icon: AlertTriangle, key: "publish.status.FAILED", fallback: "Thất bại", cls: "bg-destructive/10 text-destructive border-destructive/25" },
} as const;

function PostStatusBadge({ status }: { status: PostedDetailData["status"] }) {
  const { t } = useTranslation();
  const conf = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!conf) return null;
  const Icon = conf.icon;

  return (
    <span className={cn("text-2xs inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-semibold", conf.cls)}>
      <Icon className="size-3" />
      {t(conf.key, conf.fallback)}
    </span>
  );
}

function PostHeaderMeta({ post }: { post: PostedDetailData }) {
  const meta = PLATFORM_META[post.platform];
  const publishedTime = post.publishedAt
    ? new Date(post.publishedAt).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="max-w-5xl space-y-2">
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className="border-border bg-background flex size-7 items-center justify-center rounded-lg border shadow-2xs"
          title={meta?.label || post.platform}
        >
          {meta?.icon}
        </span>
        <span className="text-foreground text-xs font-bold tracking-tight">
          {meta?.label || post.platform}
        </span>
        <PostStatusBadge status={post.status} />
        {publishedTime && (
          <span className="text-muted-foreground text-2xs font-mono tabular-nums">
            {publishedTime}
          </span>
        )}
      </div>
      <h1 className="text-foreground line-clamp-2 max-w-5xl text-xl font-bold tracking-tight sm:text-2xl">
        {post.title}
      </h1>
    </div>
  );
}

function PostHeaderActions({ post, workspaceId }: PostContentCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex shrink-0 items-center gap-2">
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
  );
}

function PostEditorialHeader({ post, workspaceId }: PostContentCardProps) {
  return (
    <div className="border-border/80 relative flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <PostHeaderMeta post={post} />
      <PostHeaderActions post={post} workspaceId={workspaceId} />
    </div>
  );
}

function getMediaAspectClass(count: number, index: number): string {
  if (count === 2) return "aspect-[4/5]";
  if (count === 3 && index === 0) return "col-span-2 aspect-[16/9]";
  return "aspect-square";
}

function SingleMediaTile({ url, title }: { url: string; title: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border bg-muted/20 group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border"
    >
      <img
        src={url}
        alt={title}
        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="bg-background/90 text-foreground border-border shadow-2xs absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
        <ExternalLink className="size-3.5" />
      </span>
    </a>
  );
}

function MediaGridBadge({ isLast, remaining }: { isLast: boolean; remaining: number }) {
  if (isLast) {
    return (
      <div className="bg-black/60 backdrop-blur-xs absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
        +{remaining}
      </div>
    );
  }
  return (
    <span className="bg-background/90 text-foreground border-border shadow-2xs absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full border opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
      <ExternalLink className="size-3" />
    </span>
  );
}

interface GridItemProps {
  url: string;
  index: number;
  totalCount: number;
  title: string;
}

function MediaGridItem({ url, index, totalCount, title }: GridItemProps) {
  const isLastWithMore = index === 3 && totalCount > 4;
  const aspectClass = getMediaAspectClass(totalCount, index);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("border-border bg-muted/20 group relative block w-full overflow-hidden rounded-xl border", aspectClass)}
    >
      <img
        src={url}
        alt={`${title} - ${index + 1}`}
        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <MediaGridBadge isLast={isLastWithMore} remaining={totalCount - 3} />
    </a>
  );
}

function MultiMediaGrid({ mediaUrls, title }: { mediaUrls: string[]; title: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {mediaUrls.slice(0, 4).map((url, idx) => (
        <MediaGridItem key={`${url}-${idx}`} url={url} index={idx} totalCount={mediaUrls.length} title={title} />
      ))}
    </div>
  );
}

function PostEditorialMediaGallery({ mediaUrls, title }: { mediaUrls: string[]; title: string }) {
  if (mediaUrls.length === 0) return null;
  if (mediaUrls.length === 1) return <SingleMediaTile url={mediaUrls[0]} title={title} />;
  return <MultiMediaGrid mediaUrls={mediaUrls} title={title} />;
}

function PostHashtagsList({ hashtags }: { hashtags: string[] }) {
  if (hashtags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {hashtags.map((tag) => (
        <span
          key={tag}
          className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 rounded-full border px-3 py-0.5 text-xs font-medium transition-colors hover:bg-brand-orange/15"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function PostCaptionBlock({ caption, hashtags }: { caption: string; hashtags: string[] }) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col justify-between space-y-6">
      <div className="space-y-4">
        {caption ? (
          <p className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
            {caption}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            {t("publish.detail.noCaption", "Không có nội dung mô tả")}
          </p>
        )}
      </div>
      <PostHashtagsList hashtags={hashtags} />
    </div>
  );
}

export function PostContentCard({ post, workspaceId }: PostContentCardProps) {
  const hasMedia = post.mediaUrls.length > 0;

  return (
    <article className="bg-card border-border relative overflow-hidden rounded-2xl border shadow-2xs">
      <div className="bg-brand-orange/5 pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl" />
      <PostEditorialHeader post={post} workspaceId={workspaceId} />

      <div className="relative grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:gap-8">
        <div className={cn(hasMedia ? "lg:col-span-6 xl:col-span-7" : "lg:col-span-12 max-w-4xl")}>
          <PostCaptionBlock caption={post.caption} hashtags={post.hashtags} />
        </div>

        {hasMedia && (
          <div className="lg:col-span-6 xl:col-span-5">
            <PostEditorialMediaGallery mediaUrls={post.mediaUrls} title={post.title} />
          </div>
        )}
      </div>
    </article>
  );
}
