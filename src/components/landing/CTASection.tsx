import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionDecor } from "@/components/landing/SectionDecor";
import {
  SplitHeading,
  SpinningSeal,
} from "@/components/landing/MotionPrimitives";

export function CTASection() {
  const { t } = useTranslation();
  const { ref: blockRef, isIntersecting: blockVisible } =
    useIntersectionObserver({ threshold: 0.15, freezeOnceVisible: true });

  return (
    <section className="relative overflow-hidden bg-zinc-950 py-24 dark:bg-black">
      <div className="bg-brand-orange/20 absolute -top-32 -left-32 size-96 rounded-full blur-[120px]" />
      <div className="absolute -right-32 -bottom-32 size-96 rounded-full bg-orange-500/10 blur-[120px]" />
      <SectionDecor corner="right" className="text-white opacity-[0.08]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={blockRef}
          className={cn(
            "relative grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-brand-orange/10 p-8 backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:opacity-100 motion-reduce:transition-none sm:p-14 lg:grid-cols-12",
            blockVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0",
          )}
        >
          <div className="text-left lg:col-span-7">
            <span className="border-brand-orange/40 bg-brand-orange/15 text-brand-orange mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide uppercase">
              <CheckCircle2 className="size-3.5" />
              <span>ALL-IN-ONE AGENCY &amp; AI MEDIA HUB</span>
            </span>

            <SplitHeading
              text={t("landing.cta.title")}
              className="text-white dark:text-white"
            />
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-300">
              {t("landing.cta.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="bg-brand-orange hover:bg-brand-orange/90 inline-flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 active:translate-y-0 active:scale-[0.98]"
              >
                {t("landing.cta.start")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-8 py-4 text-sm font-semibold text-zinc-200 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-y-0 active:scale-[0.98]"
              >
                {t("landing.cta.login")}
              </Link>
            </div>
          </div>

          {/* Architectural Arch-Top Real Photography Frame + Spinning Seal */}
          <div className="relative mx-auto w-full max-w-sm lg:col-span-5">
            <div className="overflow-hidden rounded-t-[999px] rounded-b-[28px] border-2 border-white/15 bg-zinc-900 p-2 shadow-2xl">
              <div className="relative aspect-[4/4.5] overflow-hidden rounded-t-[999px] rounded-b-[22px]">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=720&h=820&fit=crop"
                  alt="Đội ngũ Agency và Khách hàng cộng tác trên BrandHub"
                  width={720}
                  height={820}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-center">
                  <p className="text-xs font-bold tracking-wider text-orange-400 uppercase">
                    6 VAI TRÒ CHUẨN · 4 NỀN TẢNG MXH
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-200">
                    Facebook · Instagram · TikTok · Threads
                  </p>
                </div>
              </div>
            </div>

            <SpinningSeal
              text="START FREE TODAY • BRANDHUB AI STUDIO • "
              centerTop="100%"
              centerBottom="READY"
              variant="orange"
              className="absolute -bottom-5 -left-5 size-24"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
