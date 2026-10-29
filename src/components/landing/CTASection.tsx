import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionDecor } from "@/components/landing/SectionDecor";

export function CTASection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref: blockRef, isIntersecting: blockVisible } =
    useIntersectionObserver({ threshold: 0.15, freezeOnceVisible: true });

  return (
    <section className="relative overflow-hidden bg-zinc-900 py-24 dark:bg-black">
      <div className="bg-brand-orange/20 absolute -top-32 -left-32 size-96 rounded-full blur-[120px]" />
      <div className="absolute -right-32 -bottom-32 size-96 rounded-full bg-orange-500/10 blur-[120px]" />
      <SectionDecor corner="right" className="text-white opacity-[0.08]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          ref={blockRef}
          className={cn(
            "rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-sm transition-all duration-600 ease-out motion-reduce:opacity-100 motion-reduce:transition-none sm:px-16",
            blockVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0",
          )}
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            {t("landing.cta.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            {t("landing.cta.subtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/register")}
              className="bg-brand-orange hover:bg-brand-orange/90 inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 active:translate-y-0 active:scale-[0.98]"
            >
              {t("landing.cta.start")}
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 py-3.5 text-sm font-medium text-zinc-300 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-y-0 active:scale-[0.98]"
            >
              {t("landing.cta.login")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
