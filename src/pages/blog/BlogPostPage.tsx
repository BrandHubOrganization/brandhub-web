import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Rocket } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo/SeoHead";
import { getBlogCategoryBySlug } from "@/data/blogCategories";
import {
  BLOG_POST_SUMMARIES,
  getBlogPostSummaryBySlug,
  getCachedBlogPostBySlug,
  loadBlogPostBySlug,
} from "@/data/blogLoader";
import type { BlogPost, BlogPostSummary, BlogSection } from "@/data/blogTypes";
import { BLOG_TOPIC_CATALOG } from "@/data/blogTopicCatalog";
import {
  BlogPostHeader,
  BlogKeyTakeaways,
  BlogSectionItem,
  BlogFeatureBridge,
  BlogPostFaq,
  BlogAuthorBio,
  BlogSidebar,
  BlogClusterNav,
  BlogTopicPlaceholder,
  BlogReadingProgress,
  BlogSpotlightContainer,
  stripInlineMarkdownLinks,
} from "./components";

export function BlogPostPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const summary = useMemo(() => getBlogPostSummaryBySlug(slug), [slug]);
  const [fullPost, setFullPost] = useState<BlogPost | undefined>(() =>
    getCachedBlogPostBySlug(slug),
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    const cached = getCachedBlogPostBySlug(slug);
    if (cached) {
      setFullPost(cached);
      return;
    }
    setFullPost(undefined);
    if (!summary) return;
    let active = true;
    loadBlogPostBySlug(slug).then((loaded) => {
      if (active && loaded) {
        setFullPost(loaded);
      }
    });
    return () => {
      active = false;
    };
  }, [slug, summary]);

  const plannedTopic = useMemo(
    () => BLOG_TOPIC_CATALOG.find((t) => t.slug === slug),
    [slug],
  );

  const categoryMeta = useMemo(
    () =>
      summary
        ? getBlogCategoryBySlug(summary.category)
        : plannedTopic
          ? getBlogCategoryBySlug(plannedTopic.category)
          : undefined,
    [summary, plannedTopic],
  );

  const relatedPosts = useMemo(() => {
    if (!summary) return BLOG_POST_SUMMARIES.slice(0, 3);
    const matched = summary.relatedSlugs
      .map((s: string) => getBlogPostSummaryBySlug(s))
      .filter((p: BlogPostSummary | undefined): p is BlogPostSummary =>
        Boolean(p),
      );
    return matched.length > 0 ? matched : BLOG_POST_SUMMARIES.slice(0, 3);
  }, [summary]);

  const jsonLd = useMemo(() => {
    if (!summary) return undefined;
    const faqs = fullPost?.faqs ?? [];
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://brandhub.id.vn/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://brandhub.id.vn/blog",
      },
      ...(categoryMeta
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: categoryMeta.shortName,
              item: `https://brandhub.id.vn/blog?category=${categoryMeta.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: categoryMeta ? 4 : 3,
        name: summary.title,
        item: `https://brandhub.id.vn/blog/${summary.slug}`,
      },
    ];

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `https://brandhub.id.vn/blog/${summary.slug}#article`,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://brandhub.id.vn/blog/${summary.slug}`,
          },
          isPartOf: {
            "@id": "https://brandhub.id.vn/blog#blog",
          },
          about: {
            "@id": "https://brandhub.id.vn/#application",
          },
          headline: summary.title,
          description: summary.metaDescription,
          image: [summary.coverImage],
          datePublished: summary.publishedAt,
          dateModified: summary.updatedAt,
          inLanguage: "vi-VN",
          author: {
            "@type": "Person",
            name: summary.author.name,
            jobTitle: summary.author.roleTitle,
            url: `https://brandhub.id.vn/blog?q=${encodeURIComponent(summary.author.name)}`,
            worksFor: {
              "@id": "https://brandhub.id.vn/#organization",
            },
          },
          publisher: {
            "@id": "https://brandhub.id.vn/#organization",
          },
          articleSection: categoryMeta?.name || "Quản trị Truyền thông & AI",
          timeRequired: `PT${summary.readingTimeMinutes}M`,
          keywords: [
            summary.primaryKeyword,
            ...summary.secondaryKeywords,
          ].join(", "),
          abstract: stripInlineMarkdownLinks(summary.geoSummary),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", "[aria-label='Tóm tắt cốt lõi']"],
          },
          mentions: relatedPosts.map((rel) => ({
            "@type": "BlogPosting",
            "@id": `https://brandhub.id.vn/blog/${rel.slug}#article`,
            headline: rel.title,
            url: `https://brandhub.id.vn/blog/${rel.slug}`,
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems,
        },
        ...(faqs.length > 0
          ? [
              {
                "@type": "FAQPage",
                mainEntity: faqs.map(
                  (f: { question: string; answer: string }) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: stripInlineMarkdownLinks(f.answer),
                    },
                  }),
                ),
              },
            ]
          : []),
      ],
    };
  }, [summary, fullPost, categoryMeta, relatedPosts]);

  if (!summary) {
    return (
      <PageWrapper
        title={plannedTopic ? plannedTopic.title : "Không tìm thấy bài viết"}
        hideHeader
        hideBanner
        className="max-w-4xl mx-auto py-8 px-4 space-y-6"
      >
        <SeoHead
          title={
            plannedTopic
              ? `${plannedTopic.title} | Lộ trình Nội dung BrandHub`
              : "Không tìm thấy bài viết | BrandHub Blog"
          }
          description={
            plannedTopic
              ? `Chủ đề #${plannedTopic.topicNumber}: ${plannedTopic.title}. Khám phá hệ thống quản trị truyền thông và AI Studio trên BrandHub.`
              : "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển."
          }
          canonicalPath="/blog"
          noindex={true}
          bilingual={false}
        />
        <BlogTopicPlaceholder
          plannedTopic={plannedTopic}
          categoryMeta={categoryMeta}
        />
      </PageWrapper>
    );
  }

  const sections = fullPost?.sections ?? [];
  const faqs = fullPost?.faqs ?? [];
  const primaryCta = fullPost?.primaryCta ?? {
    badge: "BẮT ĐẦU CÙNG BRANDHUB",
    title: "Chuẩn hóa quy trình vận hành truyền thông đa kênh ngay hôm nay",
    description:
      "Khởi tạo Workspace miễn phí trên BrandHub để quản lý chiến dịch, kiểm soát Brand Guidelines cùng AI GraphRAG và đăng tự động 4 kênh.",
    primaryText: "Đăng ký dùng thử 0đ",
    primaryHref: "/register",
    secondaryText: "Đăng nhập hệ thống",
    secondaryHref: "/login",
    featureHighlight:
      "Phân quyền 6 vai trò chuẩn · Xuất bản tự động Facebook, Instagram, TikTok, Threads",
  };

  return (
    <PageWrapper
      title={summary.title}
      hideHeader
      hideBanner
      className="mx-auto max-w-7xl space-y-10 overflow-x-clip px-4 py-6 sm:px-6 sm:py-10 lg:px-8"
    >
      <BlogReadingProgress />
      <SeoHead
        title={summary.metaTitle}
        description={summary.metaDescription}
        canonicalPath={`/blog/${summary.slug}`}
        ogType="article"
        ogImage={summary.coverImage}
        ogImageAlt={summary.coverImageAlt}
        publishedTime={summary.publishedAt}
        modifiedTime={summary.updatedAt}
        articleSection={categoryMeta?.name}
        authorName={summary.author.name}
        keywords={[summary.primaryKeyword, ...summary.secondaryKeywords].join(
          ", ",
        )}
        bilingual={false}
        jsonLd={jsonLd}
      />

      {/* Header, Breadcrumbs, Metadata */}
      <BlogPostHeader post={summary} categoryMeta={categoryMeta} />

      {/* Main 2-Column Content Layout */}
      <BlogSpotlightContainer className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left / Main Article Body (8 cols) */}
        <article className="min-w-0 space-y-10 lg:col-span-8">
          {/* Cover Image */}
          <figure className="overflow-hidden rounded-3xl border border-zinc-200/85 bg-zinc-100 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <img
              src={summary.coverImage}
              alt={summary.coverImageAlt}
              width={1200}
              height={675}
              fetchPriority="high"
              decoding="async"
              className="max-h-[440px] w-full object-cover"
            />
            <figcaption className="border-t border-zinc-200/75 bg-white px-5 py-3 text-xs italic text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              {summary.coverImageAlt}
            </figcaption>
          </figure>

          {/* GEO Citation Takeaways Box */}
          <BlogKeyTakeaways
            geoSummary={summary.geoSummary}
            keyTakeaways={summary.keyTakeaways}
          />

          {/* Article Sections */}
          {fullPost ? (
            <div className="space-y-10">
              {sections.map((sec: BlogSection, idx: number) => (
                <BlogSectionItem key={sec.id} section={sec} index={idx} />
              ))}
            </div>
          ) : (
            <div
              aria-busy="true"
              aria-label="Đang tải nội dung chi tiết bài viết"
              className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <div className="h-6 w-2/3 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-2.5">
                <div className="h-4 w-full rounded bg-muted/80 animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-muted/80 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-muted/80 animate-pulse" />
              </div>
              <div className="h-6 w-1/2 rounded-lg bg-muted animate-pulse pt-4" />
              <div className="space-y-2.5">
                <div className="h-4 w-full rounded bg-muted/80 animate-pulse" />
                <div className="h-4 w-10/12 rounded bg-muted/80 animate-pulse" />
              </div>
            </div>
          )}

          {/* Direct BrandHub System Feature Bridge */}
          <BlogFeatureBridge
            category={summary.category}
            targetRoles={summary.targetRoles}
            plannedTopic={plannedTopic}
          />

          {/* Article FAQ Section */}
          {faqs.length > 0 && <BlogPostFaq faqs={faqs} />}

          {/* Verified Author Bio Card */}
          <BlogAuthorBio author={summary.author} />

          {/* Bottom Primary Conversion Banner */}
          <section className="bh-spotlight-card relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs sm:p-10 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Rocket className="size-3.5 text-brand-orange" />
              {primaryCta.badge}
            </span>
            <h2 className="text-balance text-xl font-extrabold leading-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              {primaryCta.title}
            </h2>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {primaryCta.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to={primaryCta.primaryHref}>
                <Button className="h-11 cursor-pointer gap-2 rounded-xl bg-brand-orange px-6 font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-brand-orange/90">
                  <span>{primaryCta.primaryText}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              {primaryCta.secondaryText && primaryCta.secondaryHref && (
                <Link to={primaryCta.secondaryHref}>
                  <Button
                    variant="outline"
                    className="h-11 cursor-pointer rounded-xl border-zinc-200 bg-white px-5 font-semibold text-zinc-800 hover:border-brand-orange/45 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {primaryCta.secondaryText}
                  </Button>
                </Link>
              )}
            </div>
            {primaryCta.featureHighlight && (
              <p className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{primaryCta.featureHighlight}</span>
              </p>
            )}
          </section>
        </article>

        {/* Right Sticky Sidebar (4 cols) */}
        <BlogSidebar
          sections={sections}
          hasFaqs={faqs.length > 0}
          primaryKeyword={summary.primaryKeyword}
          secondaryKeywords={summary.secondaryKeywords}
          category={summary.category}
        />
      </BlogSpotlightContainer>

      {/* Topic Cluster Pillar, Prev/Next & 4-Card Related Articles */}
      <BlogClusterNav
        currentPost={summary}
        categoryMeta={categoryMeta}
        relatedPosts={relatedPosts}
      />
    </PageWrapper>
  );
}

export default BlogPostPage;
