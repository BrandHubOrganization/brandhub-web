import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  CalendarDays,
  FileEdit,
  LayoutDashboard,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";

const FEATURES = [
  { key: "planning", icon: CalendarDays },
  { key: "creation", icon: FileEdit },
  { key: "publishing", icon: LayoutDashboard },
  { key: "analytics", icon: BarChart3 },
  { key: "collab", icon: Users },
  { key: "automation", icon: Zap },
];

export function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-2xl border border-zinc-100 bg-zinc-50/50 p-8 transition-all hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-orange-800/30 dark:hover:bg-orange-950/10"
            >
              <div className="bg-brand-orange/10 text-brand-orange mb-5 flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <Icon className="size-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {t(`landing.features.items.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {t(`landing.features.items.${key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
