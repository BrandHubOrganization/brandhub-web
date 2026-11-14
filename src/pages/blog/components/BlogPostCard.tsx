import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { BlogCategory, BlogPostSummary } from "@/data/blogTypes";

interface BlogPostCardProps {
  post: BlogPostSummary;
  categoryMeta?: BlogCategory;
}

export function BlogPostCard({ post, categoryMeta }: BlogPostCardProps) {
  return (
    <article className="bh-spotlight-card group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Clean 16:9 Cover Image Frame (zero overlay badges) */}
      <Link
        to={`/blog/${post.slug}`}
        className="relative aspect-[16/9] w-full overflow-hidden border-b border-zinc-100 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
      >
        <img
          src={post.coverImage}
          alt={post.coverImageAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      {/* Card Body */}
      <div className="relative z-10 flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-2.5">
          {/* Category & Topic Index Bar */}
          <div className="flex items-center justify-between gap-2 text-[11px]">
            {categoryMeta ? (
              <span className="truncate rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {categoryMeta.shortName}
              </span>
            ) : (
              <span />
            )}
            <span className="tabular-nums shrink-0 font-mono text-[11px] font-bold text-brand-orange">
              #{String(post.topicNumber).padStart(3, "0")}
            </span>
          </div>

          {/* Date & Reading Time */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums inline-flex items-center gap-1">
              <Calendar className="size-3.5 text-brand-orange/80" />
              {post.publishedAt}
            </span>
            <span className="tabular-nums inline-flex items-center gap-1">
              <Clock className="size-3.5 text-brand-orange/80" />
              {post.readingTimeMinutes} phút đọc
            </span>
            {post.targetRoles.slice(0, 2).map((role) => (
              <span
                key={role}
                className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {role}
              </span>
            ))}
          </div>

          <h3 className="text-balance text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-orange dark:text-zinc-100">
            <Link to={`/blog/${post.slug}`} className="focus:outline-none">
              {post.title}
            </Link>
          </h3>

          <p className="text-pretty line-clamp-3 text-xs leading-relaxed text-zinc-600 sm:text-[13px] dark:text-zinc-400">
            {post.metaDescription}
          </p>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.hashtags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?q=${encodeURIComponent(tag)}`}
                  className="rounded-md border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 transition-colors hover:border-brand-orange/45 hover:text-brand-orange dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-orange-400"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta: Author & Read CTA */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-2">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                loading="lazy"
                className="size-6 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
              />
            ) : (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-[10px] font-bold text-brand-orange">
                {post.author.name.slice(0, 1)}
              </span>
            )}
            <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {post.author.name}
            </span>
          </div>

          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-orange transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <span>Đọc tiếp</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BlogPostCard;
