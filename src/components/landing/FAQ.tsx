import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { key: "q1" },
  { key: "q2" },
  { key: "q3" },
  { key: "q4" },
  { key: "q5" },
];

export function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.faq.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.faq.subtitle")}
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map(({ key }, i) => {
            const isOpen = open === key;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="pr-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t(`landing.faq.items.${key}.q`)}
                  </span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {t(`landing.faq.items.${key}.a`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
