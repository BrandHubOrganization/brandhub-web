import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  Hash,
  Link2,
  ListOrdered,
  Rocket,
  Sparkles,
  Tag,
} from "lucide-react";
import type { BlogCategorySlug, BlogSection } from "@/data/blogTypes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlogSidebarProps {
  sections: BlogSection[];
  hasFaqs: boolean;
  primaryKeyword: string;
  secondaryKeywords: string[];
  hashtags: string[];
  category: BlogCategorySlug;
}

export function BlogSidebar({
  sections,
  hasFaqs,
  primaryKeyword,
  secondaryKeywords,
  hashtags,
  category,
}: BlogSidebarProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ids = [
      ...sections.map((s) => s.id),
      ...(hasFaqs ? ["faq-section"] : []),
    ];
    if (ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-18% 0px -65% 0px",
        threshold: 0.05,
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections, hasFaqs]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore if clipboard blocked
    }
  };

  const allKeywords = [primaryKeyword, ...secondaryKeywords.slice(0, 4)];

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-4">
      {/* Interactive Table of Contents + Integrated Keywords */}
      <nav
        aria-label="Mục lục bài viết"
        className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900"
      >
        {sections.length > 0 && (
          <>
            <div className="mb-3.5 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-zinc-900 uppercase dark:text-zinc-100">
                <ListOrdered className="size-4 text-brand-orange" />
                Mục lục bài viết
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Sao chép liên kết bài viết"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand-orange dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Link2 className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  title="Cuộn lên đầu bài"
                  className="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand-orange dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <ArrowUp className="size-3.5" />
                </button>
              </div>
            </div>

            <ul className="space-y-1">
              {sections.map((sec, idx) => {
                const isActive = activeId === sec.id;
                return (
                  <li key={sec.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs leading-snug transition-colors",
                        isActive
                          ? "bg-orange-50/90 font-bold text-brand-orange dark:bg-orange-500/15 dark:text-orange-300"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200",
                      )}
                    >
                      <span className="tabular-nums mt-0.5 shrink-0 font-mono text-[10px] opacity-75">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="line-clamp-2">{sec.heading}</span>
                    </button>
                  </li>
                );
              })}
              {hasFaqs && (
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection("faq-section")}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs leading-snug transition-colors",
                      activeId === "faq-section"
                        ? "bg-orange-50/90 font-bold text-brand-orange dark:bg-orange-500/15 dark:text-orange-300"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200",
                    )}
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-[10px] opacity-75">
                      FAQ
                    </span>
                    <span>Câu hỏi thường gặp</span>
                  </button>
                </li>
              )}
            </ul>
          </>
        )}

        <div
          className={cn(
            "space-y-3",
            sections.length > 0 &&
              "mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800",
          )}
        >
          {hashtags.length > 0 && (
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
                <Hash className="size-3.5 text-brand-orange" />
                Thẻ Hashtag
              </p>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?q=${encodeURIComponent(tag)}`}
                    className="rounded-md border border-orange-200/80 bg-orange-50/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-orange transition-colors hover:border-brand-orange hover:bg-orange-100/80 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
              <Tag className="size-3.5 text-brand-orange" />
              Từ khóa chủ đề
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allKeywords.map((kw) => (
                <Link
                  key={kw}
                  to={`/blog?q=${encodeURIComponent(kw)}`}
                  className="rounded-md border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:border-brand-orange/40 hover:text-brand-orange dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-300"
                >
                  {kw}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Restrained BrandHub Sidebar CTA Card */}
      <div className="bh-spotlight-card space-y-4 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <Sparkles className="size-3 text-brand-orange" />
          Áp dụng ngay vào quy trình
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold leading-snug text-zinc-900 dark:text-zinc-50">
            Trải nghiệm Workspace BrandHub Miễn phí
          </h3>
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            Khởi tạo Workspace cho thương hiệu khách hàng, bật AI Studio
            GraphRAG và xuất bản đồng loạt lên 4 nền tảng xã hội.
          </p>
        </div>

        <div className="space-y-2">
          <Link to="/register" className="block">
            <Button className="bg-brand-orange hover:bg-brand-orange/90 h-10 w-full cursor-pointer rounded-xl text-xs font-semibold text-white shadow-sm">
              <Rocket className="mr-1.5 size-3.5" />
              Dùng thử Miễn phí
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </Link>
          <Link to={`/blog?category=${category}`} className="block">
            <Button
              variant="outline"
              className="h-9 w-full cursor-pointer rounded-xl border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:border-brand-orange/40 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <BookOpen className="mr-1.5 size-3.5" />
              Xem thêm cùng chủ đề
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default BlogSidebar;
