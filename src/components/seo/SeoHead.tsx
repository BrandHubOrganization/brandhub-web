import { useEffect } from "react";

export const SITE_ORIGIN = "https://brandhub.id.vn";
export const DEFAULT_TITLE =
  "BrandHub — Nền tảng Quản trị Thương hiệu & Nội dung Đa kênh AI";
export const DEFAULT_DESCRIPTION =
  "Nền tảng quản trị Agency, lập kế hoạch Media Campaign, sáng tạo với AI GraphRAG, duyệt bài đa cấp và đăng tự động Facebook, Instagram, TikTok, Threads.";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-banner.png`;

export interface SeoHeadProps {
  title?: string;
  description?: string;
  /** Path starting with `/` (e.g. `/privacy`) or full canonical URL */
  canonicalPath?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  /** Set true on private/auth/transactional pages so search engines do not index them */
  noindex?: boolean;
  /** Optional page-specific JSON-LD object */
  jsonLd?: Record<string, unknown> | null;
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

function syncHreflangLinks(href: string, noindex: boolean) {
  const langs = ["vi", "en", "x-default"] as const;
  if (noindex) {
    for (const lang of langs) {
      const existing = document.head.querySelector<HTMLLinkElement>(
        `link[rel="alternate"][hreflang="${lang}"]`,
      );
      if (existing) {
        existing.remove();
      }
    }
    return;
  }

  for (const lang of langs) {
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
  noindex = false,
  jsonLd = null,
}: SeoHeadProps) {
  useEffect(() => {
    const cleanTitle = title.includes("BrandHub")
      ? title
      : `${title} | BrandHub`;
    const canonicalUrl = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${SITE_ORIGIN}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
    const robotsValue = noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

    document.title = cleanTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robotsValue);
    upsertCanonical(canonicalUrl);
    syncHreflangLinks(canonicalUrl, noindex);

    // Open Graph synchronization (must agree with canonical, title, description)
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:title", cleanTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", ogImage);

    // Twitter card synchronization
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", cleanTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:url", canonicalUrl);
    upsertMeta("name", "twitter:image", ogImage);

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
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, canonicalPath, ogType, ogImage, noindex, jsonLd]);

  return null;
}

export default SeoHead;

