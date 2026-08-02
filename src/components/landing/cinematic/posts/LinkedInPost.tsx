import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Repeat2,
  MoreHorizontal,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkedInPostProps {
  className?: string;
  authorName?: string;
  authorTitle?: string;
  content?: string;
  articleHeadline?: string;
  likes?: string;
  comments?: string;
}

/**
 * Mockup màn hình LinkedIn post/article.
 * Layout: professional header, article card, excerpt, stats + action bar.
 */
export function LinkedInPost({
  className,
  authorName = "Sarah Chen",
  authorTitle = "Marketing Lead tại Global Brands Inc.",
  content = "Sau 6 tháng dùng BrandHub, team marketing của chúng tôi đã tăng 240% output content, giảm 80% thời gian approval. Đây là case study chi tiết về cách chúng tôi chuyển đổi workflow.",
  articleHeadline = "How BrandHub Transformed Our Content Operations — A Case Study",
  likes = "892",
  comments = "67",
}: LinkedInPostProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[430px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-200/50 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-950/60",
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
            {authorName}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {authorTitle}
          </p>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>3 ngày</span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <GlobeMini className="size-2.5" />
          </div>
        </div>
        <MoreHorizontal className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
      </div>

      {/* Content */}
      <div className="px-4 pt-3">
        <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {content}
        </p>
      </div>

      {/* Article card */}
      <div className="mx-4 mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="flex h-40 items-center justify-center bg-linear-to-br from-blue-100 via-white to-blue-50 dark:from-blue-950/30 dark:via-zinc-800 dark:to-blue-950/20">
          <div className="text-center">
            <BookOpen className="mx-auto size-8 text-blue-300 dark:text-blue-700" />
            <p className="mt-1 text-[10px] font-medium text-blue-400 dark:text-blue-600">
              LinkedIn Pulse
            </p>
          </div>
        </div>
        <div className="border-t border-zinc-200 bg-white px-3.5 py-3 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              📰 Article
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              5 phút đọc
            </span>
          </div>
          <p className="text-sm leading-snug font-semibold text-zinc-800 dark:text-zinc-100">
            {articleHeadline}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Từ manual workflow 3 ngày/content → automation 2 giờ/content. Cách
            BrandHub giúp team marketing scale output mà không cần thêm
            headcount.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 mt-3 flex items-center gap-4 border-b border-zinc-100 pb-3 dark:border-zinc-700/50">
        <div className="flex items-center gap-1">
          <span className="flex size-4 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white ring-2 ring-white dark:ring-zinc-900">
            👍
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {likes}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {comments} bình luận
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          12 repost
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <LIActionBtn icon={ThumbsUp} label="Thích" />
        <LIActionBtn icon={MessageCircle} label="Bình luận" />
        <LIActionBtn icon={Repeat2} label="Repost" />
        <LIActionBtn icon={Share2} label="Gửi" />
      </div>
    </div>
  );
}

function LIActionBtn({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
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
