import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const PRODUCT_LINKS = [
  { id: "features", labelKey: "landing.footer.productLinks.features" },
  { id: "how-it-works", labelKey: "landing.footer.productLinks.howItWorks" },
  { id: "templates", labelKey: "landing.footer.productLinks.templates" },
  { id: "pricing", labelKey: "landing.footer.productLinks.pricing" },
];

export function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const scrollToLandingSection = (id: string) => {
    if (!isHomePage) {
      navigate(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-zinc-200/80 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <BrandLogo size="md" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {t("landing.footer.tagline")}
            </p>
            <a
              href={`mailto:${t("landing.footer.email")}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
            >
              <Mail className="size-3.5" />
              {t("landing.footer.email")}
            </a>
          </div>

          {/* Product — link tới section thật trên landing */}
          <div>
            <h4 className="mb-4 text-xs font-semibold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
              {t("landing.footer.columns.product")}
            </h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={isHomePage ? `#${link.id}` : `/#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToLandingSection(link.id);
                    }}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources — Đã có trang thật cho Trung tâm trợ giúp & Hướng dẫn */}
          <div>
            <h4 className="mb-4 text-xs font-semibold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
              {t("landing.footer.columns.resources")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/help/faq"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange font-medium"
                >
                  Trung tâm trợ giúp (FAQ)
                </Link>
              </li>
              <li>
                <a
                  href={isHomePage ? "#how-it-works" : "/#how-it-works"}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToLandingSection("how-it-works");
                  }}
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange font-medium"
                >
                  Cẩm nang quy trình
                </a>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange font-medium"
                >
                  <span>Blog &amp; 100 Chủ đề SEO</span>
                  <span className="rounded bg-brand-orange/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-orange">
                    100 bài
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  Quản trị dự án như Jira / Notion
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  Luồng phê duyệt 3 cấp
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  Cẩm nang Gói Truyền thông
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  AI GraphRAG &amp; Brand Voice
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  Lịch đăng tự động 4 MXH
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  So sánh Công cụ &amp; Tối ưu Chi phí
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-xs font-semibold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
              {t("landing.footer.columns.company")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={isHomePage ? "#ai-features" : "/#ai-features"}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToLandingSection("ai-features");
                  }}
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  Kiến trúc AI &amp; Hệ thống
                </a>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-zinc-600 transition-colors hover:text-brand-orange dark:text-zinc-400 dark:hover:text-brand-orange"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 text-center sm:flex-row sm:text-left dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {t("landing.footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs">
            <Link
              to="/blog"
              className="text-zinc-500 transition-colors hover:text-brand-orange dark:text-zinc-400"
            >
              Blog &amp; Cẩm nang
            </Link>
            <a
              href="/rss.xml"
              className="text-zinc-500 transition-colors hover:text-brand-orange dark:text-zinc-400"
            >
              RSS Feed
            </a>
            <a
              href="/sitemap.xml"
              className="text-zinc-500 transition-colors hover:text-brand-orange dark:text-zinc-400"
            >
              Sitemap
            </a>
            <Link
              to="/privacy"
              className="text-zinc-500 transition-colors hover:text-brand-orange dark:text-zinc-400"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-zinc-500 transition-colors hover:text-brand-orange dark:text-zinc-400"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
