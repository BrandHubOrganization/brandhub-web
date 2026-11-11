import {
  Layers,
  ListChecks,
  Briefcase,
  Sparkles,
  Share2,
  Scale,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOG_CATEGORIES } from "@/data/blogCategories";

const CATEGORY_ICON_MAP: Record<string, typeof Layers> = {
  Layers,
  ListChecks,
  Briefcase,
  Sparkles,
  Share2,
  Scale,
};

interface BlogCategoryGridProps {
  selectedCategory: string;
  categoryCounts: Record<string, number>;
  onSelectCategory: (slug: string) => void;
  totalPublishedCount: number;
}

export function BlogCategoryGrid({
  selectedCategory,
  categoryCounts,
  onSelectCategory,
  totalPublishedCount,
}: BlogCategoryGridProps) {
  return (
    <section aria-label="Danh mục chủ đề" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Khám phá theo 6 Chuyên mục Cốt lõi
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Phân loại theo quy trình vận hành: Quản trị Workspace, Luồng duyệt nội dung, Gói dịch vụ, AI Studio và Đa kênh.
          </p>
        </div>
        {selectedCategory !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectCategory("all")}
            className="text-xs text-brand-orange hover:text-brand-orange/80 hover:bg-brand-orange/10 self-start sm:self-auto cursor-pointer rounded-xl font-semibold"
          >
            Xem tất cả chuyên mục ({totalPublishedCount} bài đã đăng)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BLOG_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICON_MAP[cat.iconName] || Layers;
          const isActive = selectedCategory === cat.slug;
          const count = categoryCounts[cat.slug] || 0;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                onSelectCategory(isActive ? "all" : cat.slug);
                document.getElementById("articles-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden ${
                isActive
                  ? "border-brand-orange bg-brand-orange/[0.06] shadow-md ring-1 ring-brand-orange/40"
                  : "border-border bg-card hover:border-brand-orange/50 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {/* Subtle top indicator bar when active */}
              {isActive && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-orange to-amber-500" />
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-brand-orange text-white shadow-xs"
                          : "bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white"
                      }`}
                    >
                      <Icon className="size-4.5 shrink-0" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-brand-orange transition-colors">
                      {cat.shortName}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {count} bài viết
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 text-balance group-hover:text-brand-orange transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed text-pretty">
                  {cat.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="text-muted-foreground font-medium">
                  {cat.plannedCount} chuyên đề nghiên cứu
                </span>
                <span className="text-brand-orange font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{isActive ? "Đang chọn" : "Khám phá"}</span>
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default BlogCategoryGrid;
