import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PLANS = [
  { key: "starter", featured: false },
  { key: "pro", featured: true },
  { key: "enterprise", featured: false },
];

export function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section id="pricing" className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.pricing.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const features = t(`landing.pricing.plans.${plan.key}.features`, {
              returnObjects: true,
            }) as string[];

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`relative rounded-2xl border p-8 ${
                  plan.featured
                    ? "border-brand-orange ring-brand-orange dark:border-brand-orange bg-white shadow-xl ring-1 shadow-orange-500/10 dark:bg-zinc-900"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                {plan.featured && (
                  <div className="bg-brand-orange absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white shadow-sm">
                    {t("landing.pricing.mostPopular")}
                  </div>
                )}

                <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t(`landing.pricing.plans.${plan.key}.name`)}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {t(`landing.pricing.plans.${plan.key}.price`)}
                  </span>
                  {plan.key !== "enterprise" && (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      /tháng
                    </span>
                  )}
                </div>

                <ul className="mb-8 space-y-3">
                  {Array.isArray(features) &&
                    features.map((f: string, fi: number) => (
                      <li
                        key={fi}
                        className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                </ul>

                <button
                  onClick={() =>
                    navigate(
                      plan.key === "enterprise" ? "/contact" : "/register",
                    )
                  }
                  className={`w-full cursor-pointer rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                    plan.featured
                      ? "bg-brand-orange hover:bg-brand-orange/90 text-white shadow-md shadow-orange-500/20"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {t(`landing.pricing.plans.${plan.key}.cta`)}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
