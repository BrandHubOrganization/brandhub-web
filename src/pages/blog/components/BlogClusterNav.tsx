import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Compass, Layers } from "lucide-react";
import { BLOG_POST_SUMMARIES } from "@/data/blogLoader";
import type { BlogCategory, BlogPostSummary } from "@/data/blogTypes";

const PILLAR_TOPIC_BY_CATEGORY: Record<string, number> = {
  "agency-project-management": 1,
  "content-workflow-approval": 18,
  "media-package-campaign": 35,
  "ai-studio-graphrag-trends": 52,
  "multi-channel-publishing": 70,
  "tool-comparison-case-study": 86,
};

interface BlogClusterNavProps {
  currentPost: BlogPostSummary;
  categoryMeta?: BlogCategory;
  relatedPosts: BlogPostSummary[];
}

export function BlogClusterNav({
  currentPost,
  categoryMeta,
  relatedPosts,
}: BlogClusterNavProps) {
  const { pillarPost, prevInCluster, nextInCluster, clusterCount } =
    useMemo(() => {
      const sameCat = BLOG_POST_SUMMARIES.filter(
        (p) => p.category === currentPost.category,
      ).sort((a, b) => a.topicNumber - b.topicNumber);

      const idx = sameCat.findIndex((p) => p.slug === currentPost.slug);
      const pillarNum = PILLAR_TOPIC_BY_CATEGORY[currentPost.category];
      const pillar = sameCat.find((p) => p.topicNumber === pillarNum);

      return {
        pillarPost: pillar,
        prevInCluster: idx > 0 ? sameCat[idx - 1] : undefined,
        nextInCluster:
          idx >= 0 && idx < sameCat.length - 1 ? sameCat[idx + 1] : undefined,
        clusterCount: sameCat.length,
      };
    }, [currentPost.category, currentPost.slug]);

  const isCurrentPillar = pillarPost?.slug === currentPost.slug;

  return (
    <section
      aria-label="Điều hướng cụm chủ đề và bài viết liên quan"
      className="space-y-6 pt-6 border-t border-border"
    >
      {/* Category Pillar Hub Banner (for cluster articles) */}
      {pillarPost && !isCurrentPillar && (
        <div className="rounded-2xl border border-brand-orange/35 bg-gradient-to-r from-brand-orange/10 via-card to-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-orange uppercase tracking-wider">
              <Compass className="size-4" />
              <span>
                Bài viết Trụ cột (Pillar Guide) · Chuyên mục{" "}
                {categoryMeta?.shortName || "Kiến thức cốt lõi"} ({clusterCount}{" "}
                chủ đề)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-foreground leading-snug">
              <Link
                to={`/blog/${pillarPost.slug}`}
                className="hover:text-brand-orange transition-colors"
              >
                {pillarPost.title}
              </Link>
            </h2>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {pillarPost.metaDescription}
            </p>
          </div>
          <Link
            to={`/blog/${pillarPost.slug}`}
            className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-orange/90 transition-colors self-start md:self-center"
          >
            <span>Đọc bài Trụ cột</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Prev / Next Sequential Navigation inside the same Topic Cluster */}
      {(prevInCluster || nextInCluster) && (
        <nav
          aria-label="Điều hướng tuần tự trong chuyên mục"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {prevInCluster ? (
            <Link
              to={`/blog/${prevInCluster.slug}`}
              className="group rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-brand-orange/50 transition-all flex flex-col justify-between gap-2"
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground group-hover:text-brand-orange transition-colors">
                <ArrowLeft className="size-3.5" />
                <span>
                  Bài trước cùng chuyên mục (#{String(prevInCluster.topicNumber).padStart(3, "0")})
                </span>
              </span>
              <span className="text-sm font-bold text-foreground group-hover:text-brand-orange transition-colors line-clamp-2">
                {prevInCluster.title}
              </span>
            </Link>
          ) : (
            <Link
              to={
                categoryMeta
                  ? `/blog?category=${categoryMeta.slug}`
                  : "/blog"
              }
              className="group rounded-2xl border border-dashed border-border bg-card/60 p-4 sm:p-5 hover:border-brand-orange/50 transition-all flex flex-col justify-between gap-2"
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange">
                <Layers className="size-3.5" />
                <span>Tổng quan chuyên mục</span>
              </span>
              <span className="text-sm font-bold text-foreground group-hover:text-brand-orange transition-colors">
                Xem trọn bộ {clusterCount} bài phân tích thuộc{" "}
                {categoryMeta?.shortName || "chuyên mục này"}
              </span>
            </Link>
          )}

          {nextInCluster && (
            <Link
              to={`/blog/${nextInCluster.slug}`}
              className="group rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-brand-orange/50 transition-all flex flex-col justify-between gap-2 md:text-right md:items-end"
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground group-hover:text-brand-orange transition-colors">
                <span>
                  Bài tiếp theo cùng chuyên mục (#{String(nextInCluster.topicNumber).padStart(3, "0")})
                </span>
                <ArrowRight className="size-3.5" />
              </span>
              <span className="text-sm font-bold text-foreground group-hover:text-brand-orange transition-colors line-clamp-2">
                {nextInCluster.title}
              </span>
            </Link>
          )}
        </nav>
      )}

      {/* 4-Card Strategic Related Articles Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
            Bài viết liên quan trong mạng lưới kiến thức BrandHub
          </h2>
          <div className="flex items-center gap-4">
            {categoryMeta && (
              <Link
                to={`/blog?category=${categoryMeta.slug}`}
                className="text-xs font-semibold text-muted-foreground hover:text-brand-orange transition-colors"
              >
                Chuyên mục: {categoryMeta.shortName}
              </Link>
            )}
            <Link
              to="/blog"
              className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
            >
              <span>Xem trọn bộ 100 chủ đề</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedPosts.map((rel: BlogPostSummary) => (
            <Link
              key={rel.id}
              to={`/blog/${rel.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-brand-orange/50 hover:shadow-md transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-brand-orange">
                  Chủ đề #{String(rel.topicNumber).padStart(3, "0")} ·{" "}
                  {rel.readingTimeMinutes} phút đọc
                </span>
                <h3 className="text-sm font-bold text-foreground group-hover:text-brand-orange transition-colors leading-snug line-clamp-3">
                  {rel.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {rel.metaDescription}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange">
                <span>Đọc bài phân tích</span>
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogClusterNav;
