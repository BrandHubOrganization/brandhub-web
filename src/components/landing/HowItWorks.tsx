import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ClipboardList, PenTool, CalendarCheck, Rocket } from "lucide-react";

const STEPS = [
  { key: "plan", icon: ClipboardList },
  { key: "create", icon: PenTool },
  { key: "schedule", icon: CalendarCheck },
  { key: "publish", icon: Rocket },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="bg-zinc-50 py-24 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.howItWorks.subtitle")}
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute top-0 left-8 hidden h-full w-0.5 bg-zinc-200 md:block lg:left-1/2 lg:-translate-x-px dark:bg-zinc-700" />

          <div className="space-y-12">
            {STEPS.map(({ key, icon: Icon }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex flex-col gap-6 md:flex-row lg:items-center ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className="bg-brand-orange absolute left-0 z-10 flex size-16 items-center justify-center rounded-full border-4 border-zinc-50 text-xl font-extrabold text-white shadow-sm md:relative md:left-auto lg:absolute lg:left-1/2 lg:-translate-x-1/2 dark:border-zinc-900">
                  {i + 1}
                </div>

                <div
                  className={`ml-20 flex-1 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm md:ml-0 lg:w-[calc(50%-3rem)] ${
                    i % 2 === 0 ? "lg:mr-auto lg:pr-8" : "lg:ml-auto lg:pl-8"
                  } dark:border-zinc-800 dark:bg-zinc-900`}
                >
                  <div className="bg-brand-orange/10 text-brand-orange mb-3 flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {t(`landing.howItWorks.steps.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {t(`landing.howItWorks.steps.${key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
