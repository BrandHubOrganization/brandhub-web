import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Bộ Kiểm Định Tự Động: Chuẩn SEO Google + 0% AI + Liên Kết Cụm Chủ Đề & Tính Năng Hệ Thống
 * Kiểm tra toàn bộ 100 bài viết trong BLOG_POSTS:
 * 1. Cấm tuyệt đối các cấu trúc câu máy móc của AI ("không chỉ... mà còn", "trong bối cảnh", "đóng vai trò...", dấu — trong văn xuôi...).
 * 2. Đo độ biến thiên độ dài câu (Sentence Burstiness CV = StdDev / Mean >= 0.36) và tỷ lệ câu ngắn tự nhiên (<= 12 từ >= 15%) để vượt qua QuillBot AI Detector với 0% AI.
 * 3. Kiểm tra chuẩn SEO On-Page & SERP (Meta Title <= 66 ký tự, Meta Description 115–166 ký tự, 4 relatedSlugs hợp lệ).
 * 4. Kiểm tra mạng lưới Internal Linking ngữ cảnh `[anchor](/path)` bên trong thân bài (>= 3 liên kết nội văn bản, gồm >= 2 bài viết `/blog/<slug>` và >= 1 phân hệ sản phẩm `/#...` hoặc `/register`, `/help/faq`) và 0 bài mồ côi (in-degree >= 2).
 * 5. Kiểm tra chuẩn 6 vai trò (Guest, Owner, Manager, Creator, Client, Admin), 4 nền tảng MXH và VietQR (SePay / PayOS).
 */

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

const blogDataUrl = pathToFileURL(
  path.resolve(import.meta.dirname, "../src/data/blogData.ts"),
).href;
const { BLOG_POSTS, BLOG_CATEGORIES } = await import(blogDataUrl);

const ALL_SLUGS = new Set(BLOG_POSTS.map((p) => p.slug));
const VALID_CATEGORIES = new Set(BLOG_CATEGORIES.map((c) => c.slug));
const VALID_PRODUCT_PATHS = new Set([
  "/",
  "/register",
  "/login",
  "/help/faq",
  "/privacy",
  "/terms",
  "/blog",
  "/#agency-workspace",
  "/#features",
  "/#ai-features",
  "/#how-it-works",
  "/#templates",
  "/#media-package",
  "/#comparison",
  "/#pricing",
  "/#testimonials",
  "/#faq",
  "/#insights",
  "/#blog-insights",
]);

const BANNED_AI_PATTERNS = [
  { regex: /không chỉ\s+[^.?!]{1,80}\s+mà còn/i, label: "Cấu trúc AI 'không chỉ... mà còn'" },
  { regex: /trong bối cảnh/i, label: "Cụm từ sáo rỗng AI 'trong bối cảnh'" },
  { regex: /trong kỷ nguyên/i, label: "Cụm từ sáo rỗng AI 'trong kỷ nguyên'" },
  { regex: /trong thời đại số/i, label: "Cụm từ sáo rỗng AI 'trong thời đại số'" },
  { regex: /đóng vai trò (then chốt|vô cùng|quan trọng|cốt lõi)/i, label: "Cụm từ AI 'đóng vai trò...'" },
  { regex: /chìa khóa (thành công|vàng|then chốt)/i, label: "Cụm từ AI 'chìa khóa thành công'" },
  { regex: /kim chỉ nam/i, label: "Cụm từ AI 'kim chỉ nam'" },
  { regex: /hãy cùng (khám phá|tìm hiểu|điểm qua)/i, label: "Lời dẫn AI 'hãy cùng khám phá/tìm hiểu'" },
  { regex: /có thể khẳng định rằng/i, label: "Cụm từ AI 'có thể khẳng định rằng'" },
  { regex: /không thể phủ nhận/i, label: "Cụm từ AI 'không thể phủ nhận'" },
  { regex: /hơn thế nữa,/i, label: "Từ nối dịch máy 'Hơn thế nữa,'" },
  { regex: /bên cạnh đó,/i, label: "Từ nối lặp của AI 'Bên cạnh đó,'" },
  { regex: /đáng chú ý hơn,/i, label: "Từ nối AI 'Đáng chú ý hơn,'" },
  { regex: /nhìn chung,/i, label: "Từ kết AI 'Nhìn chung,'" },
  { regex: /tóm lại,/i, label: "Từ kết AI 'Tóm lại,'" },
  { regex: /giải pháp đột phá/i, label: "Từ tâng bốc AI 'giải pháp đột phá'" },
  { regex: /bước ngoặt đột phá/i, label: "Từ tâng bốc AI 'bước ngoặt đột phá'" },
  { regex: /mang lại hiệu quả vượt trội/i, label: "Từ tâng bốc AI 'mang lại hiệu quả vượt trội'" },
  { regex: /—/, label: "Dấu gạch ngang dài (em-dash —) đặc trưng của AI" },
];

const BANNED_LEGACY_ROLES = [
  { regex: /Agency Owner/i, label: "Legacy role 'Agency Owner' (phải dùng Owner)" },
  { regex: /Workspace Manager/i, label: "Legacy role 'Workspace Manager' (phải dùng Manager)" },
  { regex: /Account Manager/i, label: "Legacy role 'Account Manager' (phải dùng Manager)" },
  { regex: /Content Creator/, label: "Legacy role 'Content Creator' (phải dùng Creator)" },
  { regex: /Brand Client/i, label: "Legacy role 'Brand Client' (phải dùng Client)" },
  { regex: /System Administrator|System Admin/i, label: "Legacy role 'System Administrator' (phải dùng Admin)" },
  { regex: /Zalo\s*OA/i, label: "Tính năng ngoài phạm vi 'Zalo OA'" },
  { regex: /VNPay|\bStripe\b/i, label: "Cổng thanh toán ngoài phạm vi 'VNPay/Stripe'" },
  { regex: /livestream/i, label: "Tính năng ngoài phạm vi 'Livestream'" },
  { regex: /\bFR-\d/i, label: "Mã đồ án 'FR-x.x.x'" },
];

const INLINE_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

function stripMarkdownLinks(text) {
  return String(text || "").replace(INLINE_LINK_REGEX, "$1");
}

function extractInlineLinksFromStrings(strings) {
  const links = [];
  for (const raw of strings) {
    if (!raw) continue;
    let match;
    INLINE_LINK_REGEX.lastIndex = 0;
    while ((match = INLINE_LINK_REGEX.exec(raw)) !== null) {
      links.push({ anchor: match[1].trim(), href: match[2].trim() });
    }
  }
  return links;
}

function isValidInternalHref(href, selfSlug) {
  if (VALID_PRODUCT_PATHS.has(href)) {
    return { ok: true, kind: href === "/blog" ? "blog-hub" : "product" };
  }
  if (href.startsWith("/blog?category=")) {
    const cat = href.slice("/blog?category=".length);
    return VALID_CATEGORIES.has(cat)
      ? { ok: true, kind: "category" }
      : { ok: false, reason: `Category slug không tồn tại: ${href}` };
  }
  if (href.startsWith("/blog/")) {
    const targetSlug = href.slice("/blog/".length).split(/[?#]/)[0];
    if (targetSlug === selfSlug) {
      return { ok: false, reason: `Tự trỏ link vào chính bài hiện tại: ${href}` };
    }
    if (!ALL_SLUGS.has(targetSlug)) {
      return { ok: false, reason: `Slug bài viết không tồn tại: ${href}` };
    }
    return { ok: true, kind: "article", targetSlug };
  }
  return { ok: false, reason: `Đường dẫn nội bộ không hợp lệ: ${href}` };
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

function countWords(sentence) {
  return sentence.split(/\s+/).filter(Boolean).length;
}

function computeBurstiness(text) {
  const sentences = splitSentences(text);
  if (sentences.length < 4) {
    return { cv: 0, shortRatio: 0, sentenceCount: sentences.length, mean: 0 };
  }
  const lengths = sentences.map(countWords);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) /
    lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0;
  const shortCount = lengths.filter((l) => l <= 12).length;
  const shortRatio = shortCount / lengths.length;
  return {
    cv: Number(cv.toFixed(2)),
    shortRatio: Number((shortRatio * 100).toFixed(1)),
    sentenceCount: sentences.length,
    mean: Number(mean.toFixed(1)),
  };
}

function extractSectionStrings(post) {
  return post.sections.flatMap((sec) => [
    ...sec.paragraphs,
    ...(sec.subheadings ? sec.subheadings.map((s) => s.body) : []),
    ...(sec.checklist || []),
    ...(sec.callout ? [sec.callout.text] : []),
  ]);
}

function extractPostProse(post) {
  const parts = [
    post.geoSummary,
    ...(post.keyTakeaways || []),
    ...extractSectionStrings(post),
    ...post.faqs.flatMap((f) => [f.question, f.answer]),
  ];
  return stripMarkdownLinks(parts.join(" "));
}

const topicsArg = process.argv.find((a) => a.startsWith("--topics="));
const topicFilter = topicsArg
  ? new Set(
      topicsArg
        .slice("--topics=".length)
        .split(",")
        .map((n) => Number(n.trim()))
        .filter(Boolean),
    )
  : null;

const sortedPosts = [...BLOG_POSTS]
  .filter((p) => !topicFilter || topicFilter.has(p.topicNumber))
  .sort((a, b) => a.topicNumber - b.topicNumber);

console.log(`=== KIỂM ĐỊNH CHẤT LƯỢNG SEO, INTERLINKING & 0% AI (QUILLBOT HUMANIZER) ===`);
console.log(`Tổng số bài viết đang kiểm định: ${sortedPosts.length}\n`);

let totalErrors = 0;
let failedPosts = 0;
let totalInlineLinks = 0;

const inboundCount = new Map();
for (const p of BLOG_POSTS) {
  inboundCount.set(p.slug, 0);
}
for (const p of BLOG_POSTS) {
  const seenTargets = new Set();
  for (const rel of p.relatedSlugs || []) {
    if (ALL_SLUGS.has(rel) && rel !== p.slug) seenTargets.add(rel);
  }
  const inlineLinks = extractInlineLinksFromStrings([
    p.geoSummary,
    ...(p.keyTakeaways || []),
    ...extractSectionStrings(p),
    ...p.faqs.map((f) => f.answer),
  ]);
  for (const lk of inlineLinks) {
    const check = isValidInternalHref(lk.href, p.slug);
    if (check.ok && check.kind === "article") {
      seenTargets.add(check.targetSlug);
    }
  }
  for (const target of seenTargets) {
    inboundCount.set(target, (inboundCount.get(target) || 0) + 1);
  }
}

for (const post of sortedPosts) {
  const combinedProse = extractPostProse(post);
  const postErrors = [];

  for (const pat of BANNED_AI_PATTERNS) {
    if (pat.regex.test(combinedProse)) {
      postErrors.push(`[AI Cliché] Phát hiện ${pat.label}`);
    }
  }

  for (const pat of BANNED_LEGACY_ROLES) {
    if (pat.regex.test(combinedProse) || pat.regex.test(post.title) || pat.regex.test(post.metaTitle) || pat.regex.test(post.metaDescription)) {
      postErrors.push(`[Rule Violation] Phát hiện ${pat.label}`);
    }
  }

  if (!post.metaTitle || post.metaTitle.length < 25 || post.metaTitle.length > 66) {
    postErrors.push(
      `[Meta Title] Độ dài metaTitle=${post.metaTitle?.length || 0} ký tự (cần 25–66 ký tự): "${post.metaTitle}"`,
    );
  }

  if (!post.metaDescription || post.metaDescription.length < 115 || post.metaDescription.length > 166) {
    postErrors.push(
      `[Meta Description] Độ dài metaDescription=${post.metaDescription?.length || 0} ký tự (cần 115–166 ký tự).`,
    );
  }

  // Hashtag validation
  const tags = post.hashtags || [];
  const uniqueTags = new Set(tags);
  if (tags.length < 5 || tags.length > 8 || uniqueTags.size !== tags.length) {
    postErrors.push(
      `[Hashtags] Cần 5–8 hashtags phân biệt (hiện có ${tags.length}).`,
    );
  }
  if (!tags.includes("#BrandHub")) {
    postErrors.push(`[Hashtags] Thiếu hashtag thương hiệu bắt buộc "#BrandHub".`);
  }
  for (const tag of tags) {
    if (!/^#[A-Za-z0-9_]{3,36}$/.test(tag)) {
      postErrors.push(
        `[Hashtags] Hashtag không hợp lệ (chứa khoảng trắng hoặc ký tự đặc biệt): "${tag}"`,
      );
    }
  }

  // GEO summary word count validation (130-170 words)
  const geoWords = countWords(stripMarkdownLinks(post.geoSummary || ""));
  if (geoWords < 130 || geoWords > 175) {
    postErrors.push(
      `[GEO Summary] Độ dài geoSummary=${geoWords} từ (cần 130–175 từ).`,
    );
  }

  // Total article word count & structural completeness validation
  const fullParts = [
    post.title,
    post.metaDescription,
    post.geoSummary,
    ...(post.keyTakeaways || []),
  ];
  let totalSubheadings = 0;
  let totalChecklist = 0;
  let hasTable = false;
  let hasCallout = false;
  let hasInlineCta = false;
  for (const sec of post.sections || []) {
    fullParts.push(sec.heading, ...(sec.paragraphs || []));
    if (!sec.paragraphs || sec.paragraphs.length < 2) {
      postErrors.push(
        `[Structure] Section "${sec.id}" có ít hơn 2 đoạn văn (${sec.paragraphs?.length || 0}).`,
      );
    }
    if (sec.subheadings) {
      totalSubheadings += sec.subheadings.length;
      for (const sub of sec.subheadings) fullParts.push(sub.title, sub.body);
    }
    if (sec.checklist) {
      totalChecklist += sec.checklist.length;
      fullParts.push(...sec.checklist);
    }
    if (sec.comparisonTable) {
      hasTable = true;
      fullParts.push(
        sec.comparisonTable.caption,
        ...sec.comparisonTable.headers,
      );
      for (const r of sec.comparisonTable.rows) fullParts.push(...r);
    }
    if (sec.callout) {
      hasCallout = true;
      fullParts.push(sec.callout.label, sec.callout.text);
    }
    if (sec.inlineCta) {
      hasInlineCta = true;
      fullParts.push(sec.inlineCta.title, sec.inlineCta.description);
    }
  }
  for (const f of post.faqs || []) fullParts.push(f.question, f.answer);

  const totalWordCount = countWords(stripMarkdownLinks(fullParts.join(" ")));
  if (totalWordCount < 1450) {
    postErrors.push(
      `[Word Count] Tổng số từ=${totalWordCount} từ (cần >= 1450 từ).`,
    );
  }
  if (totalSubheadings < 3) {
    postErrors.push(
      `[Structure] Tổng số subheadings=${totalSubheadings} (cần >= 3).`,
    );
  }
  if (!hasTable) {
    postErrors.push(`[Structure] Thiếu bảng đối chiếu comparisonTable.`);
  }
  if (totalChecklist < 4) {
    postErrors.push(
      `[Structure] Tổng số mục checklist=${totalChecklist} (cần >= 4).`,
    );
  }
  if (!hasCallout) {
    postErrors.push(`[Structure] Thiếu hộp ghi chú callout.`);
  }
  if (!hasInlineCta) {
    postErrors.push(`[Structure] Thiếu khối chuyển đổi inlineCta.`);
  }
  if (!post.faqs || post.faqs.length < 3) {
    postErrors.push(
      `[Structure] Số lượng FAQs=${post.faqs?.length || 0} (cần >= 3).`,
    );
  }

  const relSlugs = post.relatedSlugs || [];
  const uniqueRel = new Set(relSlugs);
  if (relSlugs.length < 4 || uniqueRel.size !== relSlugs.length) {
    postErrors.push(
      `[Related Slugs] Cần tối thiểu 4 relatedSlugs phân biệt (hiện có ${relSlugs.length}).`,
    );
  }
  for (const rs of relSlugs) {
    if (rs === post.slug || !ALL_SLUGS.has(rs)) {
      postErrors.push(`[Related Slugs] Slug không hợp lệ hoặc tự trỏ: "${rs}"`);
    }
  }

  const allLinkableStrings = [
    post.geoSummary,
    ...(post.keyTakeaways || []),
    ...extractSectionStrings(post),
    ...post.faqs.map((f) => f.answer),
  ];
  const inlineLinks = extractInlineLinksFromStrings(allLinkableStrings);
  totalInlineLinks += inlineLinks.length;

  let articleLinkCount = 0;
  let productLinkCount = 0;
  for (const lk of inlineLinks) {
    if (lk.anchor.length < 4) {
      postErrors.push(`[Anchor Text] Anchor quá ngắn (<4 ký tự): "[${lk.anchor}](${lk.href})"`);
    }
    const check = isValidInternalHref(lk.href, post.slug);
    if (!check.ok) {
      postErrors.push(`[Broken Inline Link] ${check.reason} trong "[${lk.anchor}](${lk.href})"`);
    } else if (check.kind === "article") {
      articleLinkCount++;
    } else if (check.kind === "product") {
      productLinkCount++;
    }
  }

  if (inlineLinks.length < 3) {
    postErrors.push(
      `[Missing Inline Links] Bài viết mới có ${inlineLinks.length} inline link [anchor](/path) (cần >= 3).`,
    );
  }
  if (articleLinkCount < 2) {
    postErrors.push(
      `[Low Article Interlink] Bài viết mới có ${articleLinkCount} inline link trỏ sang bài /blog/<slug> khác (cần >= 2).`,
    );
  }
  if (productLinkCount < 1) {
    postErrors.push(
      `[Missing Feature Bridge Link] Bài viết chưa có inline link trỏ về phân hệ hệ thống (/#..., /register, /help/faq).`,
    );
  }

  const stats = computeBurstiness(combinedProse);
  if (stats.cv < 0.36) {
    postErrors.push(
      `[Low Burstiness] Độ biến thiên câu CV=${stats.cv} (< 0.36).`,
    );
  }
  if (stats.shortRatio < 15) {
    postErrors.push(
      `[Uniform Sentences] Tỷ lệ câu ngắn <=12 từ mới đạt ${stats.shortRatio}% (< 15%).`,
    );
  }

  if (postErrors.length > 0) {
    failedPosts++;
    totalErrors += postErrors.length;
    console.error(
      `❌ Bài #${String(post.topicNumber).padStart(3, "0")} (${post.slug}): ${postErrors.length} lỗi | CV=${stats.cv} | Short=${stats.shortRatio}% | InlineLinks=${inlineLinks.length}`,
    );
    postErrors.forEach((e) => console.error(`   - ${e}`));
  } else {
    console.log(
      `✅ Bài #${String(post.topicNumber).padStart(3, "0")} (${post.slug}) | Câu: ${stats.sentenceCount} | CV: ${stats.cv} | Short: ${stats.shortRatio}% | Links: ${inlineLinks.length} (${articleLinkCount} bài + ${productLinkCount} tính năng)`,
    );
  }
}

if (!topicFilter) {
  const orphans = BLOG_POSTS.filter((p) => (inboundCount.get(p.slug) || 0) < 2);
  if (orphans.length > 0) {
    totalErrors += orphans.length;
    console.error(`\n❌ Phát hiện ${orphans.length} bài viết có ít hơn 2 liên kết trỏ tới (in-degree < 2):`);
    for (const o of orphans) {
      console.error(`   - #${o.topicNumber} ${o.slug} (in-degree=${inboundCount.get(o.slug) || 0})`);
    }
  } else {
    const counts = [...inboundCount.values()];
    console.log(
      `\n🔗 ĐỒ THỊ TOPIC CLUSTER: 0 bài mồ côi! Toàn bộ 100/100 bài đạt in-degree từ ${Math.min(...counts)} đến ${Math.max(...counts)} (tổng ${totalInlineLinks} liên kết ngữ cảnh nội văn bản).`,
    );
  }
}

console.log("\n=============================================================");
if (totalErrors > 0) {
  console.error(
    `KẾT QUẢ: Phát hiện ${totalErrors} điểm trên ${failedPosts}/${sortedPosts.length} bài cần hoàn thiện.`,
  );
  process.exit(1);
} else {
  console.log(
    `KẾT QUẢ: 100% bài viết (${sortedPosts.length}/${sortedPosts.length} bài) ĐẠT CHUẨN 0% AI, INTERLINKING CỤM CHỦ ĐỀ & LIÊN KẾT TÍNH NĂNG HỆ THỐNG!`,
  );
}
