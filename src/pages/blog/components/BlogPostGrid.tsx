import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, RotateCcw } from "lucide-react";
import type { BlogCategory, BlogCategorySlug, BlogPostSummary } from "@/data/blogTypes";
import { Button } from "@/components/ui/button";
import { BlogPostCard } from "./BlogPostCard";
import { BlogSpotlightContainer } from "./BlogMotion";

interface BlogPostGridProps {
  posts: BlogPostSummary[];
  getCategoryMeta: (slug: BlogCategorySlug) => BlogCategory | undefined;
  searchQuery: string;
  onClearFilters: () => void;
}

const INITIAL_PAGE_SIZE = 12;
const PAGE_STEP = 12;

export function BlogPostGrid({
  posts,
  getCategoryMeta,
  searchQuery,
  onClearFilters,
}: BlogPostGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [posts.length, searchQuery]);

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-12 text-center space-y-4 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
          <BookOpen className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Không tìm thấy bài viết phù hợp
          </h3>
          <p className="mx-auto max-w-md text-pretty text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-zinc-400">
            {searchQuery
              ? `Không có bài viết nào khớp với từ khóa "${searchQuery}". Thử từ khóa khác hoặc đặt lại bộ lọc.`
              : "Chưa có bài viết nào trong bộ lọc hiện tại."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="cursor-pointer rounded-xl border-zinc-200 bg-white text-xs font-semibold hover:border-brand-orange/40 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900"
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          Đặt lại bộ lọc
        </Button>
      </div>
    );
  }

  const displayedPosts = posts.slice(0, visibleCount);
  const remainingPosts = posts.slice(visibleCount);

  return (
    <section aria-labelledby="featured-library-heading" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <h2
            id="featured-library-heading"
            className="text-balance text-lg font-extrabold tracking-tight text-foreground sm:text-xl"
          >
            Thư viện Cẩm nang &amp; Hướng dẫn Thực chiến
          </h2>
          <p className="text-pretty text-xs text-muted-foreground sm:text-sm">
            Bài viết chi tiết kèm quy trình, checklist thực thi và bảng so sánh dành cho đội ngũ Agency &amp; In-house.
          </p>
        </div>
      </div>

      <BlogSpotlightContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {displayedPosts.map((post) => (
          <BlogPostCard
            key={post.id}
            post={post}
            categoryMeta={getCategoryMeta(post.category)}
          />
        ))}
      </BlogSpotlightContainer>

      {remainingPosts.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setVisibleCount((prev) => Math.min(posts.length, prev + PAGE_STEP))
            }
            className="h-10 cursor-pointer rounded-xl border-zinc-200 bg-white px-5 text-xs font-semibold text-zinc-800 shadow-2xs transition-all hover:border-brand-orange/45 hover:bg-orange-50/40 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <ChevronDown className="mr-1.5 size-4 text-brand-orange" />
            Xem thêm{" "}
            <span className="tabular-nums mx-1">
              {Math.min(PAGE_STEP, remainingPosts.length)}
            </span>{" "}
            bài viết (còn {remainingPosts.length})
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setVisibleCount(posts.length)}
            className="h-10 cursor-pointer rounded-xl px-4 text-xs font-semibold text-muted-foreground hover:text-brand-orange"
          >
            Hiển thị tất cả ({posts.length})
          </Button>
        </div>
      )}

      {/* Keep remaining article links crawlable in pre-rendered HTML without cluttering the viewport */}
      {remainingPosts.length > 0 && (
        <nav aria-label="Danh sách bài viết bổ sung" className="sr-only">
          <ul>
            {remainingPosts.map((post) => (
              <li key={post.id}>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}

export default BlogPostGrid;
