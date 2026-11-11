import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  FileEdit,
  LayoutDashboard,
  BarChart3,
  Users,
  Zap,
  MousePointerClick,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { FeatureCardSvgDecor } from "@/components/landing/FeatureCardSvgDecor";
import {
  SplitHeading,
  SpinningSeal,
} from "@/components/landing/MotionPrimitives";

interface Feature {
  key: string;
  icon: LucideIcon;
  pageIndex: number;
  span: string;
  tint: string;
  photo: string;
  photoAlt: string;
  frameShape: "arch" | "pill-right" | "pill-left" | "rounded";
  liveTag: string;
  iconSize?: string;
  boxSize?: string;
}

// pageIndex matches CinematicHero's NAV_ITEMS order (Overview, Content,
// Schedule, AI Studio, Analytics, Publish, Workspace).
const FEATURES: Feature[] = [
  {
    key: "planning",
    icon: CalendarDays,
    pageIndex: 2,
    span: "lg:col-span-2 lg:row-span-2",
    tint: "bg-gradient-to-br from-[#FFF3EA] via-orange-50/75 to-amber-50/40 border-orange-300/80 dark:from-orange-950/35 dark:via-zinc-900 dark:to-zinc-900 dark:border-orange-800/40",
    iconSize: "size-7",
    boxSize: "size-16",
    photo:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=520&fit=crop",
    photoAlt: "Lập kế hoạch chiến dịch và phân bổ lịch đăng đa tác vụ",
    frameShape: "rounded",
    liveTag: "Multi-Task Calendar · Drag & Drop",
  },
  {
    key: "creation",
    icon: FileEdit,
    pageIndex: 3,
    span: "lg:col-span-1",
    tint: "bg-gradient-to-br from-[#12102B] via-[#1B1642] to-[#0E0C20] text-white border-indigo-500/35",
    photo:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=380&fit=crop",
    photoAlt: "AI Studio sáng tạo nội dung chuẩn Brand Guidelines",
    frameShape: "arch",
    liveTag: "GraphRAG + LoRA",
  },
  {
    key: "publishing",
    icon: LayoutDashboard,
    pageIndex: 5,
    span: "lg:col-span-1",
    tint: "bg-gradient-to-br from-brand-orange via-orange-600 to-rose-600 text-white",
    photo:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=380&fit=crop",
    photoAlt: "Xuất bản đa nền tảng mạng xã hội Facebook, Instagram, TikTok, Threads",
    frameShape: "pill-right",
    liveTag: "FB · IG · TikTok · Threads",
  },
  {
    key: "analytics",
    icon: BarChart3,
    pageIndex: 4,
    span: "lg:col-span-1",
    tint: "bg-gradient-to-br from-emerald-50/95 via-teal-50/50 to-white border-emerald-300/75 dark:from-emerald-950/35 dark:via-zinc-900 dark:to-zinc-900 dark:border-emerald-800/40",
    photo:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=380&fit=crop",
    photoAlt: "Phân tích số liệu và lắng nghe xu hướng thị trường thời gian thực",
    frameShape: "pill-left",
    liveTag: "Real-Time Metrics",
  },
  {
    key: "collab",
    icon: Users,
    pageIndex: 6,
    span: "lg:col-span-1",
    tint: "bg-gradient-to-br from-rose-50/90 via-orange-50/45 to-white border-rose-300/75 dark:from-rose-950/35 dark:via-zinc-900 dark:to-zinc-900 dark:border-rose-800/40",
    photo:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=380&fit=crop",
    photoAlt: "Quy trình phê duyệt 3 cấp Creator, Manager và Client",
    frameShape: "arch",
    liveTag: "Creator → Manager → Client",
  },
  {
    key: "automation",
    icon: Zap,
    pageIndex: 1,
    span: "lg:col-span-4",
    tint: "bg-gradient-to-r from-zinc-950 via-[#141418] to-stone-950 text-white border-orange-500/35",
    photo:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=360&fit=crop",
    photoAlt: "Tự động hóa vòng đời chiến dịch từ Media Package đến xuất bản",
    frameShape: "pill-right",
    liveTag: "1-Click Package → Campaign Backlog",
  },
];

const DARK_CELLS = new Set(["creation", "publishing", "automation"]);

const FRAME_RADIUS: Record<Feature["frameShape"], string> = {
  arch: "rounded-t-[999px] rounded-b-[22px]",
  "pill-right": "rounded-l-[22px] rounded-r-[999px]",
  "pill-left": "rounded-l-[999px] rounded-r-[22px]",
  rounded: "rounded-[24px]",
};

export function Features() {
  const { t } = useTranslation();
  const goToPage = useLandingDemoStore((s) => s.goToPage);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const { ref: gridRef, isIntersecting: gridVisible } = useIntersectionObserver(
    { threshold: 0.1, freezeOnceVisible: true },
  );

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      <SectionDecor corner="left" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-16 max-w-2xl text-center transition-all duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={1} />
          <SplitHeading text={t("landing.features.title")} />
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.features.subtitle")}
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map(
            (
              {
                key,
                icon: Icon,
                pageIndex,
                span,
                tint,
                iconSize,
                boxSize,
                photo,
                photoAlt,
                frameShape,
                liveTag,
              },
              i,
            ) => {
              const dark = DARK_CELLS.has(key);
              const numLabel = String(i + 1).padStart(2, "0");

              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  aria-label={t("landing.features.demoAction", {
                    feature: t(`landing.features.items.${key}.title`),
                  })}
                  onClick={() => goToPage(pageIndex)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToPage(pageIndex);
                    }
                  }}
                  style={{
                    transitionDelay: gridVisible ? `${i * 80}ms` : "0ms",
                  }}
                  className={cn(
                    "feature-card group focus-visible:ring-brand-orange relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[28px] border p-7 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-2xl focus-visible:ring-2 focus-visible:outline-none active:translate-y-0 active:scale-[0.98] motion-reduce:opacity-100 motion-reduce:transition-none",
                    gridVisible
                      ? "scale-100 opacity-100"
                      : "scale-95 opacity-0",
                    dark
                      ? "border-transparent hover:shadow-orange-900/25"
                      : "border-zinc-200/80 hover:border-orange-300 dark:border-zinc-800 dark:hover:border-orange-800/40",
                    tint,
                    span,
                  )}
                >
                  {/* Oversized architectural background numeral */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute -right-2 -bottom-6 font-extrabold tracking-tighter tabular-nums select-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-3",
                      key === "planning"
                        ? "text-[7.5rem] leading-none"
                        : "text-[5.5rem] leading-none",
                      dark
                        ? "text-white/[0.08]"
                        : "text-brand-orange/[0.07] dark:text-brand-orange/[0.09]",
                    )}
                  >
                    {numLabel}
                  </span>

                  <div className="flex flex-1 flex-col">
                    <div className="mb-4 flex w-full items-start justify-between">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:-rotate-6",
                          dark
                            ? "bg-white/15 text-white"
                            : "bg-brand-orange/10 text-brand-orange",
                          boxSize ?? "size-12",
                        )}
                      >
                        <Icon className={iconSize ?? "size-6"} />
                      </div>
                      {key === "planning" ? (
                        <div className="flex items-center gap-3">
                          <div className="hidden h-20 w-44 sm:block">
                            <FeatureCardSvgDecor featureKey={key} />
                          </div>
                          <SpinningSeal
                            text="CAMPAIGN STUDIO • ALL-IN-ONE • "
                            centerTop="360°"
                            centerBottom="STUDIO"
                            variant="orange"
                            className="size-16 shrink-0"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-24">
                          <FeatureCardSvgDecor featureKey={key} />
                        </div>
                      )}
                    </div>

                    {photo && key !== "planning" && key !== "automation" && (
                      <div
                        className={cn(
                          "relative mb-4 h-36 w-full overflow-hidden border transition-all duration-500",
                          FRAME_RADIUS[frameShape],
                          dark
                            ? "border-white/20"
                            : "border-zinc-200/70 dark:border-zinc-800",
                        )}
                      >
                        <img
                          src={photo}
                          alt={photoAlt}
                          width={600}
                          height={380}
                          loading="lazy"
                          decoding="async"
                          className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                        <span className="absolute bottom-2.5 left-3 rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-xs">
                          {liveTag}
                        </span>
                      </div>
                    )}

                    <h3
                      className={cn(
                        "mb-2 font-bold tracking-tight",
                        dark ? "text-white" : "text-zinc-900 dark:text-zinc-100",
                        key === "planning" ? "text-2xl" : "text-lg",
                      )}
                    >
                      {t(`landing.features.items.${key}.title`)}
                    </h3>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        dark
                          ? "text-white/85"
                          : "text-zinc-500 dark:text-zinc-400",
                      )}
                    >
                      {t(`landing.features.items.${key}.desc`)}
                    </p>

                    {photo && key === "planning" && (
                      <div className="mt-6 flex flex-1 flex-col gap-4">
                        <div className="relative min-h-60 flex-1 overflow-hidden rounded-[24px] border border-orange-200/70 shadow-inner lg:min-h-72 dark:border-zinc-800">
                          <img
                            src={photo}
                            alt={photoAlt}
                            width={900}
                            height={520}
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                          <div className="absolute right-4 bottom-3.5 left-4 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white drop-shadow">
                              {photoAlt}
                            </span>
                            <span className="bg-brand-orange shrink-0 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-md">
                              {liveTag}
                            </span>
                          </div>
                        </div>

                        {/* Live Campaign Task & Role Breakdown Bento Sub-Grid */}
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          <div className="rounded-2xl border border-orange-200/70 bg-white/85 p-3.5 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/80">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
                                01 · Social Post
                              </span>
                              <span className="size-2 rounded-full bg-emerald-500" />
                            </div>
                            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              FB · IG · TikTok · Threads
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              Lịch kéo thả đa kênh &amp; hẹn giờ tự động
                            </p>
                          </div>

                          <div className="rounded-2xl border border-orange-200/70 bg-white/85 p-3.5 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/80">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
                                02 · Media Task
                              </span>
                              <span className="size-2 rounded-full bg-amber-500" />
                            </div>
                            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              Booking Báo chí &amp; TVC
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              Theo dõi tiến độ đối tác truyền thông
                            </p>
                          </div>

                          <div className="rounded-2xl border border-orange-200/70 bg-white/85 p-3.5 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/80">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
                                03 · Survey Form
                              </span>
                              <span className="size-2 rounded-full bg-sky-500" />
                            </div>
                            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              Khảo sát Khách hàng
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              Thu thập phản hồi &amp; xuất báo cáo CSV
                            </p>
                          </div>
                        </div>

                        {/* Canonical Role Pipeline Pill */}
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-orange-200/60 bg-orange-100/55 px-4 py-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-900/90">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            Phân quyền chuẩn Agency:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 font-bold text-orange-700 dark:text-orange-300">
                            <span className="rounded-full bg-white px-2.5 py-0.5 shadow-2xs dark:bg-zinc-800">
                              Owner
                            </span>
                            <span>→</span>
                            <span className="rounded-full bg-white px-2.5 py-0.5 shadow-2xs dark:bg-zinc-800">
                              Manager
                            </span>
                            <span>→</span>
                            <span className="rounded-full bg-white px-2.5 py-0.5 shadow-2xs dark:bg-zinc-800">
                              Creator
                            </span>
                            <span>→</span>
                            <span className="rounded-full bg-white px-2.5 py-0.5 shadow-2xs dark:bg-zinc-800">
                              Client
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {photo && key === "automation" && (
                      <div className="mt-6 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
                        <div className="relative h-32 overflow-hidden rounded-l-[24px] rounded-r-[999px] border border-zinc-800 sm:col-span-8">
                          <img
                            src={photo}
                            alt={photoAlt}
                            width={1200}
                            height={360}
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/30 to-transparent" />
                          <span className="absolute top-1/2 left-5 -translate-y-1/2 text-sm font-semibold text-white drop-shadow">
                            Hạ tầng Outbox Retry &amp; Tự động xuất bản đa kênh 24/7
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 sm:col-span-4">
                          <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-zinc-200">
                            {liveTag}
                          </span>
                          <span className="bg-brand-orange inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold text-white">
                            <span>99.9% Uptime</span>
                            <ArrowUpRight className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <span
                    className={cn(
                      "mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-80 transition-all group-hover:translate-x-1 group-hover:opacity-100",
                      dark ? "text-white" : "text-brand-orange",
                    )}
                  >
                    <MousePointerClick className="size-3.5" />
                    {t("landing.features.demoLabel")}
                  </span>
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

export default Features;
