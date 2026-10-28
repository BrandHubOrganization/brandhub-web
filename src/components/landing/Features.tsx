import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  FileEdit,
  LayoutDashboard,
  BarChart3,
  Users,
  Zap,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

import { FeatureCardSvgDecor } from "@/components/landing/FeatureCardSvgDecor";

interface Feature {
  key: string;
  icon: LucideIcon;
  pageIndex: number;
  span: string;
  tint: string;
  photo: string;
  photoAlt: string;
  /** Chỉ một số card dùng kích thước icon/box riêng; còn lại dùng fallback trong JSX. */
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
    tint: "bg-gradient-to-br from-orange-50 via-orange-50/40 to-white dark:from-orange-950/30 dark:via-orange-950/10 dark:to-zinc-900",
    iconSize: "size-7",
    boxSize: "size-16",
    photo:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=420&fit=crop",
    photoAlt: "Lập kế hoạch chiến dịch và phân bổ lịch đăng",
  },
  {
    key: "creation",
    icon: FileEdit,
    pageIndex: 3,
    span: "lg:col-span-1",
    tint: "bg-white dark:bg-zinc-950",
    photo:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=300&fit=crop",
    photoAlt: "AI Studio sáng tạo nội dung",
  },
  {
    key: "publishing",
    icon: LayoutDashboard,
    pageIndex: 5,
    span: "lg:col-span-1",
    tint: "bg-brand-orange text-white dark:bg-brand-orange",
    photo:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=300&fit=crop",
    photoAlt: "Xuất bản đa nền tảng mạng xã hội",
  },
  {
    key: "analytics",
    icon: BarChart3,
    pageIndex: 4,
    span: "lg:col-span-1",
    tint: "bg-zinc-50 dark:bg-zinc-900/60",
    photo:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop",
    photoAlt: "Phân tích số liệu và lắng nghe thị trường",
  },
  {
    key: "collab",
    icon: Users,
    pageIndex: 6,
    span: "lg:col-span-1",
    tint: "bg-white dark:bg-zinc-950",
    photo:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop",
    photoAlt: "Quy trình phê duyệt và cộng tác đa cấp",
  },
  {
    key: "automation",
    icon: Zap,
    pageIndex: 1,
    span: "lg:col-span-4",
    tint: "bg-zinc-950 text-white dark:bg-zinc-900",
    photo:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&h=280&fit=crop",
    photoAlt: "Tự động hóa luồng làm việc Outbox & Retry",
  },
];

const DARK_CELLS = new Set(["publishing", "automation"]);

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
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.features.title")}
          </h2>
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
              { key, icon: Icon, pageIndex, span, tint, iconSize, boxSize, photo, photoAlt },
              i,
            ) => {
              const dark = DARK_CELLS.has(key);
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
                    "feature-card group focus-visible:ring-brand-orange relative flex cursor-pointer flex-col justify-between rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:outline-none active:translate-y-0 active:scale-[0.98] motion-reduce:opacity-100 motion-reduce:transition-none overflow-hidden",
                    gridVisible
                      ? "scale-100 opacity-100"
                      : "scale-95 opacity-0",
                    dark
                      ? "border-transparent hover:shadow-orange-900/20"
                      : "border-zinc-100 hover:border-orange-200 dark:border-zinc-800 dark:hover:border-orange-800/30",
                    tint,
                    span,
                  )}
                >
                  <div>
                    <div className="mb-4 flex w-full items-start justify-between">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                          dark
                            ? "bg-white/15 text-white"
                            : "bg-brand-orange/10 text-brand-orange",
                          boxSize ?? "size-12",
                        )}
                      >
                        <Icon className={iconSize ?? "size-6"} />
                      </div>
                      {key === "planning" ? (
                        <div className="hidden h-20 w-48 sm:block">
                          <FeatureCardSvgDecor featureKey={key} />
                        </div>
                      ) : (
                        <div className="h-10 w-24">
                          <FeatureCardSvgDecor featureKey={key} />
                        </div>
                      )}
                    </div>

                    {photo && key !== "planning" && key !== "automation" && (
                      <div className="relative mb-4 h-32 w-full overflow-hidden rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                        <img
                          src={photo}
                          alt={photoAlt}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                    )}

                    <h3
                      className={cn(
                        "mb-2 font-bold",
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
                          ? "text-white/80"
                          : "text-zinc-500 dark:text-zinc-400",
                      )}
                    >
                      {t(`landing.features.items.${key}.desc`)}
                    </p>

                    {photo && key === "planning" && (
                      <div className="relative mt-6 h-52 w-full overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                        <img
                          src={photo}
                          alt={photoAlt}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-4 text-xs font-semibold text-white drop-shadow">
                          {photoAlt}
                        </span>
                      </div>
                    )}

                    {photo && key === "automation" && (
                      <div className="relative mt-5 h-28 w-full overflow-hidden rounded-2xl border border-zinc-800">
                        <img
                          src={photo}
                          alt={photoAlt}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/60" />
                        <span className="absolute top-1/2 -translate-y-1/2 left-5 text-sm font-semibold text-white drop-shadow">
                          Hạ tầng Outbox Retry & Tự động xuất bản 24/7
                        </span>
                      </div>
                    )}
                  </div>

                  <span
                    className={cn(
                      "mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100",
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
