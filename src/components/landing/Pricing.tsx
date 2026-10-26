import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

const PLANS = [
  { key: "starter", featured: false, monthlyPrice: 0 },
  { key: "pro", featured: true, monthlyPrice: 590_000 },
  { key: "enterprise", featured: false, monthlyPrice: null },
];

const YEARLY_DISCOUNT = 0.2;

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + " ₫";
}

export function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openKey, setOpenKey] = useState<string>(PLANS[0].key);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const { ref: listRef, isIntersecting: listVisible } = useIntersectionObserver(
    { threshold: 0.1, freezeOnceVisible: true },
  );

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      <SectionDecor corner="left" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-12 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={9} />
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.pricing.subtitle")}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm font-medium",
                !yearly
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500",
              )}
            >
              {t("landing.pricing.monthly")}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly((y) => !y)}
              className={cn(
                "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
                yearly ? "bg-brand-orange" : "bg-zinc-300 dark:bg-zinc-700",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                  yearly ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
            <span
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                yearly
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500",
              )}
            >
              {t("landing.pricing.yearly")}
              <span className="bg-brand-orange/10 text-brand-orange rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                {t("landing.pricing.yearlySave")}
              </span>
            </span>
          </div>
        </div>

        <div ref={listRef} className="flex flex-col">
          {PLANS.map((plan, i) => {
            const isOpen = openKey === plan.key;
            const features = t(`landing.pricing.plans.${plan.key}.features`, {
              returnObjects: true,
            }) as string[];
            const priceLabel =
              plan.monthlyPrice === null
                ? t(`landing.pricing.plans.${plan.key}.price`)
                : plan.monthlyPrice === 0
                  ? t(`landing.pricing.plans.${plan.key}.price`)
                  : formatVnd(
                      yearly
                        ? Math.round(
                            (plan.monthlyPrice * (1 - YEARLY_DISCOUNT)) / 1000,
                          ) * 1000
                        : plan.monthlyPrice,
                    );

            return (
              <div
                key={plan.key}
                style={{
                  transitionDelay: listVisible ? `${i * 100}ms` : "0ms",
                }}
                className={cn(
                  "plan-row border-t border-zinc-100 py-8 transition-all duration-500 ease-out first:border-t-0 motion-reduce:opacity-100 motion-reduce:transition-none dark:border-zinc-800",
                  listVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenKey(isOpen ? "" : plan.key)}
                  className="flex w-full items-center justify-between gap-6 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-6">
                    <span
                      className={cn(
                        "text-5xl font-extrabold tabular-nums",
                        plan.featured
                          ? "text-brand-orange"
                          : "text-zinc-200 dark:text-zinc-800",
                      )}
                      style={{
                        WebkitTextStroke: plan.featured
                          ? undefined
                          : "1px currentColor",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {t(`landing.pricing.plans.${plan.key}.name`)}
                        </h3>
                        {plan.featured && (
                          <span className="bg-brand-orange rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            {t("landing.pricing.mostPopular")}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                          {priceLabel}
                        </span>
                        {plan.key !== "enterprise" && (
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {t("landing.pricing.perMonth")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      isOpen
                        ? "border-brand-orange bg-brand-orange rotate-45 text-white"
                        : "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
                    )}
                  >
                    <Plus className="size-4" />
                  </span>
                </button>

                <div
                  className={cn(
                    "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0">
                    <ul className="mt-6 ml-[4.5rem] space-y-3">
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
                      className={cn(
                        "mt-6 ml-[4.5rem] cursor-pointer rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98]",
                        plan.featured
                          ? "bg-brand-orange hover:bg-brand-orange/90 text-white shadow-md shadow-orange-500/20"
                          : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
                      )}
                    >
                      {t(`landing.pricing.plans.${plan.key}.cta`)}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
