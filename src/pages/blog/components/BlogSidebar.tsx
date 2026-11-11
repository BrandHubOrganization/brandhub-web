import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Layers, ArrowRight, Rocket, LogIn, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlogCategorySlug, BlogSection } from "@/data/blogTypes";

interface BlogSidebarProps {
  sections: BlogSection[];
  hasFaqs: boolean;
  primaryKeyword: string;
  secondaryKeywords: string[];
  category?: BlogCategorySlug;
}

const SIDEBAR_MODULES: {
  href: string;
  label: string;
  matchCategories: BlogCategorySlug[];
}[] = [
  {
    href: "/#agency-workspace",
    label: "1. Đa Workspace & Phân quyền 6 Vai trò",
    matchCategories: ["agency-project-management"],
  },
  {
    href: "/#how-it-works",
    label: "2. Quy trình Duyệt 3 Cấp & Khóa Bản nháp",
    matchCategories: ["content-workflow-approval"],
  },
  {
    href: "/#media-package",
    label: "3. Gói Truyền thông & Báo giá Chiến dịch",
    matchCategories: ["media-package-campaign"],
  },
  {
    href: "/#ai-features",
    label: "4. AI Studio GraphRAG & Bắt Trend",
    matchCategories: ["ai-studio-graphrag-trends"],
  },
  {
    href: "/#features",
    label: "5. Lịch Xuất bản 4 Kênh MXH Tự động",
    matchCategories: ["multi-channel-publishing"],
  },
  {
    href: "/#pricing",
    label: "6. Bảng giá Starter (0đ) & VietQR",
    matchCategories: ["tool-comparison-case-study"],
  },
];

export function BlogSidebar({
  sections,
  hasFaqs,
  primaryKeyword,
  secondaryKeywords,
  category,
}: BlogSidebarProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [readProgress, setReadProgress] = useState<number>(0);

  useEffect(() => {
    setActiveId(sections[0]?.id ?? "");
    const anchorIds: string[] = [];
    sections.forEach((sec) => {
      anchorIds.push(sec.id);
      sec.subheadings?.forEach((_, sIdx) => {
        anchorIds.push(`${sec.id}-sub-${sIdx + 1}`);
      });
    });
    if (hasFaqs) {
      anchorIds.push("cau-hoi-thuong-gap");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: [0, 0.25, 0.6] },
    );

    anchorIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadProgress(100);
        return;
      }
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
      setReadProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections, hasFaqs]);

  return (
    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
      {/* Multi-level Table of Contents (H2 + H3) */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-foreground uppercase tracking-wider">
            <BookOpen className="size-4 text-brand-orange" />
            <span>Mục lục bài viết</span>
          </div>
          <span className="text-[11px] font-bold text-brand-orange tabular-nums">
            {readProgress}%
          </span>
        </div>

        {/* Reading Progress Bar */}
        <div
          className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={readProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tiến độ đọc bài viết"
        >
          <div
            className="h-full bg-gradient-to-r from-brand-orange to-amber-500 transition-all duration-200"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        <nav
          aria-label="Mục lục chi tiết bài viết"
          className="space-y-1.5 text-xs sm:text-sm max-h-[52vh] overflow-y-auto pr-1"
        >
          {sections.map((sec, idx) => {
            const isSectionActive =
              activeId === sec.id || activeId.startsWith(`${sec.id}-sub-`);
            return (
              <div key={sec.id} className="space-y-1">
                <a
                  href={`#${sec.id}`}
                  className={`block py-1.5 px-2.5 rounded-lg transition-colors leading-snug ${
                    isSectionActive
                      ? "bg-brand-orange/10 text-brand-orange font-bold border-l-2 border-brand-orange"
                      : "text-muted-foreground hover:text-brand-orange hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`font-semibold mr-1.5 ${
                      isSectionActive ? "text-brand-orange" : "text-foreground"
                    }`}
                  >
                    {idx + 1}.
                  </span>
                  {sec.heading}
                </a>

                {sec.subheadings && sec.subheadings.length > 0 && (
                  <div className="pl-4 ml-2.5 border-l border-border/70 space-y-0.5">
                    {sec.subheadings.map((sub, sIdx) => {
                      const subId = `${sec.id}-sub-${sIdx + 1}`;
                      const isSubActive = activeId === subId;
                      const cleanSubTitle = sub.title.replace(/^\d+\.\s*/, "");
                      return (
                        <a
                          key={subId}
                          href={`#${subId}`}
                          className={`block py-1 px-2 rounded-md text-[11.5px] leading-snug transition-colors ${
                            isSubActive
                              ? "text-brand-orange font-semibold bg-brand-orange/5"
                              : "text-muted-foreground/90 hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <span className="font-mono text-[10.5px] opacity-75 mr-1">
                            {idx + 1}.{sIdx + 1}
                          </span>
                          {cleanSubTitle}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {hasFaqs && (
            <a
              href="#cau-hoi-thuong-gap"
              className={`block py-1.5 px-2.5 rounded-lg transition-colors font-medium ${
                activeId === "cau-hoi-thuong-gap"
                  ? "bg-brand-orange/10 text-brand-orange font-bold border-l-2 border-brand-orange"
                  : "text-muted-foreground hover:text-brand-orange hover:bg-muted/50"
              }`}
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
          Quản trị truyền thông như Jira/Notion &amp; Xuất bản 4 kênh tự động
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Dùng thử miễn phí gói Starter hoặc khám phá ngay các phân hệ cốt lõi:
        </p>

        <div className="space-y-1.5 text-xs">
          {SIDEBAR_MODULES.map((mod) => {
            const isActiveModule =
              category !== undefined && mod.matchCategories.includes(category);
            return (
              <Link
                key={mod.href}
                to={mod.href}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-colors font-semibold ${
                  isActiveModule
                    ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/35"
                    : "bg-muted/50 hover:bg-brand-orange/10 hover:text-brand-orange"
                }`}
              >
                <span>{mod.label}</span>
                <ArrowRight className="size-3.5 shrink-0" />
              </Link>
            );
          })}
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
          <span>Chủ đề &amp; Từ khóa liên quan</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[primaryKeyword, ...secondaryKeywords].map((kw, i) => (
            <Link
              key={i}
              to={`/blog?q=${encodeURIComponent(kw)}`}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:bg-brand-orange/10 hover:text-brand-orange transition-colors"
            >
              #{kw}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default BlogSidebar;
