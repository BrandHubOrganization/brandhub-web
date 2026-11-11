import { Search, X, ArrowUpDown, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BLOG_CATEGORIES } from "@/data/blogCategories";

export type BlogSortOption =
  | "newest"
  | "topic-asc"
  | "oldest"
  | "reading-asc"
  | "reading-desc"
  | "alpha-asc";

export const BLOG_SORT_OPTIONS: { id: BlogSortOption; label: string }[] = [
  { id: "newest", label: "Mới nhất (Mặc định)" },
  { id: "topic-asc", label: "Theo lộ trình (#001 → #100)" },
  { id: "oldest", label: "Cũ nhất" },
  { id: "reading-asc", label: "Đọc nhanh (≤ 9 phút)" },
  { id: "reading-desc", label: "Đọc chuyên sâu (≥ 10 phút)" },
  { id: "alpha-asc", label: "Tiêu đề (A-Z)" },
];

interface BlogToolbarProps {
  selectedCategory: string;
  categoryCounts: Record<string, number>;
  onSelectCategory: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: BlogSortOption;
  onSortChange: (sort: BlogSortOption) => void;
  displayedCount: number;
  totalCount: number;
}

export function BlogToolbar({
  selectedCategory,
  categoryCounts,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  displayedCount,
  totalCount,
}: BlogToolbarProps) {
  return (
    <section id="articles-section" aria-label="Tìm kiếm và chọn lọc bài viết" className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Thư viện Cẩm nang &amp; Hướng dẫn thực chiến</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            Toàn bộ bài viết chuyên sâu ({displayedCount} bài)
          </h2>
        </div>
        <a
          href="#roadmap-100-topics"
          className="text-xs font-semibold text-brand-orange hover:underline inline-flex items-center gap-1"
        >
          <span>Xem lộ trình 100 chủ đề bên dưới</span>
          <ArrowRight className="size-3.5" />
        </a>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer",
            selectedCategory === "all"
              ? "bg-brand-orange text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
          )}
        >
          Tất cả ({categoryCounts["all"] || totalCount})
        </button>
        {BLOG_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.slug] || 0;
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(isActive ? "all" : cat.slug)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                isActive
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
              )}
            >
              <span>{cat.shortName}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-background/80 text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border shadow-2xs">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 size-4" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm bài viết theo tiêu đề, từ khóa, vai trò (Owner, Manager, Client)..."
            className="pl-9 pr-9 h-10 bg-background border-border/80 text-foreground placeholder:text-muted-foreground rounded-xl text-xs sm:text-sm focus-visible:ring-brand-orange"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown & Counter */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as BlogSortOption)}
              aria-label="Sắp xếp bài viết"
              className="h-10 px-3 rounded-xl bg-background border border-border/80 text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-orange cursor-pointer"
            >
              {BLOG_SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap hidden lg:inline font-medium">
            Hiển thị <strong className="text-foreground">{displayedCount}</strong> / {totalCount} bài
          </span>
        </div>
      </div>
    </section>
  );
}

export default BlogToolbar;
