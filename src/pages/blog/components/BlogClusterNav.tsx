import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Compass, Layers } from "lucide-react";
import { BLOG_POST_SUMMARIES } from "@/data/blogLoader";
import type { BlogCategory, BlogPostSummary } from "@/data/blogTypes";
import { BlogSpotlightContainer } from "./BlogMotion";

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
      aria-label="Điều hướng cụm chủ đề liên quan"
      className="space-y-8 border-t border-zinc-200/80 pt-10 dark:border-zinc-800"
    >
      {/* Pillar + Prev / Next Cluster Navigator */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
            <Compass className="size-4 text-brand-orange" />
            <span>
              Điều hướng trong cụm:{" "}
              {categoryMeta?.shortName ?? currentPost.category} ({clusterCount}{" "}
              bài)
            </span>
          </div>
          {categoryMeta && (
            <Link
              to={`/blog?category=${categoryMeta.slug}`}
              className="text-xs font-semibold text-brand-orange hover:underline"
            >
              Xem toàn bộ cụm {categoryMeta.shortName} &rarr;
            </Link>
          )}
        </div>

        <BlogSpotlightContainer className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Pillar Reference */}
          {pillarPost && (
            <Link
              to={`/blog/${pillarPost.slug}`}
              className="bh-spotlight-card group flex flex-col justify-between gap-2 rounded-xl border border-brand-orange/40 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-md dark:border-orange-500/35 dark:bg-zinc-900"
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-orange">
                <Layers className="size-3.5" />
                {isCurrentPillar ? "Đang đọc Bài Trụ Cột" : "Bài Trụ Cột Cụm"}
              </span>
              <p className="line-clamp-2 text-xs font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-orange sm:text-sm dark:text-zinc-100">
                {pillarPost.title}
              </p>
              <span className="tabular-nums text-[11px] font-medium text-zinc-500">
                Chuyên đề #{String(pillarPost.topicNumber).padStart(3, "0")}
              </span>
            </Link>
          )}

          {/* Prev in Cluster */}
          {prevInCluster ? (
            <Link
              to={`/blog/${prevInCluster.slug}`}
              className="bh-spotlight-card group flex flex-col justify-between gap-2 rounded-2xl border border-zinc-200/85 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                <ArrowLeft className="size-3.5 text-brand-orange" />
                Bài trước trong cụm
              </span>
              <p className="line-clamp-2 text-xs font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-orange sm:text-sm dark:text-zinc-100">
                {prevInCluster.title}
              </p>
              <span className="tabular-nums text-[11px] text-zinc-500">
                Chuyên đề #{String(prevInCluster.topicNumber).padStart(3, "0")}
              </span>
            </Link>
          ) : (
            <div className="hidden rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4 md:flex md:items-center md:justify-center md:text-xs md:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/30">
              Đầu lộ trình cụm chủ đề
            </div>
          )}

          {/* Next in Cluster */}
          {nextInCluster ? (
            <Link
              to={`/blog/${nextInCluster.slug}`}
              className="bh-spotlight-card group flex flex-col justify-between gap-2 rounded-2xl border border-zinc-200/85 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="inline-flex items-center justify-end gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Bài tiếp theo trong cụm
                <ArrowRight className="size-3.5 text-brand-orange" />
              </span>
              <p className="line-clamp-2 text-xs font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-orange sm:text-sm dark:text-zinc-100">
                {nextInCluster.title}
              </p>
              <span className="tabular-nums text-right text-[11px] text-zinc-500">
                Chuyên đề #{String(nextInCluster.topicNumber).padStart(3, "0")}
              </span>
            </Link>
          ) : (
            <div className="hidden rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4 md:flex md:items-center md:justify-center md:text-xs md:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/30">
              Cuối lộ trình cụm chủ đề
            </div>
          )}
        </BlogSpotlightContainer>
      </div>

      {/* 4 Related Articles with Cover Image Previews */}
      {relatedPosts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-balance text-lg font-extrabold tracking-tight text-zinc-900 sm:text-xl dark:text-zinc-50">
            Đọc tiếp Các Chuyên đề Liên quan
          </h3>
          <BlogSpotlightContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                to={`/blog/${rp.slug}`}
                className="bh-spotlight-card group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/85 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={rp.coverImage}
                    alt={rp.coverImageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="tabular-nums absolute top-2 right-2 rounded-full border border-orange-200/80 bg-white/95 px-2 py-0.5 text-[10px] font-bold text-brand-orange shadow-xs dark:border-orange-500/30 dark:bg-zinc-900/90">
                    #{String(rp.topicNumber).padStart(3, "0")}
                  </span>
                </div>
                <div className="relative z-10 flex flex-1 flex-col justify-between space-y-2 p-4">
                  <h4 className="line-clamp-2 text-xs font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-orange sm:text-[13px] dark:text-zinc-100">
                    {rp.title}
                  </h4>
                  <span className="tabular-nums text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {rp.readingTimeMinutes} phút đọc &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </BlogSpotlightContainer>
        </div>
      )}
    </section>
  );
}

export default BlogClusterNav;
