import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Repeat2,
  MoreHorizontal,
  BookOpen,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reaction } from "../ReactionPicker";

interface LinkedInPostProps {
  className?: string;
  authorName?: string;
  authorTitle?: string;
  content?: string;
  articleHeadline?: string;
  likes?: ReactNode;
  comments?: ReactNode;
  /** Ảnh article card — nếu có sẽ thay thế placeholder gradient. */
  imageUrl?: string;
  /** Reaction đã chọn (like/celebrate/support/love/insightful/funny) — đổi icon+màu nút Thích, persist sau khi picker đóng. */
  activeReaction?: Reaction | null;
}

/**
 * Mockup màn hình LinkedIn post/article.
 * Layout: professional header, article card, excerpt, stats + action bar.
 */
export function LinkedInPost({
  className,
  authorName,
  authorTitle,
  content,
  articleHeadline,
  likes = "892",
  comments = "67",
  imageUrl,
  activeReaction,
}: LinkedInPostProps) {
  const { t } = useTranslation();
  const resolvedAuthorName =
    authorName ?? t("landing.heroFeed.linkedin.0.authorName");
  const resolvedAuthorTitle =
    authorTitle ?? t("landing.heroFeed.linkedin.0.authorTitle");
  const resolvedContent = content ?? t("landing.heroFeed.linkedin.0.content");
  const resolvedArticleHeadline =
    articleHeadline ?? t("landing.heroFeed.linkedin.0.articleHeadline");
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-55 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-200/50 sm:max-w-107.5 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-950/60",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 px-4 pt-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-blue-900 text-sm font-bold text-white shadow-sm">
          SC
        </div>
        <div className="flex-1 leading-tight">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {resolvedAuthorName}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {resolvedAuthorTitle}
          </p>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>{t("landing.heroFeed.ui.timeAgoDays3")}</span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <GlobeMini className="size-2.5" />
          </div>
        </div>
        <MoreHorizontal className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
      </div>

      {/* Content */}
      <div className="px-4 pt-3">
        <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {resolvedContent}
        </p>
      </div>

      {/* Article card */}
      <div className="mx-4 mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-linear-to-br from-blue-700 via-blue-800 to-zinc-900">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="LinkedIn Pulse"
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="relative text-center">
              <div className="absolute top-1/2 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="relative mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-white/15 shadow-lg ring-1 ring-white/30 backdrop-blur">
                <BookOpen className="size-6 text-white" />
              </div>
              <p className="relative text-xs font-semibold text-white/90">
                {t("landing.heroFeed.ui.insights")}
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-zinc-200 bg-white px-3.5 py-3 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Newspaper className="size-2.5" />
              {t("landing.heroFeed.ui.article")}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {t("landing.heroFeed.ui.minRead")}
            </span>
          </div>
          <p className="text-sm leading-snug font-semibold text-zinc-800 dark:text-zinc-100">
            {resolvedArticleHeadline}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t("landing.heroFeed.ui.articleExcerpt")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 mt-3 flex items-center gap-4 border-b border-zinc-100 pb-3 dark:border-zinc-700/50">
        <div className="flex items-center gap-1">
          <span className="flex size-4 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-900">
            <ThumbsUp className="size-2 fill-white text-white" />
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {likes}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {comments} {t("landing.heroFeed.ui.commentsSuffix")}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("landing.heroFeed.ui.repostsCount")}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between px-2 py-1.5">
        {activeReaction ? (
          <button
            data-cursor-target="like"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            style={{ color: activeReaction.color }}
          >
            <activeReaction.icon
              className="size-[15px]"
              fill={activeReaction.color}
            />
            {activeReaction.label}
          </button>
        ) : (
          <LIActionBtn
            dataTarget="like"
            icon={ThumbsUp}
            label={t("landing.heroFeed.ui.like")}
          />
        )}
        <LIActionBtn
          dataTarget="comment"
          icon={MessageCircle}
          label={t("landing.heroFeed.ui.comment")}
        />
        <LIActionBtn
          dataTarget="repost"
          icon={Repeat2}
          label={t("landing.heroFeed.ui.repost")}
        />
        <LIActionBtn
          dataTarget="send"
          icon={Share2}
          label={t("landing.heroFeed.ui.send")}
        />
      </div>
    </div>
  );
}

function LIActionBtn({
  icon: Icon,
  label,
  dataTarget,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  dataTarget?: string;
}) {
  return (
    <button
      data-cursor-target={dataTarget}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      <Icon className="size-[18px]" />
      {label}
    </button>
  );
}

function GlobeMini({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default LinkedInPost;
