import { useEffect } from "react";

export const SITE_ORIGIN = "https://brandhub.id.vn";
export const DEFAULT_TITLE =
  "BrandHub — Nền tảng Quản trị Thương hiệu & Nội dung Đa kênh AI";
export const DEFAULT_DESCRIPTION =
  "Nền tảng quản trị Agency, lập kế hoạch Media Campaign, sáng tạo với AI GraphRAG, duyệt bài đa cấp và đăng tự động Facebook, Instagram, TikTok, Threads.";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-banner.png`;
export const DEFAULT_OG_IMAGE_ALT =
  "BrandHub — Nền tảng Quản trị Thương hiệu & Xuất bản Nội dung Đa kênh AI";

export interface SeoHeadProps {
  title?: string;
  description?: string;
  /** Path starting with `/` (e.g. `/privacy`) or full canonical URL */
  canonicalPath?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  /** Optional comma-separated SEO keywords */
  keywords?: string;
  /** Optional ISO date strings & section for `og:type="article"` */
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  authorName?: string;
  /** Set true on private/auth/transactional pages so search engines do not index them */
  noindex?: boolean;
  /** Whether this page has an active English translation via `?lang=en` (default true; false on Vietnamese-only blog routes) */
  bilingual?: boolean;
  /** Optional page-specific JSON-LD object or array of objects */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null;
}

function upsertMeta(
  attrName: "name" | "property",
  attrValue: string,
  content: string,
) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attrName}="${attrValue}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attrName: "name" | "property", attrValue: string) {
  const el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attrName}="${attrValue}"]`,
  );
  if (el) {
    el.remove();
  }
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function syncHreflangLinks(
  baseHref: string,
  noindex: boolean,
  bilingual: boolean,
) {
  const allLangs = ["vi", "en", "x-default"] as const;
  if (noindex) {
    for (const lang of allLangs) {
      const existing = document.head.querySelector<HTMLLinkElement>(
        `link[rel="alternate"][hreflang="${lang}"]`,
      );
      if (existing) {
        existing.remove();
      }
    }
    return;
  }

  const activeLangs = bilingual
    ? ([
        { lang: "vi", href: baseHref },
        { lang: "en", href: `${baseHref}?lang=en` },
        { lang: "x-default", href: baseHref },
      ] as const)
    : ([
        { lang: "vi", href: baseHref },
        { lang: "x-default", href: baseHref },
      ] as const);

  if (!bilingual) {
    const staleEn = document.head.querySelector<HTMLLinkElement>(
      'link[rel="alternate"][hreflang="en"]',
    );
    if (staleEn) {
      staleEn.remove();
    }
  }

  for (const { lang, href } of activeLangs) {
    let link = document.head.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${lang}"]`,
    );
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", lang);
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }
}

export function SeoHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = "/",
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  keywords,
  publishedTime,
  modifiedTime,
  articleSection,
  authorName,
  noindex = false,
  bilingual = true,
  jsonLd = null,
}: SeoHeadProps) {
  useEffect(() => {
    const cleanTitle = title.includes("BrandHub")
      ? title
      : `${title} | BrandHub`;
    const baseCanonicalUrl = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${SITE_ORIGIN}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
    const isUrlLangEn =
      bilingual &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("lang") === "en";
    const canonicalUrl =
      !noindex && isUrlLangEn
        ? `${baseCanonicalUrl}?lang=en`
        : baseCanonicalUrl;
    const robotsValue = noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

    document.documentElement.dataset.seoManaged = "true";
    document.title = cleanTitle;

    upsertMeta("name", "description", description);
    if (keywords) {
      upsertMeta("name", "keywords", keywords);
    }
    if (authorName) {
      upsertMeta("name", "author", authorName);
    }
    upsertMeta("name", "robots", robotsValue);
    upsertCanonical(canonicalUrl);
    syncHreflangLinks(baseCanonicalUrl, noindex, bilingual);

    // Open Graph synchronization (must agree with canonical, title, description)
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:locale", isUrlLangEn ? "en_US" : "vi_VN");
    upsertMeta("property", "og:title", cleanTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:image:secure_url", ogImage);
    upsertMeta("property", "og:image:alt", ogImageAlt);

    if (ogType === "article") {
      if (publishedTime) {
        upsertMeta("property", "article:published_time", publishedTime);
      }
      if (modifiedTime) {
        upsertMeta("property", "article:modified_time", modifiedTime);
      }
      if (articleSection) {
        upsertMeta("property", "article:section", articleSection);
      }
    } else {
      removeMeta("property", "article:published_time");
      removeMeta("property", "article:modified_time");
      removeMeta("property", "article:section");
    }

    // Twitter card synchronization
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", cleanTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:url", canonicalUrl);
    upsertMeta("name", "twitter:image", ogImage);
    upsertMeta("name", "twitter:image:alt", ogImageAlt);

    const scriptId = "brandhub-page-jsonld";
    let scriptEl = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = scriptId;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      delete document.documentElement.dataset.seoManaged;
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [
    title,
    description,
    canonicalPath,
    ogType,
    ogImage,
    ogImageAlt,
    keywords,
    publishedTime,
    modifiedTime,
    articleSection,
    authorName,
    noindex,
    bilingual,
    jsonLd,
  ]);

  return null;
}

export default SeoHead;
