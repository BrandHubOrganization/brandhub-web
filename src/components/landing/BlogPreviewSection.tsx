import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { BLOG_CATEGORIES } from "@/data/blogCategories";
import { BLOG_FEATURED_POSTS } from "@/data/blogFeatured";

export function BlogPreviewSection() {
  const featuredPosts = BLOG_FEATURED_POSTS;

  return (
    <section
      id="blog-insights"
      aria-labelledby="blog-insights-heading"
      className="border-t border-zinc-200/80 bg-zinc-50/70 py-24 dark:border-zinc-800/80 dark:bg-zinc-900/40"
    >
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <BookOpen className="size-3.5 text-brand-orange" />
              <span>Cẩm nang Quản trị Truyền thông &amp; AI Thực chiến</span>
            </div>
            <h2
              id="blog-insights-heading"
              className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100 leading-tight"
            >
              Kiến thức vận hành{" "}
              <span className="text-brand-orange">
                Agency, Gói Truyền thông &amp; AI Studio
              </span>
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
              Khám phá cách chuẩn hóa quy trình làm việc như Jira &amp; Notion, thiết kế
              Gói truyền thông (Media Package), ứng dụng AI GraphRAG và tự động hóa
              lịch đăng trên Facebook, Instagram, TikTok và Threads.
            </p>
          </div>

          <Link
            to="/blog"
            className="bg-brand-orange hover:bg-brand-orange/90 inline-flex shrink-0 items-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors lg:self-auto"
          >
            <span>Khám phá toàn bộ Blog &amp; 100 Chủ đề</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Category Quick Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <Layers className="size-3.5 text-brand-orange" /> Chuyên mục:
          </span>
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/blog?category=${cat.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:border-brand-orange/50 hover:text-brand-orange dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
            >
              <span>{cat.shortName}</span>
              <span className="tabular-nums text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                ({cat.plannedCount})
              </span>
            </Link>
          ))}
        </div>

        {/* 6 Pillar Articles Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post) => {
            const cat = BLOG_CATEGORIES.find((c) => c.slug === post.category);
            return (
              <article
                key={post.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="relative block aspect-16/9 overflow-hidden border-b border-zinc-100 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
                  >
                    <img
                      src={post.coverImage}
                      alt={post.coverImageAlt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>

                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      {cat ? (
                        <span className="truncate rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {cat.shortName}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="tabular-nums font-mono font-bold text-brand-orange">
                        #{String(post.topicNumber).padStart(3, "0")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="tabular-nums inline-flex items-center gap-1">
                        <Calendar className="size-3.5 text-brand-orange" />
                        {post.publishedAt}
                      </span>
                      <span className="tabular-nums inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-brand-orange" />
                        {post.readingTimeMinutes} phút đọc
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-orange sm:text-lg dark:text-zinc-100">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-400">
                      {post.metaDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {post.author.name}
                    </p>
                    <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {post.author.roleTitle}
                    </p>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-orange hover:underline"
                  >
                    <span>Đọc bài viết</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Conversion Strip */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs sm:flex-row sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange sm:flex">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 sm:text-base dark:text-zinc-100">
                Muốn áp dụng ngay các quy trình này cho đội ngũ của bạn?
              </p>
              <p className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
                Khởi tạo Workspace miễn phí cho Owner, Manager, Creator và Client chỉ trong 30 giây.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              to="/register"
              className="bg-brand-orange hover:bg-brand-orange/90 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors sm:text-sm"
            >
              Đăng ký dùng thử 0đ
            </Link>
            <Link
              to="/blog#danh-muc-100-chu-de"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-800 transition-colors hover:border-brand-orange/45 hover:text-brand-orange sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Xem 100 chủ đề chuyên sâu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
