import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { SeoHead } from "@/components/seo/SeoHead";
import { BLOG_CATEGORIES } from "@/data/blogCategories";
import { BLOG_POST_SUMMARIES as BLOG_POSTS } from "@/data/blogLoader";
import type { BlogCategorySlug } from "@/data/blogTypes";
import { BLOG_TOPIC_CATALOG } from "@/data/blogTopicCatalog";
import {
  BlogHero,
  BlogCategoryGrid,
  BlogToolbar,
  BlogPostGrid,
  BlogConversionBanner,
  BlogRoadmapTable,
  BlogReveal,
  type BlogSortOption,
} from "./components";

export function BlogHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const selectedCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState<BlogSortOption>("newest");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");

  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace(/^#/, "");
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.hash]);

  const handleCategoryChange = (slug: string) => {
    if (slug === "all") {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: slug }, { replace: true });
    }
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: BLOG_POSTS.length };
    BLOG_CATEGORIES.forEach((cat) => {
      counts[cat.slug] = BLOG_POSTS.filter((p) => p.category === cat.slug).length;
    });
    return counts;
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = BLOG_POSTS.filter((post) => {
      const matchCat =
        selectedCategory === "all" || post.category === selectedCategory;
      const matchQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.metaDescription.toLowerCase().includes(q) ||
        post.primaryKeyword.toLowerCase().includes(q) ||
        post.secondaryKeywords.some((k) => k.toLowerCase().includes(q)) ||
        post.targetRoles.some((r) => r.toLowerCase().includes(q)) ||
        post.author.name.toLowerCase().includes(q) ||
        post.geoSummary.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === "topic-order") {
        return a.topicNumber - b.topicNumber;
      }
      if (sortOption === "newest") {
        const diff =
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        return diff !== 0 ? diff : a.topicNumber - b.topicNumber;
      }
      if (sortOption === "shortest") {
        const diff = a.readingTimeMinutes - b.readingTimeMinutes;
        return diff !== 0 ? diff : a.topicNumber - b.topicNumber;
      }
      if (sortOption === "longest") {
        const diff = b.readingTimeMinutes - a.readingTimeMinutes;
        return diff !== 0 ? diff : a.topicNumber - b.topicNumber;
      }
      return 0;
    });
  }, [selectedCategory, searchQuery, sortOption]);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return BLOG_TOPIC_CATALOG.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchBatch =
        selectedBatch === "all" ||
        (selectedBatch === "published" && item.isPublished) ||
        item.priorityBatch === selectedBatch;
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.primaryKeyword.toLowerCase().includes(q) ||
        item.brandhubFeature.toLowerCase().includes(q) ||
        String(item.topicNumber).includes(q);
      return matchCat && matchBatch && matchQuery;
    });
  }, [selectedCategory, selectedBatch, searchQuery]);

  const blogJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": "https://brandhub.id.vn/blog#webpage",
          url: "https://brandhub.id.vn/blog",
          name: "Blog Quản trị Truyền thông, Quy trình Agency & AI Marketing | BrandHub",
          description:
            "Thư viện kiến thức chuyên sâu về quản trị dự án truyền thông như Jira/Notion, quy trình duyệt nội dung 3 cấp, xây dựng Gói truyền thông (Media Package), AI GraphRAG và xuất bản tự động 4 kênh Facebook, Instagram, TikTok, Threads.",
          inLanguage: "vi-VN",
          isPartOf: { "@id": "https://brandhub.id.vn/#website" },
        },
        {
          "@type": "Blog",
          "@id": "https://brandhub.id.vn/blog#blog",
          name: "BrandHub Knowledge & Media Operations Blog",
          url: "https://brandhub.id.vn/blog",
          publisher: {
            "@id": "https://brandhub.id.vn/#organization",
          },
        },
        {
          "@type": "ItemList",
          name: "Danh mục 100 bài viết chuyên sâu về Quản trị Truyền thông & AI Marketing",
          numberOfItems: BLOG_POSTS.length,
          itemListElement: BLOG_POSTS.map((post, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: post.title,
            url: `https://brandhub.id.vn/blog/${post.slug}`,
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Trang chủ",
              item: "https://brandhub.id.vn/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog & Cẩm nang Truyền thông",
              item: "https://brandhub.id.vn/blog",
            },
          ],
        },
      ],
    }),
    [],
  );

  const getCategoryMeta = (slug: BlogCategorySlug) =>
    BLOG_CATEGORIES.find((c) => c.slug === slug);

  return (
    <PageWrapper
      title="Blog & Cẩm nang Quản trị Truyền thông"
      hideHeader
      hideBanner
      className="mx-auto max-w-7xl space-y-10 overflow-x-clip px-4 py-6 sm:space-y-12 sm:px-6 sm:py-10 lg:px-8"
    >
      <SeoHead
        title="Blog Quản trị Agency, Gói Truyền thông & AI | BrandHub"
        description="Cẩm nang vận hành Agency như Jira & Notion, quy trình phê duyệt nội dung 3 cấp, báo giá Gói truyền thông (Media Package), AI GraphRAG và lịch đăng tự động Facebook, Instagram, TikTok, Threads."
        canonicalPath="/blog"
        bilingual={false}
        keywords="blog truyền thông, quản lý dự án marketing như jira notion, quy trình duyệt bài 3 cấp, gói truyền thông gồm những gì, ai viết content brand guideline, đăng bài tự động facebook instagram tiktok threads"
        jsonLd={blogJsonLd}
      />

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Link to="/" className="hover:text-brand-orange transition-colors font-medium">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="text-foreground font-semibold">
          Blog &amp; Cẩm nang Quản trị Truyền thông
        </span>
      </nav>

      {/* Hero Header */}
      <BlogHero />

      {/* 6 Core Categories Grid */}
      <BlogReveal>
        <BlogCategoryGrid
          selectedCategory={selectedCategory}
          categoryCounts={categoryCounts}
          onSelectCategory={handleCategoryChange}
          totalPublishedCount={BLOG_POSTS.length}
        />
      </BlogReveal>

      {/* Toolbar: Category Pills + Search + Sort */}
      <BlogReveal>
        <BlogToolbar
          selectedCategory={selectedCategory}
          categoryCounts={categoryCounts}
          onSelectCategory={handleCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          displayedCount={filteredAndSortedPosts.length}
          totalCount={BLOG_POSTS.length}
        />
      </BlogReveal>

      {/* Published Articles Grid */}
      <BlogPostGrid
        posts={filteredAndSortedPosts}
        getCategoryMeta={getCategoryMeta}
        searchQuery={searchQuery}
        onClearFilters={() => {
          setSearchQuery("");
          handleCategoryChange("all");
        }}
      />

      {/* Product Feature Conversion Banner */}
      <BlogReveal>
        <BlogConversionBanner />
      </BlogReveal>

      {/* 100 Editorial Topics Roadmap Explorer */}
      <BlogReveal>
        <BlogRoadmapTable
          catalog={filteredCatalog}
          getCategoryMeta={getCategoryMeta}
          selectedBatch={selectedBatch}
          onBatchChange={setSelectedBatch}
          publishedCount={BLOG_POSTS.length}
        />
      </BlogReveal>
    </PageWrapper>
  );
}

export default BlogHubPage;
