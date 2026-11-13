import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

// Enable Node 24 native TypeScript resolution for extensionless relative imports in src/data/*
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      !path.extname(specifier) &&
      context.parentURL
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const tsCandidate = path.resolve(parentDir, `${specifier}.ts`);
      if (fs.existsSync(tsCandidate)) {
        return nextResolve(pathToFileURL(tsCandidate).href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const SITE_ORIGIN = "https://brandhub.id.vn";
const distDir = path.resolve(import.meta.dirname, "../dist");
const publicDir = path.resolve(import.meta.dirname, "../public");
const baseHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(baseHtmlPath)) {
  console.error("[prerender-public-routes] dist/index.html not found.");
  process.exit(1);
}

const rawDistIndexHtml = fs.readFileSync(baseHtmlPath, "utf8");
const baseHtml = rawDistIndexHtml.replace(
  /<div id="root">[\s\S]*?<\/div>\s*(?=<noscript>)/,
  '<div id="root"></div>\n    ',
);

const blogModuleUrl = pathToFileURL(
  path.resolve(import.meta.dirname, "../src/data/blogData.ts"),
).href;
const { BLOG_POSTS, BLOG_CATEGORIES } = await import(blogModuleUrl);

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXml(str = "") {
  return escapeHtml(str).replace(/'/g, "&apos;");
}

function stripInlineMarkdownLinks(str = "") {
  return String(str).replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

function resolveFullUrl(href = "") {
  if (/^https?:\/\//i.test(href)) return href;
  return `${SITE_ORIGIN}${href.startsWith("/") ? href : `/${href}`}`;
}

function renderInlineRichHtml(str = "") {
  const input = String(str);
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let result = "";
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(input.slice(lastIndex, match.index));
    }
    const anchor = escapeHtml(match[1]);
    const fullHref = escapeHtml(resolveFullUrl(match[2]));
    result += `<a href="${fullHref}">${anchor}</a>`;
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < input.length) {
    result += escapeHtml(input.slice(lastIndex));
  }
  return result;
}

function estimateWordCount(post) {
  const chunks = [
    post.title,
    stripInlineMarkdownLinks(post.geoSummary),
    ...post.keyTakeaways.map(stripInlineMarkdownLinks),
    ...post.sections.flatMap((sec) => [
      sec.heading,
      ...sec.paragraphs.map(stripInlineMarkdownLinks),
      ...(sec.subheadings
        ? sec.subheadings.flatMap((s) => [
            s.title,
            stripInlineMarkdownLinks(s.body),
          ])
        : []),
      ...(sec.checklist || []).map(stripInlineMarkdownLinks),
      ...(sec.callout
        ? [sec.callout.label, stripInlineMarkdownLinks(sec.callout.text)]
        : []),
      ...(sec.comparisonTable
        ? [
            sec.comparisonTable.caption,
            ...sec.comparisonTable.headers,
            ...sec.comparisonTable.rows.flat().map(stripInlineMarkdownLinks),
          ]
        : []),
    ]),
    ...post.faqs.flatMap((f) => [
      f.question,
      stripInlineMarkdownLinks(f.answer),
    ]),
  ];
  return chunks
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const CLUSTER_PILLAR_BY_CATEGORY = {
  "agency-project-management": {
    slug: "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
    featureHref: "/#agency-workspace",
    featureLabel: "Phân hệ Quản trị đa Workspace & Phân quyền 6 vai trò",
  },
  "content-workflow-approval": {
    slug: "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
    featureHref: "/#how-it-works",
    featureLabel: "Luồng Phê duyệt Nội dung 3 cấp (Creator → Manager → Client)",
  },
  "media-package-campaign": {
    slug: "goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
    featureHref: "/#media-package",
    featureLabel: "Phân hệ Gói truyền thông (Media Package) & Media Campaign",
  },
  "ai-studio-graphrag-trends": {
    slug: "ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
    featureHref: "/#ai-features",
    featureLabel: "AI Studio & Đồ thị Tri thức GraphRAG (Neo4j + ChromaDB)",
  },
  "multi-channel-publishing": {
    slug: "lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
    featureHref: "/#features",
    featureLabel: "Lịch Xuất bản Tự động Facebook, Instagram, TikTok & Threads",
  },
  "tool-comparison-case-study": {
    slug: "so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    featureHref: "/#comparison",
    featureLabel: "Bảng So sánh Năng lực & Gói dịch vụ BrandHub",
  },
};

const SR_ONLY_STYLE =
  "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";

const HOME_SEMANTIC_HTML = `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>BrandHub — Nền tảng Quản trị Agency &amp; Xuất bản Nội dung Đa kênh AI</h1>
        <p>
          BrandHub (<a href="${SITE_ORIGIN}">${SITE_ORIGIN}</a>) là nền tảng SaaS B2B2C giúp các Agency truyền thông và Thương hiệu tại Việt Nam quản lý trọn vẹn vòng đời chiến dịch nội dung số: từ xây dựng Gói truyền thông (Media Package), lập kế hoạch Chiến dịch (Media Campaign), sáng tạo nội dung bằng AI GraphRAG (Neo4j + ChromaDB), kiểm duyệt an toàn nội dung, phê duyệt đa cấp (Owner, Manager, Creator, Client) đến xuất bản tự động lên 4 nền tảng mạng xã hội (Facebook, Instagram, TikTok, Threads).
        </p>
        <h2>Các nhóm tính năng cốt lõi</h2>
        <ul>
          <li><strong><a href="${SITE_ORIGIN}/#agency-workspace">Quản trị Agency &amp; đa Workspace</a>:</strong> Cô lập dữ liệu thương hiệu khách hàng, quản lý thành viên và phân quyền RBAC theo 6 vai trò chuẩn (Guest, Owner, Manager, Creator, Client, Admin).</li>
          <li><strong><a href="${SITE_ORIGIN}/#media-package">Gói truyền thông &amp; Chiến dịch (Media Package &amp; Media Campaign)</a>:</strong> Chia sẻ liên kết báo giá cho khách hàng không cần đăng nhập, đàm phán 2 chiều và chuyển đổi thành danh sách công việc tự động.</li>
          <li><strong><a href="${SITE_ORIGIN}/#ai-features">AI Studio &amp; GraphRAG Brand Knowledge</a>:</strong> Sinh bài viết chuẩn giọng văn thương hiệu, tạo ảnh/video sản phẩm với đại sứ ảo AI LoRA, kiểm duyệt tuân thủ cộng đồng và bắt xu hướng TikTok Creative Center &amp; Google Trends.</li>
          <li><strong><a href="${SITE_ORIGIN}/#features">Xuất bản Đa kênh &amp; Phân tích</a>:</strong> Đặt lịch đăng tự động và theo dõi chỉ số tăng trưởng thời gian thực trên Facebook, Instagram, TikTok và Threads.</li>
          <li><strong><a href="${SITE_ORIGIN}/#pricing">Bảng giá minh bạch &amp; VietQR tự động</a>:</strong> Nâng cấp gói Starter (0đ) hoặc Pro (590.000 VNĐ/tháng) và nạp AI Credits qua SePay / PayOS (VietQR).</li>
        </ul>
        <h2>Thư viện Kiến thức &amp; 6 Chuyên mục Chiến lược</h2>
        <ul>
          ${BLOG_CATEGORIES.map(
            (cat) =>
              `<li><a href="${SITE_ORIGIN}/blog?category=${cat.slug}">${escapeHtml(cat.name)}</a> — ${escapeHtml(cat.description)}</li>`,
          ).join("\n          ")}
        </ul>
        <nav aria-label="Liên kết công khai">
          <a href="${SITE_ORIGIN}/blog">Blog &amp; Cẩm nang Quản trị Truyền thông (${BLOG_POSTS.length} Bài viết chuyên sâu)</a> |
          <a href="${SITE_ORIGIN}/help/faq">Trung tâm Trợ giúp &amp; Câu hỏi thường gặp (FAQ)</a> |
          <a href="${SITE_ORIGIN}/rss.xml">RSS Feed</a> |
          <a href="${SITE_ORIGIN}/sitemap.xml">Sitemap</a> |
          <a href="${SITE_ORIGIN}/privacy">Chính sách Quyền riêng tư (Privacy Policy)</a> |
          <a href="${SITE_ORIGIN}/terms">Điều khoản Dịch vụ (Terms of Service)</a> |
          <a href="${SITE_ORIGIN}/login">Đăng nhập</a> |
          <a href="${SITE_ORIGIN}/register">Đăng ký miễn phí</a>
        </nav>
      </main>`;

// Inject semantic HTML into dist/index.html #root so Wave 1 crawlers index full homepage content immediately
const enrichedHomeHtml = baseHtml.replace(
  /<div id="root"><\/div>/,
  `<div id="root"><div style="${SR_ONLY_STYLE}">${HOME_SEMANTIC_HTML}</div></div>`,
);
fs.writeFileSync(baseHtmlPath, enrichedHomeHtml, "utf8");

const sortedAllPosts = [...BLOG_POSTS].sort(
  (a, b) => a.topicNumber - b.topicNumber,
);
const postBySlug = new Map(sortedAllPosts.map((p) => [p.slug, p]));
const categoryBySlug = new Map(BLOG_CATEGORIES.map((c) => [c.slug, c]));

function buildArticleSemanticHtml(post, categoryMeta, relatedPosts) {
  const clusterMeta = CLUSTER_PILLAR_BY_CATEGORY[post.category];
  const pillarPost = clusterMeta ? postBySlug.get(clusterMeta.slug) : null;
  const sameCategoryPosts = sortedAllPosts.filter(
    (p) => p.category === post.category,
  );
  const idxInCat = sameCategoryPosts.findIndex((p) => p.slug === post.slug);
  const prevInCluster = idxInCat > 0 ? sameCategoryPosts[idxInCat - 1] : null;
  const nextInCluster =
    idxInCat >= 0 && idxInCat < sameCategoryPosts.length - 1
      ? sameCategoryPosts[idxInCat + 1]
      : null;

  const tocItems = post.sections
    .map((sec, idx) => {
      const subLinks =
        sec.subheadings && sec.subheadings.length > 0
          ? `<ul>${sec.subheadings
              .map(
                (sub, sIdx) =>
                  `<li><a href="#${escapeHtml(sec.id)}-sub-${sIdx + 1}">${escapeHtml(sub.title)}</a></li>`,
              )
              .join("")}</ul>`
          : "";
      return `<li><a href="#${escapeHtml(sec.id)}">${idx + 1}. ${escapeHtml(sec.heading)}</a>${subLinks}</li>`;
    })
    .join("\n            ");

  const sectionsHtml = post.sections
    .map((sec) => {
      const paragraphsHtml = sec.paragraphs
        .map((p) => `<p>${renderInlineRichHtml(p)}</p>`)
        .join("\n          ");

      const subheadingsHtml =
        sec.subheadings && sec.subheadings.length > 0
          ? sec.subheadings
              .map(
                (sub, sIdx) => `
          <div id="${escapeHtml(sec.id)}-sub-${sIdx + 1}">
            <h3>${escapeHtml(sub.title)}</h3>
            <p>${renderInlineRichHtml(sub.body)}</p>
          </div>`,
              )
              .join("")
          : "";

      const checklistHtml =
        sec.checklist && sec.checklist.length > 0
          ? `<ol>${sec.checklist.map((item) => `<li>${renderInlineRichHtml(item)}</li>`).join("")}</ol>`
          : "";

      const calloutHtml = sec.callout
        ? `<aside><strong>${escapeHtml(sec.callout.label)}:</strong> ${renderInlineRichHtml(sec.callout.text)}</aside>`
        : "";

      const tableHtml = sec.comparisonTable
        ? `<table>
            <caption>${escapeHtml(sec.comparisonTable.caption)}</caption>
            <thead>
              <tr>${sec.comparisonTable.headers.map((h) => `<th scope="col">${escapeHtml(h)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${sec.comparisonTable.rows
                .map(
                  (row) =>
                    `<tr>${row
                      .map((cell, cIdx) =>
                        cIdx === 0
                          ? `<th scope="row">${renderInlineRichHtml(cell)}</th>`
                          : `<td>${renderInlineRichHtml(cell)}</td>`,
                      )
                      .join("")}</tr>`,
                )
                .join("\n              ")}
            </tbody>
          </table>`
        : "";

      return `
        <section id="${escapeHtml(sec.id)}">
          <h2>${escapeHtml(sec.heading)}</h2>
          ${paragraphsHtml}
          ${subheadingsHtml}
          ${checklistHtml}
          ${calloutHtml}
          ${tableHtml}
        </section>`;
    })
    .join("\n");

  const faqsHtml =
    post.faqs && post.faqs.length > 0
      ? `
        <section id="cau-hoi-thuong-gap">
          <h2>Câu hỏi thường gặp (FAQ)</h2>
          ${post.faqs
            .map(
              (f) =>
                `<div><h3>${escapeHtml(f.question)}</h3><p>${renderInlineRichHtml(f.answer)}</p></div>`,
            )
            .join("\n          ")}
        </section>`
      : "";

  const featureBridgeHtml = clusterMeta
    ? `
        <aside aria-label="Giải pháp BrandHub liên quan">
          <h2>Triển khai trực tiếp trên nền tảng BrandHub</h2>
          <p>Áp dụng ngay quy trình này với <a href="${resolveFullUrl(clusterMeta.featureHref)}">${escapeHtml(clusterMeta.featureLabel)}</a> dành cho ${escapeHtml((post.targetRoles || []).join(", "))}.</p>
          <p>
            <a href="${resolveFullUrl(post.primaryCta.primaryHref)}">${escapeHtml(post.primaryCta.primaryText)}</a>
            ${
              post.primaryCta.secondaryHref && post.primaryCta.secondaryText
                ? ` | <a href="${resolveFullUrl(post.primaryCta.secondaryHref)}">${escapeHtml(post.primaryCta.secondaryText)}</a>`
                : ""
            }
            | <a href="${SITE_ORIGIN}/#pricing">Xem bảng giá Starter 0đ &amp; Pro</a>
          </p>
        </aside>`
    : "";

  const clusterNavItems = [
    ...(pillarPost && pillarPost.slug !== post.slug
      ? [
          `<li>Bài viết Trụ cột chuyên mục: <a href="${SITE_ORIGIN}/blog/${escapeHtml(pillarPost.slug)}">${escapeHtml(pillarPost.title)}</a></li>`,
        ]
      : []),
    ...(prevInCluster
      ? [
          `<li>Bài trước trong cụm chủ đề: <a href="${SITE_ORIGIN}/blog/${escapeHtml(prevInCluster.slug)}">${escapeHtml(prevInCluster.title)}</a></li>`,
        ]
      : []),
    ...(nextInCluster
      ? [
          `<li>Bài tiếp theo trong cụm chủ đề: <a href="${SITE_ORIGIN}/blog/${escapeHtml(nextInCluster.slug)}">${escapeHtml(nextInCluster.title)}</a></li>`,
        ]
      : []),
    ...relatedPosts.map(
      (rel) =>
        `<li><a href="${SITE_ORIGIN}/blog/${escapeHtml(rel.slug)}">${escapeHtml(rel.title)}</a></li>`,
    ),
  ];

  const relatedHtml =
    clusterNavItems.length > 0
      ? `
        <nav aria-label="Bài viết liên quan">
          <h2>Bài viết chuyên sâu liên quan trong hệ sinh thái BrandHub</h2>
          <ul>
            ${clusterNavItems.join("\n            ")}
          </ul>
        </nav>`
      : "";

  return `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.7;">
        <nav aria-label="Breadcrumb">
          <a href="${SITE_ORIGIN}/">Trang chủ</a> &gt;
          <a href="${SITE_ORIGIN}/blog">Blog</a> &gt;
          <a href="${SITE_ORIGIN}/blog?category=${escapeHtml(post.category)}">${escapeHtml(categoryMeta ? categoryMeta.shortName : post.category)}</a> &gt;
          <span>${escapeHtml(post.title)}</span>
        </nav>
        <article>
          <header>
            <h1>${escapeHtml(post.title)}</h1>
            <p>
              Tác giả: <a href="${SITE_ORIGIN}/blog?q=${encodeURIComponent(post.author.name)}"><strong>${escapeHtml(post.author.name)}</strong></a> (${escapeHtml(post.author.roleTitle)}) ·
              Ngày đăng: <time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(post.publishedAt)}</time> ·
              Thời lượng đọc: ${post.readingTimeMinutes} phút
            </p>
            <figure>
              <img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.coverImageAlt)}" width="1200" height="800" loading="eager" />
              <figcaption>${escapeHtml(post.coverImageAlt)}</figcaption>
            </figure>
          </header>
          <section aria-label="Tóm tắt cốt lõi">
            <h2>Tóm tắt cốt lõi</h2>
            <p>${renderInlineRichHtml(post.geoSummary)}</p>
            <ul>
              ${post.keyTakeaways.map((k) => `<li>${renderInlineRichHtml(k)}</li>`).join("\n              ")}
            </ul>
          </section>
          <nav aria-label="Mục lục bài viết">
            <h2>Mục lục bài viết</h2>
            <ol>
              ${tocItems}
            </ol>
          </nav>
          ${sectionsHtml}
          ${featureBridgeHtml}
          ${faqsHtml}
          <footer>
            <p><a href="${resolveFullUrl(post.primaryCta.primaryHref)}">${escapeHtml(post.primaryCta.primaryText)}</a> | <a href="${SITE_ORIGIN}/blog">Xem toàn bộ ${BLOG_POSTS.length} bài viết tại Blog BrandHub</a> | <a href="${SITE_ORIGIN}/help/faq">Trung tâm Trợ giúp FAQ</a></p>
          </footer>
        </article>
        ${relatedHtml}
      </main>`;
}

const blogHubSemanticHtml = `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Blog Quản trị Agency, Gói Truyền thông &amp; AI — BrandHub</h1>
        <p>Thư viện ${sortedAllPosts.length} bài phân tích chuyên sâu giúp Owner, Manager, Creator và Client làm chủ mô hình quản lý công việc chuẩn Jira / Notion, thiết kế Gói truyền thông (Media Package), ứng dụng AI GraphRAG và tự động hóa xuất bản trên Facebook, Instagram, TikTok, Threads.</p>
        ${BLOG_CATEGORIES.map((cat) => {
          const catPosts = sortedAllPosts.filter((p) => p.category === cat.slug);
          const clusterMeta = CLUSTER_PILLAR_BY_CATEGORY[cat.slug];
          return `<section>
          <h2><a href="${SITE_ORIGIN}/blog?category=${escapeHtml(cat.slug)}">${escapeHtml(cat.name)}</a> (${catPosts.length} bài viết)</h2>
          <p>${escapeHtml(cat.description)}${clusterMeta ? ` — <a href="${SITE_ORIGIN}${clusterMeta.featureHref}">${escapeHtml(clusterMeta.featureLabel)}</a>` : ""}</p>
          <ul>
            ${catPosts
              .map(
                (p) =>
                  `<li><a href="${SITE_ORIGIN}/blog/${escapeHtml(p.slug)}">#${String(p.topicNumber).padStart(3, "0")} — ${escapeHtml(p.title)}</a></li>`,
              )
              .join("\n            ")}
          </ul>
        </section>`;
        }).join("\n        ")}
      </main>`;

const pillarPosts = [1, 18, 35, 52, 70, 86]
  .map((num) => sortedAllPosts.find((p) => p.topicNumber === num))
  .filter(Boolean);

const PUBLIC_ROUTES = [
  {
    routePath: "help/faq",
    canonicalUrl: `${SITE_ORIGIN}/help/faq`,
    bilingual: true,
    title: "Trung Tâm Trợ Giúp & Câu Hỏi Thường Gặp (FAQ) | BrandHub",
    description:
      "Giải đáp chi tiết về quản trị Agency & Workspace, Gói truyền thông Media Package, AI Studio GraphRAG, phê duyệt nội dung và xuất bản đa kênh trên BrandHub.",
    keywords:
      "hướng dẫn sử dụng brandhub, câu hỏi thường gặp brandhub, quản lý workspace agency, thanh toán vietqr sepay payos",
    ogType: "website",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "BrandHub",
              item: `${SITE_ORIGIN}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Trung Tâm Trợ Giúp & Câu Hỏi Thường Gặp",
              item: `${SITE_ORIGIN}/help/faq`,
            },
          ],
        },
        {
          "@type": "FAQPage",
          "@id": `${SITE_ORIGIN}/help/faq#faqpage`,
          mainEntity: [
            {
              "@type": "Question",
              name: "Khách hàng không muốn tạo tài khoản BrandHub thì có xem và duyệt bài được không?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Khách hàng không cần tạo tài khoản để xem trước Gói truyền thông & Báo giá Proposal qua liên kết chia sẻ hoặc xuất PDF. Để phê duyệt bài viết chính thức với đầy đủ lịch sử kiểm tra, Khách hàng tham gia Workspace với vai trò Client để xem bản xem trước chuẩn mạng xã hội và bấm Duyệt hoặc Từ chối nhanh chóng.",
              },
            },
            {
              "@type": "Question",
              name: "Tại sao bài viết đang ở trạng thái Chờ duyệt lại bị khóa không cho chỉnh sửa?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Đây là cơ chế bảo vệ tính toàn vẹn của BrandHub nhằm đảm bảo người duyệt đánh giá đúng bản nội dung cố định. Nếu cần chỉnh sửa, Creator có thể nhấn nút Thu hồi lượt gửi hoặc nhờ Manager/Client nhấn Từ chối để mở khóa trình soạn thảo.",
              },
            },
            {
              "@type": "Question",
              name: "Cấu hình múi giờ của Không gian làm việc nằm ở đâu và ảnh hưởng thế nào đến lịch đăng?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Múi giờ quyết định chính xác thời điểm bài viết hẹn giờ được xuất bản tự động lên Facebook, Instagram, TikTok, Threads. Bạn có thể cấu hình tại mục Cài đặt chung của từng Workspace (mặc định tại Việt Nam là Asia/Ho_Chi_Minh GMT+7).",
              },
            },
            {
              "@type": "Question",
              name: "Chu kỳ làm mới AI Credits hàng tháng và gói mua thêm hoạt động như thế nào?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Credits định kỳ theo gói đăng ký được tự động làm mới vào ngày đầu tiên của mỗi chu kỳ thanh toán. Khi mua thêm gói AI Credits qua VietQR (SePay / PayOS), số điểm cộng thêm này không giới hạn thời hạn sử dụng và chỉ bị trừ sau khi hạn mức định kỳ trong tháng đã dùng hết.",
              },
            },
          ],
        },
      ],
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Trung Tâm Trợ Giúp &amp; Câu Hỏi Thường Gặp (FAQ) — BrandHub</h1>
        <p>Tra cứu nhanh hướng dẫn vận hành Agency, thiết lập Workspace, chia sẻ Gói truyền thông (Media Package), sử dụng AI Studio GraphRAG, quy trình phê duyệt nội dung 3 cấp (Creator → Manager → Client) và xuất bản đa kênh (Facebook, Instagram, TikTok, Threads).</p>
        <h2>Cẩm nang Chuyên sâu Theo 6 Phân hệ Vận hành</h2>
        <ul>
          ${pillarPosts
            .map(
              (p) =>
                `<li><a href="${SITE_ORIGIN}/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></li>`,
            )
            .join("\n          ")}
        </ul>
        <p><a href="${SITE_ORIGIN}/">Quay lại Trang chủ BrandHub</a> | <a href="${SITE_ORIGIN}/blog">Khám phá toàn bộ ${sortedAllPosts.length} Bài viết Chuyên sâu</a></p>
      </main>`,
  },
  {
    routePath: "privacy",
    canonicalUrl: `${SITE_ORIGIN}/privacy`,
    bilingual: true,
    title: "Chính Sách Quyền Riêng Tư (Privacy Policy) | BrandHub",
    description:
      "Chính sách quyền riêng tư giải thích cách BrandHub thu thập, mã hóa AES-256 và bảo vệ dữ liệu cá nhân, tài nguyên Workspace trên https://brandhub.id.vn.",
    keywords:
      "chính sách bảo mật brandhub, privacy policy brandhub, mã hóa token aes-256, bảo mật dữ liệu workspace",
    ogType: "website",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "BrandHub",
          item: `${SITE_ORIGIN}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Chính Sách Quyền Riêng Tư (Privacy Policy)",
          item: `${SITE_ORIGIN}/privacy`,
        },
      ],
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Chính Sách Quyền Riêng Tư (Privacy Policy) — BrandHub</h1>
        <p>Chính sách quyền riêng tư này giải thích cách BrandHub (${SITE_ORIGIN}) thu thập, sử dụng, mã hóa AES-256 và bảo vệ dữ liệu cá nhân, tài nguyên số trong Workspace và kết nối OAuth mạng xã hội.</p>
        <p>Liên hệ bộ phận bảo vệ dữ liệu &amp; hỗ trợ: <a href="mailto:brandhub404@gmail.com">brandhub404@gmail.com</a>.</p>
        <p><a href="${SITE_ORIGIN}/">Quay lại Trang chủ BrandHub</a> | <a href="${SITE_ORIGIN}/blog">Blog &amp; Cẩm nang Quản trị Truyền thông</a></p>
      </main>`,
  },
  {
    routePath: "terms",
    canonicalUrl: `${SITE_ORIGIN}/terms`,
    bilingual: true,
    title: "Điều Khoản Dịch Vụ (Terms of Service) | BrandHub",
    description:
      "Điều khoản dịch vụ quy định quyền truy cập, phân quyền 6 vai trò (Guest, Owner, Manager, Creator, Client, Admin), AI Credits và xuất bản đa kênh trên BrandHub.",
    keywords:
      "điều khoản dịch vụ brandhub, terms of service brandhub, phân quyền 6 vai trò agency, quy định xuất bản mạng xã hội",
    ogType: "website",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "BrandHub",
          item: `${SITE_ORIGIN}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Điều Khoản Dịch Vụ (Terms of Service)",
          item: `${SITE_ORIGIN}/terms`,
        },
      ],
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Điều Khoản Dịch Vụ (Terms of Service) — BrandHub</h1>
        <p>Điều khoản dịch vụ quy định quyền và trách nhiệm khi sử dụng nền tảng BrandHub (${SITE_ORIGIN}), bao gồm quản trị Agency &amp; Workspace, phân quyền 6 vai trò (Guest, Owner, Manager, Creator, Client, Admin), thanh toán VietQR (SePay / PayOS) và xuất bản mạng xã hội.</p>
        <p><a href="${SITE_ORIGIN}/">Quay lại Trang chủ BrandHub</a> | <a href="${SITE_ORIGIN}/blog">Blog &amp; Cẩm nang Quản trị Truyền thông</a></p>
      </main>`,
  },
  {
    routePath: "blog",
    canonicalUrl: `${SITE_ORIGIN}/blog`,
    bilingual: false,
    title: "Blog Quản trị Agency, Gói Truyền thông & AI | BrandHub",
    description:
      "Cẩm nang vận hành Agency như Jira & Notion, quy trình phê duyệt nội dung 3 cấp, báo giá Gói truyền thông (Media Package), AI GraphRAG và lịch đăng tự động Facebook, Instagram, TikTok, Threads.",
    keywords:
      "blog truyền thông, quản lý dự án marketing như jira notion, quy trình duyệt bài 3 cấp, gói truyền thông gồm những gì, ai viết content brand guideline, đăng bài tự động facebook instagram tiktok threads",
    ogType: "website",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${SITE_ORIGIN}/blog#webpage`,
          url: `${SITE_ORIGIN}/blog`,
          name: "Blog Quản trị Agency, Gói Truyền thông & AI | BrandHub",
          description:
            "Thư viện kiến thức chuyên sâu về quản trị dự án truyền thông như Jira/Notion, quy trình duyệt nội dung 3 cấp, xây dựng Gói truyền thông (Media Package), AI GraphRAG và xuất bản tự động 4 kênh Facebook, Instagram, TikTok, Threads.",
          inLanguage: "vi-VN",
          isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        },
        {
          "@type": "Blog",
          "@id": `${SITE_ORIGIN}/blog#blog`,
          name: "BrandHub Knowledge & Media Operations Blog",
          url: `${SITE_ORIGIN}/blog`,
          publisher: { "@id": `${SITE_ORIGIN}/#organization` },
        },
        {
          "@type": "ItemList",
          name: "Danh mục 100 bài viết chuyên sâu về Quản trị Truyền thông & AI Marketing",
          numberOfItems: sortedAllPosts.length,
          itemListElement: sortedAllPosts.map((p, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: p.title,
            url: `${SITE_ORIGIN}/blog/${p.slug}`,
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Trang chủ",
              item: `${SITE_ORIGIN}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog & Cẩm nang Truyền thông",
              item: `${SITE_ORIGIN}/blog`,
            },
          ],
        },
      ],
    },
    noscriptHtml: blogHubSemanticHtml,
  },
];

for (const post of sortedAllPosts) {
  const canonicalUrl = `${SITE_ORIGIN}/blog/${post.slug}`;
  const catMeta = categoryBySlug.get(post.category);
  const relatedPosts = (post.relatedSlugs || [])
    .map((s) => postBySlug.get(s))
    .filter(Boolean);
  const wordCount = estimateWordCount(post);
  const keywordsStr = [
    post.primaryKeyword,
    ...(post.secondaryKeywords || []),
  ].join(", ");

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Trang chủ",
      item: `${SITE_ORIGIN}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_ORIGIN}/blog`,
    },
    ...(catMeta
      ? [
          {
            "@type": "ListItem",
            position: 3,
            name: catMeta.shortName,
            item: `${SITE_ORIGIN}/blog?category=${catMeta.slug}`,
          },
        ]
      : []),
    {
      "@type": "ListItem",
      position: catMeta ? 4 : 3,
      name: post.title,
      item: canonicalUrl,
    },
  ];

  PUBLIC_ROUTES.push({
    routePath: `blog/${post.slug}`,
    canonicalUrl,
    bilingual: false,
    title: post.metaTitle || `${post.title} | BrandHub`,
    description: post.metaDescription,
    keywords: keywordsStr,
    ogType: "article",
    ogImage: post.coverImage,
    ogImageAlt: post.coverImageAlt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt || post.publishedAt,
    articleSection: catMeta ? catMeta.name : "Quản trị Truyền thông & AI",
    authorName: post.author.name,
    pageJsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `${canonicalUrl}#article`,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
          },
          isPartOf: {
            "@id": `${SITE_ORIGIN}/blog#blog`,
          },
          about: {
            "@id": `${SITE_ORIGIN}/#application`,
          },
          headline: post.title,
          description: post.metaDescription,
          image: [post.coverImage],
          datePublished: post.publishedAt,
          dateModified: post.updatedAt || post.publishedAt,
          inLanguage: "vi-VN",
          wordCount,
          timeRequired: `PT${post.readingTimeMinutes}M`,
          author: {
            "@type": "Person",
            name: post.author.name,
            jobTitle: post.author.roleTitle,
            url: `${SITE_ORIGIN}/blog?q=${encodeURIComponent(post.author.name)}`,
            worksFor: {
              "@id": `${SITE_ORIGIN}/#organization`,
            },
          },
          publisher: {
            "@id": `${SITE_ORIGIN}/#organization`,
          },
          articleSection: catMeta ? catMeta.name : "Quản trị Truyền thông & AI",
          keywords: keywordsStr,
          abstract: stripInlineMarkdownLinks(post.geoSummary),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", "[aria-label='Tóm tắt cốt lõi']"],
          },
          mentions: relatedPosts.map((rel) => ({
            "@type": "BlogPosting",
            "@id": `${SITE_ORIGIN}/blog/${rel.slug}#article`,
            headline: rel.title,
            url: `${SITE_ORIGIN}/blog/${rel.slug}`,
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems,
        },
        ...(post.faqs && post.faqs.length > 0
          ? [
              {
                "@type": "FAQPage",
                "@id": `${canonicalUrl}#faq`,
                mainEntity: post.faqs.map((f) => ({
                  "@type": "Question",
                  name: f.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: stripInlineMarkdownLinks(f.answer),
                  },
                })),
              },
            ]
          : []),
      ],
    },
    noscriptHtml: buildArticleSemanticHtml(post, catMeta, relatedPosts),
  });
}

// 1. Synchronize sitemap.xml (with Google Image Sitemap extensions & clean hreflang per route)
const todayIso = "2026-11-11";
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_ORIGIN}/</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_ORIGIN}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/" />
    <image:image>
      <image:loc>${SITE_ORIGIN}/icon.png</image:loc>
      <image:title>BrandHub — Nền tảng Quản trị Agency &amp; Xuất bản Đa kênh AI</image:title>
      <image:caption>Logo BrandHub</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${SITE_ORIGIN}/blog</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_ORIGIN}/blog" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/blog" />
  </url>
${sortedAllPosts
  .map(
    (p) => `  <url>
    <loc>${SITE_ORIGIN}/blog/${escapeXml(p.slug)}</loc>
    <lastmod>${escapeXml(p.updatedAt || p.publishedAt || todayIso)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${[1, 18, 35, 52, 70, 86].includes(p.topicNumber) ? "0.90" : "0.85"}</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_ORIGIN}/blog/${escapeXml(p.slug)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/blog/${escapeXml(p.slug)}" />
    <image:image>
      <image:loc>${escapeXml(p.coverImage)}</image:loc>
      <image:title>${escapeXml(p.title)}</image:title>
      <image:caption>${escapeXml(p.coverImageAlt)}</image:caption>
    </image:image>
  </url>`,
  )
  .join("\n")}
  <url>
    <loc>${SITE_ORIGIN}/help/faq</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_ORIGIN}/help/faq" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/help/faq?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/help/faq" />
  </url>
  <url>
    <loc>${SITE_ORIGIN}/privacy</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.50</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_ORIGIN}/privacy" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/privacy?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/privacy" />
  </url>
  <url>
    <loc>${SITE_ORIGIN}/terms</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.50</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_ORIGIN}/terms" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/terms?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/terms" />
  </url>
</urlset>
`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf8");

// 2. Generate RSS 2.0 XML Feed (rss.xml) for Google News/Discover, Feedly & AI Aggregators
const rssSortedPosts = [...sortedAllPosts].sort((a, b) => {
  const diff =
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  return diff !== 0 ? diff : a.topicNumber - b.topicNumber;
});
const rssBuildDate = new Date(`${todayIso}T08:00:00+07:00`).toUTCString();

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>BrandHub Blog — Quản trị Agency, Gói Truyền thông &amp; AI</title>
    <link>${SITE_ORIGIN}/blog</link>
    <description>Hệ thống ${sortedAllPosts.length} bài phân tích thực chiến về quản trị dự án truyền thông như Jira/Notion, phê duyệt nội dung 3 cấp, Gói truyền thông (Media Package), AI GraphRAG và xuất bản tự động Facebook, Instagram, TikTok, Threads.</description>
    <language>vi-vn</language>
    <lastBuildDate>${rssBuildDate}</lastBuildDate>
    <atom:link href="${SITE_ORIGIN}/rss.xml" rel="self" type="application/rss+xml" />
${rssSortedPosts
  .map((p) => {
    const catMeta = categoryBySlug.get(p.category);
    const pubDate = new Date(`${p.publishedAt}T08:00:00+07:00`).toUTCString();
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_ORIGIN}/blog/${escapeXml(p.slug)}</link>
      <guid isPermaLink="true">${SITE_ORIGIN}/blog/${escapeXml(p.slug)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(p.author.name)}</dc:creator>
      <category>${escapeXml(catMeta ? catMeta.name : p.category)}</category>
      <description>${escapeXml(stripInlineMarkdownLinks(p.geoSummary))}</description>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(publicDir, "rss.xml"), rssXml, "utf8");
fs.writeFileSync(path.join(distDir, "rss.xml"), rssXml, "utf8");

// 3. Synchronize llms.txt & llms-full.txt for Generative Engine Optimization (ChatGPT Search, Perplexity, Claude, Google AI Overviews)
const llmsTxt = `# BrandHub — AI-Powered Brand & Multi-Channel Content Management Platform

> BrandHub (${SITE_ORIGIN}) là nền tảng SaaS B2B2C giúp các Agency truyền thông và Thương hiệu tại Việt Nam quản trị trọn vẹn vòng đời chiến dịch nội dung số: từ xây dựng Gói truyền thông (Media Package), lập kế hoạch Chiến dịch (Media Campaign), sáng tạo nội dung đa phương thức bằng AI Studio tích hợp GraphRAG (Neo4j + ChromaDB), kiểm duyệt an toàn cộng đồng, phê duyệt 3 cấp minh bạch đến xuất bản tự động lên 4 nền tảng mạng xã hội (Facebook, Instagram, TikTok, Threads).

## Canonical Public Pages & Machine-Readable Feeds
- [Trang chủ BrandHub](${SITE_ORIGIN}/): Tổng quan nền tảng, kiến trúc AI GraphRAG, quy trình cộng tác 6 vai trò, bảng giá và demo tương tác.
- [Blog & Thư viện ${sortedAllPosts.length} Chủ đề Quản trị Truyền thông Chuyên sâu](${SITE_ORIGIN}/blog): Hệ thống bài phân tích thực chiến về quản trị dự án như Jira/Notion, luồng phê duyệt nội dung 3 cấp, xây dựng Gói truyền thông (Media Package), AI GraphRAG Neo4j/ChromaDB và lịch đăng tự động 4 kênh.
- [Trung tâm Trợ giúp & Câu hỏi thường gặp (FAQ)](${SITE_ORIGIN}/help/faq): Hướng dẫn chi tiết về vận hành Agency, Workspace, Media Package, AI Studio, phê duyệt nội dung và thanh toán VietQR.
- [Chính sách Quyền riêng tư (Privacy Policy)](${SITE_ORIGIN}/privacy): Chính sách bảo vệ dữ liệu cá nhân, cô lập tài nguyên Workspace và bảo mật OAuth Access Token (AES-256).
- [Điều khoản Dịch vụ (Terms of Service)](${SITE_ORIGIN}/terms): Quy định sử dụng dịch vụ, phân quyền 6 vai trò, AI Credits và xuất bản đa kênh.
- [Extended GEO Corpus (llms-full.txt)](${SITE_ORIGIN}/llms-full.txt): Toàn bộ tóm tắt chuyên sâu, luận điểm cốt lõi và FAQ của ${sortedAllPosts.length} bài viết dành cho AI Search & RAG engines.
- [RSS 2.0 Feed](${SITE_ORIGIN}/rss.xml): Nguồn cấp bài viết mới nhất định dạng XML chuẩn RSS 2.0.

## 6 Vai trò Hệ thống Chuẩn (Canonical System Roles)
- **Guest**: Khách truy cập xem trang chủ, tài liệu trợ giúp, liên kết chia sẻ gói truyền thông và khảo sát công khai.
- **Owner**: Chủ sở hữu Agency — thiết lập tổ chức, nâng cấp gói đăng ký (Subscription), phân bổ hạn mức AI Credits và khởi tạo Workspace.
- **Manager**: Quản lý chiến dịch và không gian làm việc — lập kế hoạch Media Campaign, giao việc, kiểm soát chất lượng nội bộ và trình duyệt cho khách hàng.
- **Creator**: Chuyên viên sáng tạo nội dung — soạn thảo bài đăng đa kênh, sử dụng AI Studio GraphRAG, thiết kế ấn phẩm/video và gửi duyệt.
- **Client**: Đại diện thương hiệu khách hàng — đàm phán Gói truyền thông (Media Package), xem trước bài đăng chuẩn định dạng mạng xã hội và phê duyệt chính thức.
- **Admin**: Quản trị viên hệ thống — giám sát sức khỏe hạ tầng, quản lý gói dịch vụ hệ thống, hàng đợi kiểm duyệt nội dung cộng đồng và đối soát thanh toán.

## 9 Phân hệ Sản phẩm Cốt lõi
1. **Authentication & Authorization**: Đăng ký, đăng nhập Email/Google OAuth, xác thực hai lớp (2FA TOTP), phân quyền RBAC 6 vai trò.
2. **User & Client Profile**: Quản lý hồ sơ cá nhân, bảo mật tài khoản và hồ sơ thương hiệu khách hàng.
3. **Agency & Workspace**: Quản trị đa Agency, cô lập dữ liệu theo từng Workspace khách hàng, quản lý thành viên, danh bạ đối tác báo đài (Báo điện tử, Truyền hình, Banner) và kho lưu trữ đám mây S3.
4. **Media Package & Media Campaign**: Xây dựng danh mục Gói truyền thông, chia sẻ liên kết báo giá trực tuyến, đàm phán 2 chiều và tự động chuyển đổi thành Chiến dịch truyền thông (Media Campaign).
5. **Content & Workflow**: Quản lý công việc, soạn thảo nội dung đa định dạng, biểu mẫu khảo sát, kiểm duyệt tuân thủ an toàn cộng đồng (Check Compliance Content) và quy trình phê duyệt 3 cấp (Creator → Manager → Client).
6. **AI Studio & GraphRAG**: Sinh văn bản chuẩn Brand Guidelines với Neo4j Knowledge Graph + ChromaDB, tạo ảnh thương mại, huấn luyện đại sứ thương hiệu ảo (LoRA), dựng video ngắn AI và cào xu hướng thời gian thực (TikTok Creative Center & Google Trends).
7. **Publishing & Social**: Kết nối OAuth 2.0 mã hóa AES-256, đặt lịch xuất bản tự động, theo dõi Content Calendar và phân tích chỉ số hiệu suất trên 4 nền tảng chính thức: **Facebook, Instagram, TikTok, và Threads**.
8. **Subscription & Billing**: Nâng cấp gói dịch vụ (Starter 0đ / Pro 590.000 VNĐ/tháng), nạp thêm gói AI Credits không giới hạn thời hạn và thanh toán tự động qua **SePay / PayOS (VietQR)**.
9. **Enterprise Governance**: Quản trị người dùng, thư viện Workspace Template, hàng đợi kiểm duyệt an toàn nội dung (Content Moderation Queue) và giám sát độ trễ hệ thống.

## Danh mục ${sortedAllPosts.length} Bài viết Chuyên sâu theo 6 Chuyên mục
${BLOG_CATEGORIES.map((cat) => {
  const postsInCat = sortedAllPosts.filter((p) => p.category === cat.slug);
  return (
    `### ${cat.name} (${postsInCat.length} bài)\n` +
    postsInCat
      .map(
        (p) =>
          `- [#${String(p.topicNumber).padStart(3, "0")} ${p.title}](${SITE_ORIGIN}/blog/${p.slug}): ${p.metaDescription}`,
      )
      .join("\n")
  );
}).join("\n\n")}

## Thông tin Liên hệ
- Website: ${SITE_ORIGIN}
- Email hỗ trợ: brandhub404@gmail.com
`;

const llmsFullTxt = `# BrandHub — Complete Product Architecture & ${sortedAllPosts.length}-Article Knowledge Base (GEO Corpus)

> Nguồn tri thức toàn diện dành cho AI Search Engines (Google AI Overviews, ChatGPT Search, Perplexity, Claude). Tài liệu này tổng hợp kiến trúc sản phẩm BrandHub (${SITE_ORIGIN}) cùng tóm tắt chuyên sâu, luận điểm cốt lõi và câu hỏi thường gặp của toàn bộ ${sortedAllPosts.length} bài phân tích vận hành Agency, Gói truyền thông (Media Package), AI GraphRAG và Xuất bản đa kênh.

## 1. Thông tin Nền tảng Chuẩn hóa
- **Tên sản phẩm**: BrandHub
- **URL chính thức**: ${SITE_ORIGIN}
- **Mô hình**: SaaS B2B2C Quản trị Agency Truyền thông, Cộng tác Thương hiệu & Xuất bản Nội dung Đa kênh tích hợp AI GraphRAG.
- **6 Vai trò chuẩn**: Guest, Owner, Manager, Creator, Client, Admin.
- **4 Nền tảng Mạng xã hội tích hợp chính thức**: Facebook, Instagram, TikTok, Threads.
- **Cổng thanh toán tự động**: VietQR (SePay / PayOS) — Gói Starter (0 VNĐ/tháng) và Gói Pro (590.000 VNĐ/tháng), hỗ trợ nạp thêm AI Credits không hết hạn.

---

## 2. Chi tiết ${sortedAllPosts.length} Bài phân tích Chuyên sâu theo 6 Cụm Chủ đề (Topic Clusters)

${BLOG_CATEGORIES.map((cat) => {
  const postsInCat = sortedAllPosts.filter((p) => p.category === cat.slug);
  const clusterMeta = CLUSTER_PILLAR_BY_CATEGORY[cat.slug];
  const entries = postsInCat
    .map((p) => {
      const takeaways = (p.keyTakeaways || [])
        .map((k) => `  - ${stripInlineMarkdownLinks(k)}`)
        .join("\n");
      const faqs = (p.faqs || [])
        .slice(0, 2)
        .map(
          (f) =>
            `  - Q: ${f.question}\n    A: ${stripInlineMarkdownLinks(f.answer)}`,
        )
        .join("\n");
      return `#### #${String(p.topicNumber).padStart(3, "0")}. ${p.title}
- URL: ${SITE_ORIGIN}/blog/${p.slug}
- Từ khóa chính: ${p.primaryKeyword}
- Vai trò mục tiêu: ${(p.targetRoles || []).join(", ")}
- Tóm tắt cốt lõi: ${stripInlineMarkdownLinks(p.geoSummary)}
- Luận điểm thực chiến:
${takeaways}${faqs ? `\n- Giải đáp nhanh:\n${faqs}` : ""}`;
    })
    .join("\n\n");

  return `### Cụm chủ đề: ${cat.name} (${postsInCat.length} bài)
- Chuyên mục: ${SITE_ORIGIN}/blog?category=${cat.slug}
- Phân hệ BrandHub kết nối: ${clusterMeta ? `${SITE_ORIGIN}${clusterMeta.featureHref} (${clusterMeta.featureLabel})` : `${SITE_ORIGIN}/`}

${entries}`;
}).join("\n\n---\n\n")}
`;

fs.writeFileSync(path.join(publicDir, "llms.txt"), llmsTxt, "utf8");
fs.writeFileSync(path.join(distDir, "llms.txt"), llmsTxt, "utf8");
fs.writeFileSync(path.join(publicDir, "llms-full.txt"), llmsFullTxt, "utf8");
fs.writeFileSync(path.join(distDir, "llms-full.txt"), llmsFullTxt, "utf8");

// 4. Generate static pre-rendered HTML for all public routes
for (const route of PUBLIC_ROUTES) {
  const escapedTitle = escapeHtml(route.title);
  const escapedDesc = escapeHtml(route.description);
  const ogType = route.ogType || "website";
  const ogImage = route.ogImage || `${SITE_ORIGIN}/og-banner.png`;
  const escapedOgImg = escapeHtml(ogImage);
  const escapedOgAlt = escapeHtml(
    route.ogImageAlt ||
      "BrandHub — Nền tảng Quản trị Thương hiệu & Xuất bản Nội dung Đa kênh AI",
  );
  const isCustomCover = Boolean(route.ogImage);
  const isBilingual = route.bilingual !== false;

  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="description" content="${escapedDesc}" />`,
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${route.canonicalUrl}" />`,
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="vi"\s+href="[^"]*"\s*\/>/,
      `<link rel="alternate" hreflang="vi" href="${route.canonicalUrl}" />`,
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/>\s*/,
      isBilingual
        ? `<link rel="alternate" hreflang="en" href="${route.canonicalUrl}?lang=en" />\n    `
        : "",
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/>/,
      `<link rel="alternate" hreflang="x-default" href="${route.canonicalUrl}" />`,
    )
    .replace(
      /<meta\s+property="og:locale:alternate"\s+content="en_US"\s*\/>\s*/,
      isBilingual ? `<meta property="og:locale:alternate" content="en_US" />\n    ` : "",
    )
    .replace(
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:type" content="${ogType}" />`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${route.canonicalUrl}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/>/,
      `<meta property="og:title" content="${escapedTitle}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta property="og:description" content="${escapedDesc}" />`,
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${escapedOgImg}" />`,
    )
    .replace(
      /<meta\s+property="og:image:secure_url"\s+content="[\s\S]*?"\s*\/>/,
      `<meta property="og:image:secure_url" content="${escapedOgImg}" />`,
    )
    .replace(
      /<meta\s+property="og:image:alt"\s+content="[\s\S]*?"\s*\/>/,
      `<meta property="og:image:alt" content="${escapedOgAlt}" />`,
    )
    .replace(
      /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:url" content="${route.canonicalUrl}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="twitter:title" content="${escapedTitle}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="twitter:description" content="${escapedDesc}" />`,
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${escapedOgImg}" />`,
    )
    .replace(
      /<meta\s+name="twitter:image:alt"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="twitter:image:alt" content="${escapedOgAlt}" />`,
    )
    .replace(
      /<div id="root"><\/div>/,
      `<div id="root"><div style="${SR_ONLY_STYLE}">${route.noscriptHtml}</div></div>`,
    )
    .replace(
      /<noscript>[\s\S]*?<\/noscript>/,
      `<noscript>${route.noscriptHtml}\n    </noscript>`,
    );

  if (route.keywords) {
    html = html.replace(
      /<meta\s+name="keywords"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="keywords" content="${escapeHtml(route.keywords)}" />`,
    );
  }

  if (route.authorName) {
    html = html.replace(
      /<meta\s+name="author"\s+content="[^"]*"\s*\/>/,
      `<meta name="author" content="${escapeHtml(route.authorName)} — BrandHub" />`,
    );
  }

  if (isCustomCover) {
    html = html
      .replace(
        /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/>/,
        `<meta property="og:image:type" content="image/jpeg" />`,
      )
      .replace(
        /<meta\s+property="og:image:width"\s+content="[^"]*"\s*\/>/,
        `<meta property="og:image:width" content="1200" />`,
      )
      .replace(
        /<meta\s+property="og:image:height"\s+content="[^"]*"\s*\/>/,
        `<meta property="og:image:height" content="800" />`,
      );
  }

  if (ogType === "article" && route.publishedAt) {
    const articleMetaTags = [
      `<meta property="article:published_time" content="${escapeHtml(route.publishedAt)}" />`,
      `<meta property="article:modified_time" content="${escapeHtml(route.updatedAt || route.publishedAt)}" />`,
      route.articleSection
        ? `<meta property="article:section" content="${escapeHtml(route.articleSection)}" />`
        : "",
    ]
      .filter(Boolean)
      .join("\n    ");
    html = html.replace(
      /(<meta property="og:type" content="article" \/>)/,
      `$1\n    ${articleMetaTags}`,
    );
  }

  if (route.pageJsonLd) {
    const pageJsonScript = `<script type="application/ld+json" id="brandhub-page-jsonld">${JSON.stringify(route.pageJsonLd)}</script>`;
    if (
      /<script\s+type="application\/ld\+json"\s+id="brandhub-page-jsonld">[\s\S]*?<\/script>/.test(
        html,
      )
    ) {
      html = html.replace(
        /<script\s+type="application\/ld\+json"\s+id="brandhub-page-jsonld">[\s\S]*?<\/script>/,
        pageJsonScript,
      );
    } else {
      html = html.replace(/<\/head>/, `    ${pageJsonScript}\n  </head>`);
    }
  }

  const targetDir = path.join(distDir, route.routePath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
}

console.log(
  `[prerender-public-routes] Pre-rendered ${1 + PUBLIC_ROUTES.length} static SEO pages (/, /blog, ${sortedAllPosts.length} blog articles, /help/faq, /privacy, /terms) + synced sitemap.xml, rss.xml, llms.txt & llms-full.txt.`,
);
