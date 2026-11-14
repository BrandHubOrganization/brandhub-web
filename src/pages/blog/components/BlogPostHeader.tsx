import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Link2,
  Sparkles,
  Tag,
} from "lucide-react";
import type { BlogCategory, BlogPostSummary } from "@/data/blogTypes";
import { cn } from "@/lib/utils";

interface BlogPostHeaderProps {
  post: BlogPostSummary;
  categoryMeta?: BlogCategory;
}

export function BlogPostHeader({ post, categoryMeta }: BlogPostHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  return (
    <header className="space-y-6">
      {/* Top Breadcrumb + Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link to="/" className="transition-colors hover:text-brand-orange">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 opacity-60" />
          <Link
            to="/blog"
            className="transition-colors hover:text-brand-orange"
          >
            Blog
          </Link>
          {categoryMeta && (
            <>
              <ChevronRight className="size-3.5 opacity-60" />
              <Link
                to={`/blog?category=${categoryMeta.slug}`}
                className="font-medium transition-colors hover:text-brand-orange"
              >
                {categoryMeta.shortName}
              </Link>
            </>
          )}
        </nav>

        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 shadow-2xs transition-all hover:border-brand-orange/45 hover:text-brand-orange dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quay lại Thư viện</span>
        </Link>
      </div>

      {/* Category & Topic Metadata Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categoryMeta && (
          <Link
            to={`/blog?category=${categoryMeta.slug}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-transform hover:-translate-y-0.5",
              categoryMeta.badgeColor,
            )}
          >
            {categoryMeta.name}
          </Link>
        )}
        <span className="tabular-nums inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50/80 px-2.5 py-1 text-xs font-bold text-brand-orange dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300">
          Chuyên đề #{String(post.topicNumber).padStart(3, "0")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200/85 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <Sparkles className="size-3 text-brand-orange" />
          {post.searchIntent}
        </span>
      </div>

      {/* Article Title & Standfirst */}
      <div className="space-y-4">
        <h1 className="max-w-4xl text-balance text-2xl font-extrabold leading-[1.18] tracking-tight text-zinc-900 sm:text-3xl lg:text-[38px] dark:text-zinc-50">
          {post.title}
        </h1>
        <p className="max-w-3xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-[17px] dark:text-zinc-300">
          {post.metaDescription}
        </p>
        {post.hashtags && post.hashtags.length > 0 && (
          <div
            aria-label="Hashtag bài viết"
            className="flex flex-wrap items-center gap-1.5 pt-0.5"
          >
            {post.hashtags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?q=${encodeURIComponent(tag)}`}
                className="rounded-md border border-zinc-200/90 bg-zinc-50/90 px-2.5 py-0.5 font-mono text-xs font-semibold text-zinc-700 transition-colors hover:border-brand-orange/45 hover:bg-orange-50/80 hover:text-brand-orange dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-orange-500/40 dark:hover:text-orange-300"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Author & Reading Telemetry Strip */}
      <div className="flex flex-col justify-between gap-4 border-y border-zinc-200/80 py-4 sm:flex-row sm:items-center dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="size-10 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-sm font-bold text-brand-orange">
              {post.author.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {post.author.name}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {post.author.roleTitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="tabular-nums inline-flex items-center gap-1.5">
            <Calendar className="size-3.5 text-brand-orange" />
            <span>Cập nhật {post.updatedAt || post.publishedAt}</span>
          </span>
          <span className="tabular-nums inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-brand-orange" />
            <span>{post.readingTimeMinutes} phút đọc</span>
          </span>
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <Tag className="size-3.5 text-brand-orange" />
            <span>{post.targetRoles.join(" · ")}</span>
          </span>
          <button
            type="button"
            onClick={handleCopyUrl}
            aria-label="Sao chép liên kết bài viết"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 font-semibold text-zinc-700 transition-colors hover:border-brand-orange/45 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">
                  Đã sao chép
                </span>
              </>
            ) : (
              <>
                <Link2 className="size-3.5 text-brand-orange" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default BlogPostHeader;
