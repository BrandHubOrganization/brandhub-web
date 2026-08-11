import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import {
  CalendarDays,
  FileEdit,
  LayoutDashboard,
  BarChart3,
  Users,
  Zap,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLandingDemoStore } from "@/store/landingDemoStore";

// pageIndex matches CinematicHero's NAV_ITEMS order (Overview, Content,
// Schedule, AI Studio, Analytics, Publish, Workspace).
const FEATURES = [
  {
    key: "planning",
    icon: CalendarDays,
    pageIndex: 2,
    span: "lg:col-span-2 lg:row-span-2",
    tint: "bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-zinc-900",
    iconSize: "size-7",
    boxSize: "size-16",
  },
  {
    key: "creation",
    icon: FileEdit,
    pageIndex: 3,
    span: "lg:col-span-1",
    tint: "bg-zinc-50/50 dark:bg-zinc-900/50",
  },
  {
    key: "publishing",
    icon: LayoutDashboard,
    pageIndex: 5,
    span: "lg:col-span-1",
    tint: "bg-white dark:bg-zinc-950",
  },
  {
    key: "analytics",
    icon: BarChart3,
    pageIndex: 4,
    span: "lg:col-span-1",
    tint: "bg-zinc-50/50 dark:bg-zinc-900/50",
  },
  {
    key: "collab",
    icon: Users,
    pageIndex: 6,
    span: "lg:col-span-1",
    tint: "bg-white dark:bg-zinc-950",
  },
  {
    key: "automation",
    icon: Zap,
    pageIndex: 1,
    span: "lg:col-span-4",
    tint: "bg-zinc-50/50 dark:bg-zinc-900/50",
  },
] as const;

export function Features() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const goToPage = useLandingDemoStore((s) => s.goToPage);

  return (
    <section id="features" className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.features.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(
            (
              { key, icon: Icon, pageIndex, span, tint, iconSize, boxSize },
              i,
            ) => (
              <motion.div
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
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={cn(
                  "group focus-visible:ring-brand-orange relative flex cursor-pointer flex-col justify-center rounded-2xl border border-zinc-100 p-8 transition-all hover:border-orange-200 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none dark:border-zinc-800 dark:hover:border-orange-800/30",
                  tint,
                  span,
                )}
              >
                <div
                  className={cn(
                    "bg-brand-orange/10 text-brand-orange mb-5 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                    boxSize ?? "size-12",
                  )}
                >
                  <Icon className={iconSize ?? "size-6"} />
                </div>
                <h3
                  className={cn(
                    "mb-2 font-bold text-zinc-900 dark:text-zinc-100",
                    key === "planning" ? "text-2xl" : "text-lg",
                  )}
                >
                  {t(`landing.features.items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {t(`landing.features.items.${key}.desc`)}
                </p>
                <span className="text-brand-orange mt-4 flex items-center gap-1.5 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                  <MousePointerClick className="size-3.5" />
                  {t("landing.features.demoLabel")}
                </span>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default Features;
