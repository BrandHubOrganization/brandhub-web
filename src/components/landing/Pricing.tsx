import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

const PLANS = [
  {
    key: "starter",
    featured: false,
    monthlyPrice: 0,
    photo:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    photoCaption: "1 Workspace · 5 Thành viên · 4 Kênh MXH",
  },
  {
    key: "pro",
    featured: true,
    monthlyPrice: 590_000,
    photo:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=400&fit=crop",
    photoCaption: "Unlimited Workspaces · AI GraphRAG & LoRA Studio",
  },
  {
    key: "enterprise",
    featured: false,
    monthlyPrice: null,
    photo:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    photoCaption: "Multi-Agency Hub · Custom SLA · Dedicated Support",
  },
];

const YEARLY_DISCOUNT = 0.2;

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + " ₫";
}

export function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openKey, setOpenKey] = useState<string>(PLANS[1].key);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const { ref: listObserverRef, isIntersecting: listVisible } =
    useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

  const listDomRef = useRef<HTMLDivElement | null>(null);
  const peekRef = useRef<HTMLDivElement | null>(null);
  const peekImgRef = useRef<HTMLImageElement | null>(null);

  const setListRef = (el: HTMLDivElement | null) => {
    listDomRef.current = el;
    listObserverRef(el);
  };

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }
    const listEl = listDomRef.current;
    const peekEl = peekRef.current;
    const imgEl = peekImgRef.current;
    if (!listEl || !peekEl || !imgEl) return;

    const xTo = gsap.quickTo(peekEl, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(peekEl, "y", { duration: 0.45, ease: "power3" });
    let activeRow: Element | null = null;

    gsap.set(peekEl, { scale: 0, autoAlpha: 0 });

    const onPointerMove = (e: PointerEvent) => {
      xTo(e.clientX + 28);
      yTo(e.clientY - 28);
    };

    const hidePeek = () => {
      activeRow = null;
      gsap.to(peekEl, {
        scale: 0,
        autoAlpha: 0,
        duration: 0.3,
        ease: "power3.in",
        overwrite: "auto",
      });
    };

    const onPointerOver = (e: PointerEvent) => {
      const row = (e.target as HTMLElement | null)?.closest("[data-plan-img]");
      if (!row) {
        if (activeRow) hidePeek();
        return;
      }
      if (row !== activeRow) {
        activeRow = row;
        const src = row.getAttribute("data-plan-img");
        if (src) imgEl.src = src;
        gsap.to(peekEl, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.45,
          ease: "back.out(1.6)",
          overwrite: "auto",
        });
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    listEl.addEventListener("pointerover", onPointerOver);
    listEl.addEventListener("pointerleave", hidePeek);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      listEl.removeEventListener("pointerover", onPointerOver);
      listEl.removeEventListener("pointerleave", hidePeek);
    };
  }, []);

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      <SectionDecor corner="left" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-12 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={10} />
          <SplitHeading text={t("landing.pricing.title")} />
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
              <span className="bg-brand-orange/10 text-brand-orange rounded-full px-2 py-0.5 text-[10px] font-semibold">
                {t("landing.pricing.yearlySave")}
              </span>
            </span>
          </div>
        </div>

        <div ref={setListRef} className="flex flex-col gap-4">
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
                data-plan-img={plan.photo}
                style={{
                  transitionDelay: listVisible ? `${i * 100}ms` : "0ms",
                }}
                className={cn(
                  "plan-row group rounded-[28px] border p-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-8 motion-reduce:opacity-100 motion-reduce:transition-none",
                  plan.featured
                    ? "border-brand-orange/50 bg-gradient-to-br from-orange-50/70 via-white to-orange-50/30 shadow-lg dark:border-brand-orange/40 dark:from-orange-950/20 dark:via-zinc-900 dark:to-zinc-900"
                    : "border-zinc-200/80 bg-zinc-50/50 hover:border-orange-200 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900",
                  listVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenKey(isOpen ? "" : plan.key)}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-6">
                    <span
                      className={cn(
                        "bg-clip-text text-5xl font-extrabold tabular-nums transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 sm:text-6xl",
                        plan.featured
                          ? "bg-gradient-to-b from-brand-orange to-orange-400 text-transparent"
                          : "bg-gradient-to-b from-zinc-400 to-zinc-200 text-transparent dark:from-zinc-500 dark:to-zinc-800",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-extrabold text-zinc-900 sm:text-2xl dark:text-zinc-100">
                          {t(`landing.pricing.plans.${plan.key}.name`)}
                        </h3>
                        {plan.featured && (
                          <span className="bg-brand-orange rounded-full px-3 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            {t("landing.pricing.mostPopular")}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="text-2xl font-extrabold text-zinc-900 sm:text-3xl dark:text-zinc-100">
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
                      "flex size-12 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen
                        ? "border-brand-orange bg-brand-orange rotate-[135deg] text-white shadow-md"
                        : "border-zinc-300 text-zinc-500 group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white dark:border-zinc-700 dark:text-zinc-400",
                    )}
                  >
                    <Plus className="size-5" />
                  </span>
                </button>

                <div
                  className={cn(
                    "grid overflow-hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0">
                    <div className="mt-6 grid grid-cols-1 items-center gap-6 border-t border-zinc-200/60 pt-6 sm:ml-[5.25rem] md:grid-cols-12 dark:border-zinc-800">
                      <div className="md:col-span-7">
                        <ul className="space-y-3">
                          {Array.isArray(features) &&
                            features.map((f: string, fi: number) => (
                              <li
                                key={fi}
                                className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300"
                              >
                                <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                <span>{f}</span>
                              </li>
                            ))}
                        </ul>
                        <button
                          onClick={() => {
                            if (plan.key === "enterprise") {
                              window.location.href =
                                "mailto:brandhub404@gmail.com?subject=BrandHub%20Enterprise%20Inquiry";
                              return;
                            }
                            navigate("/register");
                          }}
                          className={cn(
                            "mt-6 cursor-pointer rounded-full px-7 py-3.5 text-sm font-bold transition-all active:scale-[0.98]",
                            plan.featured
                              ? "bg-brand-orange hover:bg-brand-orange/90 text-white shadow-lg shadow-orange-500/25"
                              : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
                          )}
                        >
                          {t(`landing.pricing.plans.${plan.key}.cta`)}
                        </button>
                      </div>

                      {/* Architectural Arch Photo Preview inside Expanded Panel */}
                      <div className="relative h-44 overflow-hidden rounded-t-[999px] rounded-b-[24px] border border-orange-200/60 shadow-md md:col-span-5 dark:border-zinc-800">
                        <img
                          src={plan.photo}
                          alt={plan.photoCaption}
                          width={600}
                          height={400}
                          loading="lazy"
                          decoding="async"
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <span className="absolute inset-x-3 bottom-3 text-center text-[11px] font-bold text-white drop-shadow">
                          {plan.photoCaption}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cursor-Following Preview Bubble */}
      <div
        ref={peekRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-40 hidden size-36 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white shadow-2xl ring-2 ring-brand-orange/40 lg:block dark:border-zinc-900"
      >
        <img
          ref={peekImgRef}
          src={PLANS[1].photo}
          alt=""
          className="size-full object-cover"
        />
      </div>
    </section>
  );
}

export default Pricing;
