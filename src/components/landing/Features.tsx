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
import { SplitHeading } from "@/components/landing/MotionPrimitives";

interface Feature {
  key: string;
  icon: LucideIcon;
  pageIndex: number;
  span: string;
  photo: string;
  photoAlt: string;
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
    iconSize: "size-6",
    boxSize: "size-12",
    photo:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=520&fit=crop",
    photoAlt: "Lập kế hoạch chiến dịch và phân bổ lịch đăng đa tác vụ",
    liveTag: "Multi-Task Calendar · Drag & Drop",
  },
  {
    key: "creation",
    icon: FileEdit,
    pageIndex: 3,
    span: "lg:col-span-1",
    photo:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=380&fit=crop",
    photoAlt: "AI Studio sáng tạo nội dung chuẩn Brand Guidelines",
    liveTag: "GraphRAG + LoRA",
  },
  {
    key: "publishing",
    icon: LayoutDashboard,
    pageIndex: 5,
    span: "lg:col-span-1",
    photo:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=380&fit=crop",
    photoAlt: "Xuất bản đa nền tảng mạng xã hội Facebook, Instagram, TikTok, Threads",
    liveTag: "FB · IG · TikTok · Threads",
  },
  {
    key: "analytics",
    icon: BarChart3,
    pageIndex: 4,
    span: "lg:col-span-1",
    photo:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=380&fit=crop",
    photoAlt: "Phân tích số liệu và lắng nghe xu hướng thị trường thời gian thực",
    liveTag: "Real-Time Metrics",
  },
  {
    key: "collab",
    icon: Users,
    pageIndex: 6,
    span: "lg:col-span-1",
    photo:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=380&fit=crop",
    photoAlt: "Quy trình phê duyệt 3 cấp Creator, Manager và Client",
    liveTag: "Creator → Manager → Client",
  },
  {
    key: "automation",
    icon: Zap,
    pageIndex: 1,
    span: "lg:col-span-4",
    photo:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=360&fit=crop",
    photoAlt: "Tự động hóa vòng đời chiến dịch từ Media Package đến xuất bản",
    liveTag: "1-Click Package → Campaign Backlog",
  },
];

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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-14 max-w-2xl text-center transition-all duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
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
                iconSize,
                boxSize,
                photo,
                photoAlt,
                liveTag,
              },
              i,
            ) => {
              const isHeroTile = key === "planning";

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
                    transitionDelay: gridVisible ? `${i * 70}ms` : "0ms",
                  }}
                  className={cn(
                    "feature-card group focus-visible:ring-brand-orange relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/45 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none active:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none dark:bg-zinc-900",
                    gridVisible
                      ? "scale-100 opacity-100"
                      : "scale-95 opacity-0",
                    isHeroTile
                      ? "border-brand-orange/35 bg-zinc-50/40 dark:border-orange-500/35 dark:bg-zinc-900"
                      : "border-zinc-200/90 dark:border-zinc-800",
                    span,
                  )}
                >
                  <div className="flex flex-1 flex-col">
                    <div className="mb-4 flex w-full items-center justify-between gap-2">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange transition-transform duration-300 group-hover:scale-105",
                          boxSize ?? "size-11",
                        )}
                      >
                        <Icon className={iconSize ?? "size-5"} />
                      </div>
                      <span className="truncate rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {liveTag}
                      </span>
                    </div>

                    {photo && key !== "planning" && key !== "automation" && (
                      <div className="mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                        <img
                          src={photo}
                          alt={photoAlt}
                          width={600}
                          height={380}
                          loading="lazy"
                          decoding="async"
                          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                    )}

                    <h3
                      className={cn(
                        "mb-2 font-bold tracking-tight text-zinc-900 dark:text-white",
                        isHeroTile ? "text-xl sm:text-2xl" : "text-lg",
                      )}
                    >
                      {t(`landing.features.items.${key}.title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {t(`landing.features.items.${key}.desc`)}
                    </p>

                    {photo && key === "planning" && (
                      <div className="mt-5 flex flex-1 flex-col gap-3.5">
                        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                          <img
                            src={photo}
                            alt={photoAlt}
                            width={900}
                            height={520}
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        </div>

                        {/* Clean Campaign Task & Role Sub-Grid */}
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          <div className="rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                            <span className="font-mono text-[10px] font-bold text-brand-orange uppercase">
                              01 · Social Post
                            </span>
                            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              FB · IG · TikTok · Threads
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              Lịch kéo thả đa kênh &amp; hẹn giờ tự động
                            </p>
                          </div>

                          <div className="rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                            <span className="font-mono text-[10px] font-bold text-brand-orange uppercase">
                              02 · Media Task
                            </span>
                            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              Booking Báo chí &amp; TVC
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              Theo dõi tiến độ đối tác truyền thông
                            </p>
                          </div>

                          <div className="rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                            <span className="font-mono text-[10px] font-bold text-brand-orange uppercase">
                              03 · Survey Form
                            </span>
                            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              Khảo sát Khách hàng
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              Thu thập phản hồi &amp; xuất báo cáo CSV
                            </p>
                          </div>
                        </div>

                        {/* Canonical Role Pipeline Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-950/60">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            Phân quyền chuẩn Agency:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                            <span>Owner</span>
                            <span className="text-brand-orange">→</span>
                            <span>Manager</span>
                            <span className="text-brand-orange">→</span>
                            <span>Creator</span>
                            <span className="text-brand-orange">→</span>
                            <span>Client</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {photo && key === "automation" && (
                      <div className="mt-5 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
                        <div className="aspect-[16/5] overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 sm:col-span-8 dark:border-zinc-800 dark:bg-zinc-800">
                          <img
                            src={photo}
                            alt={photoAlt}
                            width={1200}
                            height={360}
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="flex flex-col items-start justify-between gap-2 sm:col-span-4 sm:items-end sm:text-right">
                          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            Hạ tầng Outbox Retry &amp; Tự động xuất bản đa kênh 24/7
                          </p>
                          <span className="bg-brand-orange inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-bold text-white">
                            <span>99.9% Uptime</span>
                            <ArrowUpRight className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-brand-orange mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-85 transition-all group-hover:translate-x-1 group-hover:opacity-100">
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
