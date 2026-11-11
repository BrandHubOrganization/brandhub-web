import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostCard } from "./BlogPostCard";
import type { BlogPost, BlogPostSummary, BlogCategory } from "@/data/blogTypes";

interface BlogPostGridProps {
  posts: (BlogPost | BlogPostSummary)[];
  getCategoryMeta: (slug: BlogPost["category"]) => BlogCategory | undefined;
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
      <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Không tìm thấy bài viết nào khớp với từ khóa &quot;{searchQuery}&quot; trong chuyên mục này.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="cursor-pointer"
        >
          Xóa bộ lọc tìm kiếm
        </Button>
      </div>
    );
  }

  const displayedPosts = posts.slice(0, visibleCount);
  const remainingPosts = posts.slice(visibleCount);
  const hasMore = remainingPosts.length > 0;

  return (
    <section aria-label="Danh sách bài viết đã xuất bản" className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPosts.map((post) => (
          <BlogPostCard
            key={post.id}
            post={post}
            categoryMeta={getCategoryMeta(post.category)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() =>
              setVisibleCount((prev) => Math.min(posts.length, prev + PAGE_STEP))
            }
            className="h-11 px-6 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold gap-2 cursor-pointer shadow-sm"
          >
            <ChevronDown className="size-4" />
            <span>
              Xem thêm {Math.min(PAGE_STEP, remainingPosts.length)} bài viết chuyên sâu
            </span>
          </Button>
          {remainingPosts.length > PAGE_STEP && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisibleCount(posts.length)}
              className="h-11 px-5 rounded-xl font-semibold gap-2 cursor-pointer"
            >
              <Layers className="size-4 text-brand-orange" />
              <span>Hiển thị toàn bộ ({posts.length} bài)</span>
            </Button>
          )}
        </div>
      )}

      {/* Crawlable semantic internal link directory for remaining articles */}
      {remainingPosts.length > 0 && (
        <nav
          aria-label="Danh mục liên kết toàn bộ bài viết chuyên sâu"
          className="sr-only"
        >
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
