import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { MousePointerClick, Sparkles, Flame } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TEMPLATES = [
  {
    key: "social",
    badge: "Social Viral",
    stat: "+40% Độ tiếp cận",
    platforms: ["Facebook", "Instagram", "TikTok", "Threads"],
    sampleTags: ["#ViralTikTok", "#BrandHub", "#OOTDVN"],
    photo:
      "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=720&h=480&fit=crop",
    frameClass: "rounded-t-[999px] rounded-b-[24px]",
    cardTheme:
      "from-orange-50/90 via-white to-amber-50/40 border-orange-200/90 dark:from-orange-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-orange-800/40",
    pillTheme: "bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-orange-500/30",
    tagColor: "text-brand-orange bg-orange-500/10 border-orange-500/20",
  },
  {
    key: "blog",
    badge: "Brand Storytelling",
    stat: "3.2x Tương tác",
    platforms: ["Facebook", "Threads", "Press"],
    sampleTags: ["#ContentStrategy", "#GraphRAG", "#BrandVoice"],
    photo:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=720&h=480&fit=crop",
    frameClass: "rounded-[24px] bh-cutout-tr",
    cardTheme:
      "from-violet-50/90 via-white to-indigo-50/40 border-violet-200/90 dark:from-violet-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-violet-800/40",
    pillTheme: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/30",
    tagColor: "text-violet-600 bg-violet-500/10 border-violet-500/20 dark:text-violet-400",
  },
  {
    key: "email",
    badge: "Media Package & Survey",
    stat: "32% Chuyển đổi",
    platforms: ["Proposal", "Survey", "Campaign"],
    sampleTags: ["#MediaPackage", "#ClientSignoff", "#Agency"],
    photo:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=720&h=480&fit=crop",
    frameClass: "rounded-t-[999px] rounded-b-[24px]",
    cardTheme:
      "from-emerald-50/90 via-white to-teal-50/40 border-emerald-200/90 dark:from-emerald-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-emerald-800/40",
    pillTheme: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30",
    tagColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
  },
];

const BLUEPRINT_TICKER = [
  "PRODUCT LAUNCH BLUEPRINT",
  "TET & SEASONAL MEGA CAMPAIGN",
  "MULTI-CHANNEL REBRANDING",
  "KOL & PRESS MEDIA PACKAGE",
  "CUSTOMER SURVEY & FEEDBACK LOOP",
  "FLASH SALE 4-PLATFORM SPRINT",
];

// Cả 3 loại template đều quản lý trong trang Nội dung (Kanban) của demo,
// bấm card nào cũng đưa về đúng chỗ người dùng thật sẽ thao tác.
const TEMPLATE_PAGE_INDEX = 1;

export function Templates() {
  const { t } = useTranslation();
  const goToPage = useLandingDemoStore((s) => s.goToPage);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      if (!gridRef.current) return;
      gridRef.current
        .querySelectorAll<HTMLElement>(".template-photo")
        .forEach((photo) => {
          gsap.to(photo, {
            yPercent: -14,
            ease: "none",
            scrollTrigger: {
              trigger: photo.closest(".template-card"),
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
    },
    { scope: gridRef },
  );

  return (
    <section
      id="templates"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <Sparkles className="size-3.5 text-brand-orange" />
            <span>THƯ VIỆN MẪU CHIẾN DỊCH &amp; KHUNG WORKSPACE</span>
          </div>
          <SplitHeading text={t("landing.templates.title")} />
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.templates.subtitle")}
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {TEMPLATES.map((item, i) => (
            <div
              key={item.key}
              role="button"
              tabIndex={0}
              aria-label={t("landing.templates.demoAction", {
                template: t(`landing.templates.items.${item.key}.title`),
              })}
              onClick={() => goToPage(TEMPLATE_PAGE_INDEX)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToPage(TEMPLATE_PAGE_INDEX);
                }
              }}
              className="template-card group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/45 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <Flame className="size-3 text-brand-orange" />
                    {item.stat}
                  </span>
                  <span className="font-mono font-bold text-zinc-400">
                    0{i + 1} · {item.badge}
                  </span>
                </div>

                <div className="relative h-52 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                  <img
                    src={item.photo}
                    alt={t(`landing.templates.items.${item.key}.title`)}
                    width={720}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    className="template-photo absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.04]"
                  />
                </div>

                <div className="pt-4 pb-1">
                  {/* Platform Tags */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.platforms.map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 shadow-2xs ring-1 ring-zinc-200/70 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <span className="text-brand-orange flex items-center gap-1 text-[11px] font-bold opacity-85 transition-opacity group-hover:opacity-100">
                      <MousePointerClick className="size-3" />
                      {t("landing.templates.useLabel")}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {t(`landing.templates.items.${item.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {t(`landing.templates.items.${item.key}.desc`)}
                  </p>
                </div>
              </div>

              {/* Hashtag Preview */}
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-zinc-200/60 px-2 pt-3 pl-10 dark:border-zinc-800">
                {item.sampleTags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold",
                      item.tagColor,
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll-Scrubbed Horizontal Blueprint Track */}
      <div
        aria-hidden="true"
        className="pointer-events-none mt-16 overflow-hidden border-y border-orange-200/60 bg-orange-50/50 py-3 dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        <div
          data-bh-horizontal-track="left"
          className="flex w-max items-center gap-8 px-4 font-mono text-xs font-extrabold tracking-[0.18em] text-zinc-600 uppercase will-change-transform dark:text-zinc-400"
        >
          {[...BLUEPRINT_TICKER, ...BLUEPRINT_TICKER].map((bp, idx) => (
            <span key={idx} className="inline-flex items-center gap-3">
              <span className="bg-brand-orange size-2 rotate-45" />
              <span>{bp}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Templates;
