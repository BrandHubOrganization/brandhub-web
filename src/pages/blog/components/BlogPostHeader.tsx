import { Link } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  Calendar,
  Clock,
  UserCheck,
} from "lucide-react";
import type { BlogPost, BlogPostSummary, BlogCategory } from "@/data/blogTypes";

interface BlogPostHeaderProps {
  post: BlogPost | BlogPostSummary;
  categoryMeta?: BlogCategory;
}

export function BlogPostHeader({ post, categoryMeta }: BlogPostHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link to="/" className="hover:text-brand-orange transition-colors font-medium">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link to="/blog" className="hover:text-brand-orange transition-colors font-medium">
          Blog
        </Link>
        {categoryMeta && (
          <>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link
              to={`/blog?category=${categoryMeta.slug}`}
              className="hover:text-brand-orange transition-colors font-medium"
            >
              {categoryMeta.shortName}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="text-foreground font-semibold line-clamp-1">
          {post.title}
        </span>
      </nav>

      {/* Article Header Card */}
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-orange/15 text-brand-orange px-3 py-1 text-xs font-bold">
            Chủ đề #{String(post.topicNumber).padStart(3, "0")}
          </span>
          {categoryMeta && (
            <Link
              to={`/blog?category=${categoryMeta.slug}`}
              className="rounded-full bg-muted hover:bg-muted/80 text-foreground px-3 py-1 text-xs font-semibold transition-colors"
            >
              {categoryMeta.name}
            </Link>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {post.metaDescription}
        </p>

        {/* Author & Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {post.author.name
                .split(" ")
                .slice(-2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {post.author.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="size-3" />
                  Tác giả xác thực
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {post.author.roleTitle} · {post.author.highlight}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5 text-brand-orange" />
              <span>Cập nhật:</span>
              <time dateTime={post.updatedAt}>{post.updatedAt}</time>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5 text-brand-orange" />
              {post.readingTimeMinutes} phút đọc
            </span>
            <span className="inline-flex items-center gap-1">
              <UserCheck className="size-3.5 text-brand-orange" />
              Dành cho: {post.targetRoles.join(", ")}
            </span>
          </div>
        </div>
      </header>
    </div>
  );
}

export default BlogPostHeader;
