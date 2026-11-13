import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

export function CTASection() {
  const { t } = useTranslation();
  const { ref: blockRef, isIntersecting: blockVisible } =
    useIntersectionObserver({ threshold: 0.15, freezeOnceVisible: true });

  return (
    <section className="relative overflow-hidden border-t border-zinc-200/80 bg-zinc-50/70 py-24 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={blockRef}
          className={cn(
            "relative grid grid-cols-1 items-center gap-10 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-xs transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:opacity-100 motion-reduce:transition-none sm:p-12 lg:grid-cols-12 dark:border-zinc-800 dark:bg-zinc-900",
            blockVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0",
          )}
        >
          <div className="text-left lg:col-span-7">
            <span className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide uppercase">
              <CheckCircle2 className="size-3.5" />
              <span>ALL-IN-ONE AGENCY &amp; AI MEDIA HUB</span>
            </span>

            <SplitHeading
              text={t("landing.cta.title")}
              className="text-zinc-900 dark:text-white"
            />
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              {t("landing.cta.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="bg-brand-orange hover:bg-brand-orange/90 inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                {t("landing.cta.start")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-800 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-orange/40 hover:text-brand-orange active:translate-y-0 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {t("landing.cta.login")}
              </Link>
            </div>
          </div>

          {/* Clean Rectangular Photography Frame */}
          <div className="mx-auto w-full max-w-md lg:col-span-5">
            <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2 dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="aspect-[4/3] overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=720&h=540&fit=crop"
                  alt="Đội ngũ Agency và Khách hàng cộng tác trên BrandHub"
                  width={720}
                  height={540}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2.5 pb-1 text-xs">
                <span className="font-mono font-bold text-brand-orange uppercase">
                  6 vai trò chuẩn
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Facebook · Instagram · TikTok · Threads
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
