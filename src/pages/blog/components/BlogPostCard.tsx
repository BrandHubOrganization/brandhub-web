import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import type { BlogPost, BlogPostSummary, BlogCategory } from "@/data/blogTypes";

interface BlogPostCardProps {
  post: BlogPost | BlogPostSummary;
  categoryMeta?: BlogCategory;
}

export function BlogPostCard({ post, categoryMeta }: BlogPostCardProps) {
  return (
    <article className="group rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-orange/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover Image & Category Badges */}
        <Link
          to={`/blog/${post.slug}`}
          className="block relative aspect-16/9 overflow-hidden bg-muted"
        >
          <img
            src={post.coverImage}
            alt={post.coverImageAlt}
            width={800}
            height={450}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="rounded-md bg-slate-950/90 backdrop-blur-xs text-white px-2.5 py-1 text-[11px] font-mono font-bold shadow-xs">
              #{String(post.topicNumber).padStart(3, "0")}
            </span>
            {categoryMeta && (
              <span className="rounded-full bg-brand-orange text-white px-3 py-1 text-[11px] font-semibold shadow-xs">
                {categoryMeta.shortName}
              </span>
            )}
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 text-brand-orange" />
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-brand-orange" />
              <span>{post.readingTimeMinutes} phút đọc</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-brand-orange transition-colors leading-snug line-clamp-2 min-h-[3.25rem] text-balance">
            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed text-pretty">
            {post.metaDescription}
          </p>

          {/* Target Audience / Roles */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {post.targetRoles.map((role) => (
              <span
                key={role}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground/80"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Author & Read More Footer */}
      <div className="px-5 py-3.5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
            {post.author.name
              .split(" ")
              .slice(-2)
              .map((w) => w[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
              <span>{post.author.name}</span>
              <ShieldCheck className="size-3 text-emerald-500 shrink-0" />
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {post.author.roleTitle.split("—")[0].trim()}
            </p>
          </div>
        </div>

        <Link
          to={`/blog/${post.slug}`}
          className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-brand-orange group-hover:underline cursor-pointer"
        >
          <span>Đọc bài</span>
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}

export default BlogPostCard;
