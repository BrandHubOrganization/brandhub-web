import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

const FAQS = [
  { key: "q1" },
  { key: "q2" },
  { key: "q3" },
  { key: "q4" },
  { key: "q5" },
];

export function FAQ() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const { ref: listRef, isIntersecting: listVisible } = useIntersectionObserver(
    { threshold: 0.1, freezeOnceVisible: true },
  );

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mb-16 text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={10} />
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.faq.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.faq.subtitle")}
          </p>
        </div>

        <div ref={listRef} className="space-y-3">
          {FAQS.map(({ key }, i) => {
            const isOpen = open === key;
            return (
              <div
                key={key}
                style={{
                  transitionDelay: listVisible ? `${i * 70}ms` : "0ms",
                }}
                className={cn(
                  "faq-row overflow-hidden rounded-xl border border-zinc-100 transition-all duration-400 ease-out motion-reduce:opacity-100 motion-reduce:transition-none dark:border-zinc-800",
                  listVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="pr-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t(`landing.faq.items.${key}.q`)}
                  </span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-zinc-400 ${reduce ? "" : "transition-transform"} ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {t(`landing.faq.items.${key}.a`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
