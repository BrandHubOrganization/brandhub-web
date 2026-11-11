import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Layers,
  ListChecks,
  LogIn,
  Rocket,
  ShieldCheck,
  Sparkles,
  Tag,
  UserCheck,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo/SeoHead";
import {
  BLOG_POSTS,
  getBlogCategoryBySlug,
  getBlogPostBySlug,
} from "@/data/blogData";
import { BLOG_TOPIC_CATALOG } from "@/data/blogTopicCatalog";

export function BlogPostPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const post = useMemo(() => getBlogPostBySlug(slug), [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);
  const plannedTopic = useMemo(
    () => BLOG_TOPIC_CATALOG.find((t) => t.slug === slug),
    [slug],
  );

  const categoryMeta = useMemo(
    () =>
      post
        ? getBlogCategoryBySlug(post.category)
        : plannedTopic
          ? getBlogCategoryBySlug(plannedTopic.category)
          : undefined,
    [post, plannedTopic],
  );

  const relatedPosts = useMemo(() => {
    if (!post) return BLOG_POSTS.slice(0, 3);
    const matched = post.relatedSlugs
      .map((s) => getBlogPostBySlug(s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    return matched.length > 0 ? matched : BLOG_POSTS.slice(0, 3);
  }, [post]);

  const jsonLd = useMemo(() => {
    if (!post) return undefined;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `https://brandhub.id.vn/blog/${post.slug}#article`,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://brandhub.id.vn/blog/${post.slug}`,
          },
          headline: post.title,
          description: post.metaDescription,
          image: [post.coverImage],
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          inLanguage: "vi-VN",
          author: {
            "@type": "Person",
            name: post.author.name,
            jobTitle: post.author.roleTitle,
            url: "https://brandhub.id.vn/blog",
          },
          publisher: {
            "@id": "https://brandhub.id.vn/#organization",
          },
          articleSection: categoryMeta?.name || "Quản trị Truyền thông & AI",
          keywords: [post.primaryKeyword, ...post.secondaryKeywords].join(", "),
          abstract: post.geoSummary,
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
              name: "Blog",
              item: "https://brandhub.id.vn/blog",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: `https://brandhub.id.vn/blog/${post.slug}`,
            },
          ],
        },
        ...(post.faqs.length > 0
          ? [
              {
                "@type": "FAQPage",
                mainEntity: post.faqs.map((f) => ({
                  "@type": "Question",
                  name: f.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: f.answer,
                  },
                })),
              },
            ]
          : []),
      ],
    };
  }, [post, categoryMeta]);

  if (!post) {
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
              ? `Chủ đề SEO #${plannedTopic.topicNumber}: ${plannedTopic.title}. Khám phá hệ thống quản trị truyền thông và AI Studio trên BrandHub.`
              : "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển."
          }
          canonicalPath="/blog"
          noindex={true}
        />

        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quay lại Thư viện Blog & 100 Chủ đề SEO</span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 space-y-5 shadow-xs">
          {plannedTopic ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 text-brand-orange px-3 py-1 text-xs font-bold">
                <Sparkles className="size-3.5" />
                <span>
                  CHỦ ĐỀ #{String(plannedTopic.topicNumber).padStart(3, "0")} ·{" "}
                  {plannedTopic.priorityBatch}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-foreground leading-tight">
                {plannedTopic.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chủ đề này nằm trong lộ trình 100 bài truyền thông chuẩn SEO của
                BrandHub. Bạn có thể đọc ngay bài viết trụ cột cùng chuyên mục{" "}
                <strong className="text-foreground">
                  {categoryMeta?.name}
                </strong>{" "}
                hoặc trải nghiệm trực tiếp tính năng{" "}
                <strong className="text-foreground">
                  {plannedTopic.brandhubFeature}
                </strong>{" "}
                trên hệ thống.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground">Từ khóa mục tiêu:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {plannedTopic.primaryKeyword}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vai trò hướng tới:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {plannedTopic.targetRoles.join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/register">
                  <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-2 cursor-pointer">
                    <Rocket className="size-4" />
                    <span>Đăng ký trải nghiệm tính năng này</span>
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button variant="outline" className="cursor-pointer">
                    Xem các bài viết đã xuất bản
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Không tìm thấy bài viết
              </h1>
              <p className="text-sm text-muted-foreground">
                Liên kết bài viết không tồn tại hoặc đã được cập nhật. Hãy khám phá
                các bài viết trụ cột bên dưới.
              </p>
              <Link to="/blog">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer">
                  Về trang chủ Blog
                </Button>
              </Link>
            </>
          )}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={post.title}
      hideHeader
      hideBanner
      className="max-w-7xl mx-auto py-4 px-3 sm:px-6 space-y-8 overflow-x-hidden"
    >
      <SeoHead
        title={post.metaTitle}
        description={post.metaDescription}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.coverImage}
        keywords={[post.primaryKeyword, ...post.secondaryKeywords].join(", ")}
        jsonLd={jsonLd}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link to="/" className="hover:text-brand-orange transition-colors font-medium">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link to="/blog" className="hover:text-brand-orange transition-colors font-medium">
          Blog
        </Link>
        {categoryMeta && (
          <>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link
              to={`/blog?category=${categoryMeta.slug}`}
              className="hover:text-brand-orange transition-colors font-medium"
            >
              {categoryMeta.shortName}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="text-foreground font-semibold line-clamp-1">
          {post.title}
        </span>
      </nav>

      {/* Article Header */}
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-orange/15 text-brand-orange px-3 py-1 text-xs font-bold">
            Chủ đề #{String(post.topicNumber).padStart(3, "0")}
          </span>
          {categoryMeta && (
            <Link
              to={`/blog?category=${categoryMeta.slug}`}
              className="rounded-full bg-muted hover:bg-muted/80 text-foreground px-3 py-1 text-xs font-semibold transition-colors"
            >
              {categoryMeta.name}
            </Link>
          )}
          {post.relatedFrCodes.map((fr) => (
            <span
              key={fr}
              className="rounded-md border border-border px-2 py-0.5 text-[11px] font-mono font-semibold text-muted-foreground"
            >
              {fr}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {post.metaDescription}
        </p>

        {/* Author & Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {post.author.name
                .split(" ")
                .slice(-2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {post.author.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="size-3" />
                  Tác giả xác thực
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {post.author.roleTitle} · {post.author.highlight}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5 text-brand-orange" />
              Cập nhật: {post.updatedAt}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5 text-brand-orange" />
              {post.readingTimeMinutes} phút đọc
            </span>
            <span className="inline-flex items-center gap-1">
              <UserCheck className="size-3.5 text-brand-orange" />
              Dành cho: {post.targetRoles.join(", ")}
            </span>
          </div>
        </div>
      </header>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Article Body (8 cols) */}
        <div className="lg:col-span-8 space-y-8 min-w-0">
          {/* Cover Image */}
          <figure className="rounded-2xl overflow-hidden border border-border bg-muted shadow-xs">
            <img
              src={post.coverImage}
              alt={post.coverImageAlt}
              className="w-full max-h-[420px] object-cover"
            />
            <figcaption className="px-4 py-2.5 text-xs text-muted-foreground bg-card border-t border-border/60 italic">
              {post.coverImageAlt}
            </figcaption>
          </figure>

          {/* GEO Passage Citability Box (130-170 words self-contained answer block) */}
          <section
            aria-label="Tóm tắt cốt lõi"
            className="rounded-2xl border-2 border-brand-orange/30 bg-gradient-to-br from-brand-orange/10 via-card to-amber-500/5 p-5 sm:p-6 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-orange uppercase tracking-wider">
                <Sparkles className="size-4" />
                <span>Tóm tắt cốt lõi & Điểm nhấn quản trị (Key Takeaways)</span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Chuẩn trích dẫn AI Overview
              </span>
            </div>

            <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium">
              {post.geoSummary}
            </p>

            <div className="space-y-2 pt-2 border-t border-border/60">
              {post.keyTakeaways.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <CheckCircle2 className="size-4 text-brand-orange shrink-0 mt-0.5" />
                  <span className="text-foreground/90 leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Article Sections */}
          <div className="space-y-10">
            {post.sections.map((sec, idx) => (
              <section
                key={sec.id}
                id={sec.id}
                className="scroll-mt-24 space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-2xs"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-brand-orange">
                  <span>PHẦN {idx + 1}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
                  {sec.heading}
                </h2>

                <div className="space-y-3.5 text-sm sm:text-base text-foreground/90 leading-relaxed">
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {/* Subheadings (H3) */}
                {sec.subheadings && sec.subheadings.length > 0 && (
                  <div className="space-y-4 pt-2">
                    {sec.subheadings.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5 space-y-1.5"
                      >
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          {sub.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                          {sub.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Checklist / Bullets */}
                {sec.checklist && sec.checklist.length > 0 && (
                  <div className="rounded-xl bg-muted/40 border border-border/70 p-4 sm:p-5 space-y-2.5 mt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                      <ListChecks className="size-4 text-brand-orange" />
                      <span>Quy trình & Các bước thực thi chuẩn trên hệ thống</span>
                    </div>
                    <ul className="space-y-2">
                      {sec.checklist.map((item, cIdx) => (
                        <li
                          key={cIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed"
                        >
                          <span className="size-5 rounded-full bg-brand-orange/15 text-brand-orange font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {cIdx + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Callout Box */}
                {sec.callout && (
                  <div className="rounded-xl border-l-4 border-brand-orange bg-brand-orange/5 p-4 sm:p-5 space-y-1.5 mt-4">
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      {sec.callout.label}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {sec.callout.text}
                    </p>
                  </div>
                )}

                {/* Comparison Table */}
                {sec.comparisonTable && (
                  <div className="space-y-2 pt-3">
                    <p className="text-xs font-semibold text-muted-foreground italic">
                      Bảng đối chiếu: {sec.comparisonTable.caption}
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-muted/60 border-b border-border text-foreground font-bold">
                            {sec.comparisonTable.headers.map((h, hIdx) => (
                              <th
                                key={hIdx}
                                className={`py-3 px-3.5 ${
                                  hIdx === 1 ? "bg-brand-orange/10 text-brand-orange" : ""
                                }`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {sec.comparisonTable.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-muted/20">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-3 px-3.5 align-top leading-relaxed ${
                                    cIdx === 0
                                      ? "font-semibold text-foreground"
                                      : cIdx === 1
                                        ? "bg-brand-orange/5 font-semibold text-foreground"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Inline Conversion CTA */}
                {sec.inlineCta && (
                  <div className="mt-6 rounded-2xl border border-brand-orange/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 space-y-3 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-300 bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
                        <Sparkles className="size-3" />
                        {sec.inlineCta.badge}
                      </span>
                      <span className="text-[11px] text-slate-300">
                        {sec.inlineCta.featureHighlight}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      {sec.inlineCta.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {sec.inlineCta.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Link to={sec.inlineCta.primaryHref}>
                        <Button
                          size="sm"
                          className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-1.5 cursor-pointer"
                        >
                          <span>{sec.inlineCta.primaryText}</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </Link>
                      {sec.inlineCta.secondaryText && sec.inlineCta.secondaryHref && (
                        <Link to={sec.inlineCta.secondaryHref}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
                          >
                            {sec.inlineCta.secondaryText}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Article FAQ Section */}
          {post.faqs.length > 0 && (
            <section
              id="cau-hoi-thuong-gap"
              className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-4 shadow-2xs"
            >
              <div className="flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="size-4" />
                <span>Giải đáp thắc mắc thực tế (FAQ)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Câu hỏi thường gặp về chủ đề này
              </h2>
              <div className="space-y-3 pt-2">
                {post.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-muted/20 p-4 space-y-2"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Author E-E-A-T Bio Card */}
          <section
            aria-label="Thông tin tác giả"
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4"
          >
            <div className="size-14 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white font-extrabold flex items-center justify-center text-lg shrink-0">
              {post.author.name
                .split(" ")
                .slice(-2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Biên soạn & Kiểm duyệt kỹ thuật: {post.author.name}
                </h3>
                <span className="text-xs font-semibold text-brand-orange">
                  ({post.author.roleTitle})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {post.author.bio}
              </p>
            </div>
          </section>

          {/* Bottom Primary Conversion Banner */}
          <section className="rounded-3xl border border-brand-orange/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 space-y-4 shadow-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-300 bg-orange-500/15 border border-orange-500/30 px-3 py-1 rounded-full">
              <Rocket className="size-3.5" />
              {post.primaryCta.badge}
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
              {post.primaryCta.title}
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {post.primaryCta.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to={post.primaryCta.primaryHref}>
                <Button className="h-11 px-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-2 cursor-pointer">
                  <span>{post.primaryCta.primaryText}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              {post.primaryCta.secondaryText && post.primaryCta.secondaryHref && (
                <Link to={post.primaryCta.secondaryHref}>
                  <Button
                    variant="outline"
                    className="h-11 px-5 border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium cursor-pointer"
                  >
                    {post.primaryCta.secondaryText}
                  </Button>
                </Link>
              )}
            </div>
            <p className="text-xs text-slate-400 pt-1">
              ✓ {post.primaryCta.featureHighlight}
            </p>
          </section>
        </div>

        {/* Right Sticky Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Table of Contents */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-foreground uppercase tracking-wider">
              <BookOpen className="size-4 text-brand-orange" />
              <span>Mục lục bài viết</span>
            </div>
            <nav className="space-y-2 text-xs sm:text-sm">
              {post.sections.map((sec, idx) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block py-1.5 px-2.5 rounded-lg text-muted-foreground hover:text-brand-orange hover:bg-muted/50 transition-colors leading-snug"
                >
                  <span className="font-semibold text-foreground mr-1.5">
                    {idx + 1}.
                  </span>
                  {sec.heading}
                </a>
              ))}
              {post.faqs.length > 0 && (
                <a
                  href="#cau-hoi-thuong-gap"
                  className="block py-1.5 px-2.5 rounded-lg text-muted-foreground hover:text-brand-orange hover:bg-muted/50 transition-colors font-medium"
                >
                  • Câu hỏi thường gặp (FAQ)
                </a>
              )}
            </nav>
          </div>

          {/* Sticky Product Funnel Card */}
          <div className="rounded-2xl border border-brand-orange/30 bg-gradient-to-b from-brand-orange/10 via-card to-card p-5 space-y-4 shadow-xs">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange">
              <Layers className="size-4" />
              <span>HỆ SINH THÁI BRANDHUB</span>
            </div>
            <h3 className="text-base font-extrabold text-foreground leading-snug">
              Quản trị truyền thông như Jira/Notion & Xuất bản 4 kênh tự động
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dùng thử miễn phí gói Starter hoặc khám phá ngay các phân hệ cốt lõi:
            </p>

            <div className="space-y-2 text-xs">
              <Link
                to="/#media-package"
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-brand-orange/10 hover:text-brand-orange transition-colors font-semibold"
              >
                <span>1. Gói Truyền thông (Media Package)</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/#ai-features"
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-brand-orange/10 hover:text-brand-orange transition-colors font-semibold"
              >
                <span>2. AI Studio GraphRAG & Bắt Trend</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/#pricing"
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-brand-orange/10 hover:text-brand-orange transition-colors font-semibold"
              >
                <span>3. Bảng giá Starter (0đ) & Pro (590k)</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link to="/register">
                <Button
                  size="sm"
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-1 cursor-pointer"
                >
                  <Rocket className="size-3.5" />
                  <span>Đăng ký</span>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full font-semibold gap-1 cursor-pointer"
                >
                  <LogIn className="size-3.5" />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Target Keyword Tags */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Tag className="size-3.5 text-brand-orange" />
              <span>Chủ đề & Từ khóa liên quan</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[post.primaryKeyword, ...post.secondaryKeywords].map((kw, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-muted text-muted-foreground"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Related Posts Section */}
      <section className="space-y-4 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
            Bài viết liên quan trong hệ thống kiến thức
          </h2>
          <Link
            to="/blog"
            className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
          >
            <span>Xem toàn bộ 100 chủ đề</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatedPosts.map((rel) => (
            <Link
              key={rel.id}
              to={`/blog/${rel.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-brand-orange/50 hover:shadow-md transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-brand-orange">
                  Chủ đề #{String(rel.topicNumber).padStart(3, "0")} ·{" "}
                  {rel.readingTimeMinutes} phút đọc
                </span>
                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-brand-orange transition-colors leading-snug">
                  {rel.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {rel.metaDescription}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange">
                <span>Đọc tiếp</span>
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}

export default BlogPostPage;
