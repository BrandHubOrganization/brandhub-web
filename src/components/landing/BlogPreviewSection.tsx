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
import { SectionDecor } from "@/components/landing/SectionDecor";

export function BlogPreviewSection() {
  const featuredPosts = BLOG_FEATURED_POSTS;

  return (
    <section
      id="blog-insights"
      aria-labelledby="blog-insights-heading"
      className="relative py-20 lg:py-28 bg-zinc-50/80 dark:bg-zinc-900/50 border-t border-zinc-200/70 dark:border-zinc-800/80 overflow-hidden"
    >
      <SectionDecor corner="right" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 px-3.5 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              <BookOpen className="size-3.5" />
              <span>Cẩm nang Quản trị Truyền thông &amp; AI Thực chiến</span>
            </div>
            <h2
              id="blog-insights-heading"
              className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight"
            >
              Kiến thức vận hành{" "}
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">
                Agency, Gói Truyền thông &amp; AI Studio
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Khám phá cách chuẩn hóa quy trình làm việc như Jira &amp; Notion, thiết kế
              Gói truyền thông (Media Package), ứng dụng AI GraphRAG và tự động hóa
              lịch đăng trên Facebook, Instagram, TikTok và Threads.
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-brand-orange hover:bg-orange-600 dark:hover:bg-brand-orange/90 text-white px-5 py-3 text-sm font-bold transition-colors self-start lg:self-auto shrink-0 shadow-sm"
          >
            <span>Khám phá toàn bộ Blog &amp; 100 Chủ đề</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Category Quick Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 mr-1">
            <Layers className="size-3.5 text-orange-500" /> Chuyên mục:
          </span>
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/blog?category=${cat.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-orange-400 dark:hover:border-orange-500/60 hover:text-orange-600 dark:hover:text-orange-400 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all shadow-2xs"
            >
              <span>{cat.shortName}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">
                ({cat.plannedCount})
              </span>
            </Link>
          ))}
        </div>

        {/* 6 Pillar Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => {
            const cat = BLOG_CATEGORIES.find((c) => c.slug === post.category);
            return (
              <article
                key={post.id}
                className="group rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block relative aspect-16/9 overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                  >
                    <img
                      src={post.coverImage}
                      alt={post.coverImageAlt}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="rounded-full bg-zinc-950/80 text-white px-2.5 py-0.5 text-[11px] font-bold">
                        #{String(post.topicNumber).padStart(3, "0")}
                      </span>
                      {cat && (
                        <span className="rounded-full bg-orange-600 text-white px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
                          {cat.shortName}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5 text-orange-500" />
                        {post.publishedAt}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-orange-500" />
                        {post.readingTimeMinutes} phút đọc
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {post.metaDescription}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {post.author.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {post.author.roleTitle}
                    </p>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700"
                  >
                    <span>Đọc bài viết</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Conversion Strip */}
        <div className="rounded-2xl border border-orange-200/80 dark:border-orange-500/30 bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 dark:from-orange-950/30 dark:via-zinc-900 dark:to-orange-950/30 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="hidden sm:flex size-10 rounded-xl bg-orange-600 text-white items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Muốn áp dụng ngay các quy trình này cho đội ngũ của bạn?
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Khởi tạo Workspace miễn phí cho Owner, Manager, Creator và Client chỉ trong 30 giây.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/register"
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              Đăng ký dùng thử 0đ
            </Link>
            <Link
              to="/blog#roadmap-100-topics"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors"
            >
              Xem 100 chủ đề chuyên sâu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
