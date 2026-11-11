import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  Layers,
  ListChecks,
  Briefcase,
  Share2,
  Scale,
  CheckCircle2,
  UserCheck,
  Tag,
  TrendingUp,
  Filter,
  ChevronRight,
  Rocket,
  LogIn,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo/SeoHead";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  type BlogCategorySlug,
} from "@/data/blogData";
import { BLOG_TOPIC_CATALOG } from "@/data/blogTopicCatalog";

const CATEGORY_ICON_MAP: Record<string, typeof Layers> = {
  Layers,
  ListChecks,
  Briefcase,
  Sparkles,
  Share2,
  Scale,
};

export function BlogHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const selectedCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");

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

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return BLOG_POSTS.filter((post) => {
      const matchCat =
        selectedCategory === "all" || post.category === selectedCategory;
      const matchQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.metaDescription.toLowerCase().includes(q) ||
        post.primaryKeyword.toLowerCase().includes(q) ||
        post.secondaryKeywords.some((k) => k.toLowerCase().includes(q)) ||
        post.geoSummary.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

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
          blogPost: BLOG_POSTS.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: `https://brandhub.id.vn/blog/${post.slug}`,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: {
              "@type": "Person",
              name: post.author.name,
              jobTitle: post.author.roleTitle,
            },
            keywords: [post.primaryKeyword, ...post.secondaryKeywords].join(", "),
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
      className="space-y-8 max-w-7xl mx-auto py-4 px-3 sm:px-6 overflow-x-hidden"
    >
      <SeoHead
        title="Blog Quản trị Truyền thông, Quy trình Agency & AI Marketing | BrandHub"
        description="Cẩm nang vận hành Agency như Jira & Notion, quy trình phê duyệt nội dung 3 cấp, báo giá Gói truyền thông (Media Package), AI GraphRAG và lịch đăng tự động Facebook, Instagram, TikTok, Threads."
        canonicalPath="/blog"
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
          Blog & Cẩm nang Quản trị Truyền thông
        </span>
      </nav>

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 shadow-xl">
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-300">
            <BookOpen className="size-3.5" />
            <span>THƯ VIỆN TRI THỨC QUẢN TRỊ TRUYỀN THÔNG & MARTECH CHUẨN SEO</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Chuẩn hóa quy trình vận hành{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Agency, Gói Truyền thông & AI Studio
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Hệ thống bài phân tích chuyên sâu giúp <strong className="text-white">Owner</strong>,{" "}
            <strong className="text-white">Manager</strong>,{" "}
            <strong className="text-white">Creator</strong> và{" "}
            <strong className="text-white">Client</strong> làm chủ mô hình quản lý công việc chuẩn
            Jira / Notion, thiết kế Gói truyền thông (Media Package), ứng dụng AI GraphRAG và tự động
            hóa xuất bản trên Facebook, Instagram, TikTok và Threads.
          </p>

          {/* Search & Quick Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-1 max-w-xl">
              <Search className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 size-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chủ đề: quản lý như Jira/Notion, gói truyền thông, duyệt 3 cấp, AI GraphRAG..."
                className="pl-10 h-11 bg-white/10 border-white/15 text-white placeholder:text-slate-400 focus-visible:ring-brand-orange rounded-xl text-sm"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <Link to="/register">
                <Button className="h-11 px-5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-2 cursor-pointer">
                  <Rocket className="size-4" />
                  <span>Đăng ký dùng thử 0đ</span>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="h-11 px-4 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium gap-1.5 cursor-pointer"
                >
                  <LogIn className="size-4" />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Metric Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              6 Chuyên mục chiến lược
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
              <TrendingUp className="size-3.5 text-orange-400" />
              Lộ trình 100 Chủ đề chuẩn SEO & GEO
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
              <UserCheck className="size-3.5 text-sky-400" />
              Tối ưu cho 6 vai trò: Guest · Owner · Manager · Creator · Client · Admin
            </span>
          </div>
        </div>
      </section>

      {/* Category Filter Grid */}
      <section aria-label="Danh mục chủ đề" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Khám phá theo 6 Chuyên mục Cốt lõi
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Mỗi chuyên mục tương ứng trực tiếp với một phân hệ nghiệp vụ trong 141 tính năng của BrandHub
            </p>
          </div>
          {selectedCategory !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryChange("all")}
              className="text-xs text-brand-orange hover:text-brand-orange/80 self-start sm:self-auto cursor-pointer"
            >
              Xem tất cả chuyên mục ({BLOG_TOPIC_CATALOG.length} chủ đề)
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {BLOG_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.iconName] || Layers;
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() =>
                  handleCategoryChange(isActive ? "all" : cat.slug)
                }
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isActive
                    ? "border-brand-orange bg-brand-orange/5 shadow-md ring-1 ring-brand-orange/30"
                    : "border-border bg-card hover:border-brand-orange/40 hover:shadow-xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-brand-orange">
                      <Icon className="size-4 shrink-0" />
                      <span>{cat.shortName}</span>
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {cat.plannedCount} chủ đề
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  <span>Phân hệ: {cat.frRange}</span>
                  <span className="text-brand-orange font-semibold inline-flex items-center gap-1">
                    {isActive ? "Đang lọc" : "Lọc chuyên mục"}
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Published Flagship Pillar Posts */}
      <section aria-label="Bài viết chuyên sâu đã xuất bản" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Bài viết trụ cột (Pillar Articles)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Cẩm nang Thực chiến & Kiến trúc Hệ thống ({filteredPosts.length} bài viết chi tiết)
            </h2>
          </div>
          <a
            href="#roadmap-100-topics"
            className="text-xs font-semibold text-brand-orange hover:underline inline-flex items-center gap-1"
          >
            <span>Xem danh sách 100 chủ đề SEO bên dưới</span>
            <ArrowRight className="size-3.5" />
          </a>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Không tìm thấy bài viết đã xuất bản khớp với từ khóa "{searchQuery}".
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                handleCategoryChange("all");
              }}
            >
              Xóa bộ lọc tìm kiếm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const catMeta = getCategoryMeta(post.category);
              return (
                <article
                  key={post.id}
                  className="group rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-orange/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image */}
                    <Link
                      to={`/blog/${post.slug}`}
                      className="block relative aspect-16/9 overflow-hidden bg-muted"
                    >
                      <img
                        src={post.coverImage}
                        alt={post.coverImageAlt}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="rounded-full bg-slate-950/85 backdrop-blur-xs text-white px-2.5 py-1 text-[11px] font-semibold">
                          #{String(post.topicNumber).padStart(3, "0")}
                        </span>
                        {catMeta && (
                          <span className="rounded-full bg-brand-orange text-white px-2.5 py-1 text-[11px] font-semibold shadow-xs">
                            {catMeta.shortName}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {post.publishedAt}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {post.readingTimeMinutes} phút đọc
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-brand-orange transition-colors leading-snug">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>

                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.metaDescription}
                      </p>

                      {/* Target Roles & FR tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {post.targetRoles.map((role) => (
                          <span
                            key={role}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground/80"
                          >
                            {role}
                          </span>
                        ))}
                        {post.relatedFrCodes.slice(0, 2).map((fr) => (
                          <span
                            key={fr}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-orange/10 text-brand-orange"
                          >
                            {fr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Author & Read More */}
                  <div className="px-5 py-3.5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {post.author.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {post.author.roleTitle}
                      </p>
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline"
                    >
                      <span>Đọc chi tiết</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Product Conversion Funnel Banner (Register / Media Package / AI Studio / Pricing) */}
      <section
        aria-label="Giải pháp chuyển đổi BrandHub"
        className="rounded-3xl border border-brand-orange/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider">
              <Rocket className="size-3.5" />
              <span>Áp dụng ngay kiến thức vào thực tế vận hành</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Trải nghiệm hệ sinh thái 141 tính năng của BrandHub ngay hôm nay
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Từ quản lý công việc chuẩn Jira/Notion, đóng gói báo giá Media Package, sáng tạo nội dung
              cùng AI GraphRAG đến đặt lịch đăng tự động lên Facebook, Instagram, TikTok và Threads.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/register">
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-2 cursor-pointer">
                <span>Đăng ký gói Starter 0đ</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="font-semibold cursor-pointer">
                Đăng nhập vào Workspace
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          <Link
            to="/#media-package"
            className="p-4 rounded-2xl bg-card border border-border hover:border-brand-orange/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-brand-orange">GÓI TRUYỀN THÔNG</span>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Đóng gói báo giá & Chiến dịch đa kênh
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tích hợp Social Media (4 kênh) cùng hệ thống đối tác Báo chí & Đài truyền hình.
            </p>
          </Link>

          <Link
            to="/#ai-features"
            className="p-4 rounded-2xl bg-card border border-border hover:border-brand-orange/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-brand-orange">AI MARKETING STUDIO</span>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-sm font-bold text-foreground">
              GraphRAG Neo4j + Đại sứ ảo LoRA
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Viết bài đúng 100% Brand Guidelines, tạo ảnh, video AI và bắt trend thời gian thực.
            </p>
          </Link>

          <Link
            to="/#pricing"
            className="p-4 rounded-2xl bg-card border border-border hover:border-brand-orange/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-brand-orange">BẢNG GIÁ & VIETQR</span>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Nâng cấp Pro 590.000đ/tháng
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Mở khóa 10 Workspace, 5.000 AI Credits và thanh toán VietQR (SePay / PayOS) tức thì.
            </p>
          </Link>
        </div>
      </section>

      {/* 100 SEO Topics Master Catalog Explorer */}
      <section
        id="roadmap-100-topics"
        aria-label="Lộ trình 100 chủ đề truyền thông chuẩn SEO"
        className="space-y-5 pt-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider">
              <Tag className="size-3.5" />
              <span>BẢN ĐỒ TOPIC CLUSTER (100 BÀI TRUYỀN THÔNG CHUẨN SEO)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Danh mục 100 Chủ đề Nội dung SEO & Định hướng Chuyển đổi ({filteredCatalog.length}/100)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
              Toàn bộ 100 chủ đề được quy hoạch theo 6 cụm chuyên đề (Topic Clusters), gắn liền với từ khóa
              mục tiêu, vai trò người đọc (Guest, Owner, Manager, Creator, Client, Admin) và tính năng chuyển
              đổi tương ứng trên hệ thống.
            </p>
          </div>

          {/* Batch Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1 mr-1">
              <Filter className="size-3.5" /> Giai đoạn:
            </span>
            {[
              { id: "all", label: "Tất cả (100)" },
              { id: "published", label: `Đã xuất bản (${BLOG_POSTS.length})` },
              { id: "Batch 1", label: "Đợt 1 (Ưu tiên cao)" },
              { id: "Batch 2", label: "Đợt 2" },
              { id: "Batch 3", label: "Đợt 3" },
              { id: "Batch 4", label: "Đợt 4" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBatch(b.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  selectedBatch === b.id
                    ? "bg-brand-orange text-white font-semibold shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Table / Cards */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4 min-w-[280px]">Tiêu đề bài viết & Từ khóa SEO chính</th>
                  <th className="py-3 px-4 w-44">Chuyên mục</th>
                  <th className="py-3 px-4 w-44">Vai trò mục tiêu</th>
                  <th className="py-3 px-4 min-w-[220px]">Tính năng & CTA điều hướng</th>
                  <th className="py-3 px-4 w-32 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCatalog.map((item) => {
                  const catMeta = getCategoryMeta(item.category);
                  return (
                    <tr
                      key={item.topicNumber}
                      className="hover:bg-muted/25 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground">
                        #{String(item.topicNumber).padStart(3, "0")}
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        {item.isPublished ? (
                          <Link
                            to={`/blog/${item.slug}`}
                            className="font-bold text-foreground hover:text-brand-orange transition-colors block leading-snug"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <p className="font-semibold text-foreground leading-snug">
                            {item.title}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1 text-brand-orange font-medium">
                            Từ khóa: "{item.primaryKeyword}"
                          </span>
                          <span>·</span>
                          <span>Intent: {item.searchIntent}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {catMeta && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-orange/10 text-brand-orange">
                            {catMeta.shortName}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.targetRoles.map((r) => (
                            <span
                              key={r}
                              className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-medium text-foreground/80"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1 text-xs">
                        <p className="text-foreground/90 font-medium line-clamp-1">
                          {item.brandhubFeature}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          CTA: {item.ctaTarget}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.isPublished ? (
                          <Link
                            to={`/blog/${item.slug}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                          >
                            <span>Đọc bài</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                            {item.priorityBatch}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

export default BlogHubPage;
