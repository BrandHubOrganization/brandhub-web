import {
  Briefcase,
  LayoutGrid,
  Layers,
  ListChecks,
  Scale,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { BLOG_CATEGORIES } from "@/data/blogCategories";
import type { BlogCategorySlug } from "@/data/blogTypes";
import { cn } from "@/lib/utils";
import { BlogSpotlightContainer } from "./BlogMotion";

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  ListChecks,
  Briefcase,
  Sparkles,
  Share2,
  Scale,
};

interface BlogCategoryGridProps {
  selectedCategory: string;
  categoryCounts: Record<BlogCategorySlug, number>;
  onSelectCategory: (slug: BlogCategorySlug | "all") => void;
  totalPublishedCount: number;
}

export function BlogCategoryGrid({
  selectedCategory,
  categoryCounts,
  onSelectCategory,
  totalPublishedCount,
}: BlogCategoryGridProps) {
  return (
    <section aria-labelledby="blog-categories-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="blog-categories-heading"
            className="text-balance text-lg font-extrabold tracking-tight text-foreground sm:text-xl"
          >
            6 Trụ Cột Kiến Thức Dành Cho Agency &amp; Doanh Nghiệp
          </h2>
          <p className="text-pretty text-xs text-muted-foreground sm:text-sm">
            Chọn trụ cột bên dưới để lọc nhanh bộ tài liệu chuyên sâu theo nhu cầu đội ngũ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
            selectedCategory === "all"
              ? "border-brand-orange bg-brand-orange text-white shadow-xs"
              : "border-border bg-card text-muted-foreground hover:border-brand-orange/40 hover:text-foreground",
          )}
        >
          <LayoutGrid className="size-3.5" />
          <span>Tất cả</span>
          <span className="tabular-nums opacity-85">({totalPublishedCount})</span>
        </button>
      </div>

      <BlogSpotlightContainer className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICON_MAP[cat.iconName] ?? Layers;
          const isSelected = selectedCategory === cat.slug;
          const publishedInCat = categoryCounts[cat.slug] ?? 0;

          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() =>
                onSelectCategory(isSelected ? "all" : cat.slug)
              }
              aria-pressed={isSelected}
              className={cn(
                "bh-spotlight-card group relative flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/60 sm:p-5",
                isSelected
                  ? "border-brand-orange bg-orange-50/50 shadow-sm ring-1 ring-brand-orange/30 dark:bg-orange-500/10"
                  : "border-zinc-200/90 bg-white shadow-2xs hover:border-brand-orange/40 dark:border-zinc-800 dark:bg-zinc-900",
              )}
            >
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    isSelected
                      ? "border-brand-orange bg-brand-orange text-white"
                      : "border-zinc-200 bg-zinc-50 text-brand-orange group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white dark:border-zinc-700 dark:bg-zinc-800",
                  )}
                >
                  <Icon className="size-4" />
                </div>

                <span className="tabular-nums rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {publishedInCat > 0 ? publishedInCat : cat.plannedCount} bài
                </span>
              </div>

              <div className="relative z-10 space-y-1.5">
                <h3 className="text-sm font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-orange dark:text-zinc-100">
                  {cat.shortName}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {cat.description}
                </p>
              </div>
            </button>
          );
        })}
      </BlogSpotlightContainer>
    </section>
  );
}

export default BlogCategoryGrid;
