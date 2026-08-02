import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Eye, Smartphone, Monitor } from "lucide-react";

const TEMPLATES = [
  { key: "social", icon: Smartphone, color: "from-pink-500 to-orange-500" },
  { key: "blog", icon: Monitor, color: "from-blue-500 to-cyan-500" },
  { key: "email", icon: Eye, color: "from-emerald-500 to-teal-500" },
];

export function Templates() {
  const { t } = useTranslation();

  return (
    <section id="templates" className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.templates.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.templates.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TEMPLATES.map(({ key, icon: Icon, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                className={`relative flex h-48 items-center justify-center bg-linear-to-br ${color} bg-opacity-10`}
              >
                <div className="flex size-20 items-center justify-center rounded-2xl bg-white/80 shadow-lg backdrop-blur transition-transform group-hover:scale-110">
                  <Icon className="size-10 text-zinc-700" />
                </div>
                <div className="absolute right-0 bottom-0 left-0 h-1/2 bg-linear-to-t from-white to-transparent dark:from-zinc-900" />
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t(`landing.templates.items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {t(`landing.templates.items.${key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Templates;
