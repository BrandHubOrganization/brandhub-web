import { ArrowUpDown, RotateCcw, Search, X } from "lucide-react";
import { BLOG_CATEGORIES } from "@/data/blogCategories";
import type { BlogCategorySlug } from "@/data/blogTypes";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type BlogSortOption =
  | "newest"
  | "shortest"
  | "longest"
  | "topic-order";

export const BLOG_SORT_OPTIONS: { id: BlogSortOption; label: string }[] = [
  { id: "newest", label: "Mới nhất" },
  { id: "topic-order", label: "Theo lộ trình #1-#100" },
  { id: "shortest", label: "Đọc nhanh nhất" },
  { id: "longest", label: "Chuyên sâu nhất" },
];

interface BlogToolbarProps {
  selectedCategory: string;
  categoryCounts: Record<BlogCategorySlug, number>;
  onSelectCategory: (slug: BlogCategorySlug | "all") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOption: BlogSortOption;
  onSortChange: (sort: BlogSortOption) => void;
  displayedCount: number;
  totalCount: number;
}

export function BlogToolbar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  displayedCount,
  totalCount,
}: BlogToolbarProps) {
  const activeCategoryMeta = BLOG_CATEGORIES.find(
    (c) => c.slug === selectedCategory,
  );
  const hasFilters = selectedCategory !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200/90 bg-white p-4 shadow-2xs sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Search Input + Sort Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm bài viết theo từ khóa, vai trò (Owner, Manager, Creator...), công cụ (Jira, Notion, GraphRAG)..."
            aria-label="Tìm kiếm bài viết"
            className="h-10 rounded-lg border-zinc-200 bg-zinc-50/70 pr-10 pl-10 text-sm text-foreground placeholder:text-zinc-400 focus-visible:ring-brand-orange dark:border-zinc-700 dark:bg-zinc-950/60"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <ArrowUpDown className="size-3.5 text-brand-orange" />
            <span>Sắp xếp:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200/90 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950/60">
            {BLOG_SORT_OPTIONS.map((opt) => {
              const active = sortOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSortChange(opt.id)}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    active
                      ? "bg-white font-semibold text-brand-orange shadow-2xs dark:bg-zinc-800 dark:text-orange-300"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Concise Status & Active Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
            Hiển thị{" "}
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
              {displayedCount}
            </strong>{" "}
            / {totalCount} bài viết
          </span>
          {activeCategoryMeta && (
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-orange transition-colors hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300"
            >
              <span>Trụ cột: {activeCategoryMeta.shortName}</span>
              <X className="size-3" />
            </button>
          )}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              onSelectCategory("all");
              onSearchChange("");
            }}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand-orange hover:underline"
          >
            <RotateCcw className="size-3" />
            Đặt lại bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}

export default BlogToolbar;
