import { useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Sparkle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll-velocity-reactive marquee ticker inspired by `Kl` in giaimamanhai.vercel.app.
 * Accelerates and flips direction based on user scroll velocity via GSAP ScrollTrigger.
 */
export function BrandMarquee() {
  const { t, i18n } = useTranslation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const phrases =
    i18n.language === "en"
      ? [
          t("landing.marquee.label"),
          "AI GraphRAG Brand Consistency",
          "Multi-Agency & Isolated Workspaces",
          "Facebook · Instagram · TikTok · Threads",
          "3-Tier Approval Governance",
          "Media Package Two-Way Negotiation",
        ]
      : [
          t("landing.marquee.label"),
          "AI GraphRAG Chuẩn Brand Guidelines",
          "Đa Agency & Cô Lập Workspace",
          "Facebook · Instagram · TikTok · Threads",
          "Phê Duyệt 3 Cấp Chuẩn Agency",
          "Đàm Phán Gói Dịch Vụ Truyền Thông",
        ];

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !wrapRef.current ||
        !trackRef.current
      ) {
        return;
      }

      const tween = gsap.to(trackRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 32,
        repeat: -1,
      });
      tween.totalTime(tween.duration() * 50);

      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 240, 7);
          const dir = self.direction || 1;
          gsap.to(tween, {
            timeScale: dir * boost,
            duration: 0.2,
            overwrite: true,
            onComplete: () => {
              gsap.to(tween, { timeScale: dir, duration: 1.1 });
            },
          });
        },
      });
    },
    { scope: wrapRef },
  );

  const repeated = [...phrases, ...phrases, ...phrases, ...phrases];

  return (
    <div
      ref={wrapRef}
      className="bg-brand-orange relative overflow-hidden border-y border-orange-400/30 py-4 shadow-inner"
    >
      <p className="sr-only">{phrases.join(" · ")}</p>
      <div
        ref={trackRef}
        aria-hidden="true"
        className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform"
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-8 text-sm font-extrabold tracking-wider text-white uppercase select-none sm:text-base"
          >
            <span>{item}</span>
            <Sparkle className="size-4 shrink-0 fill-white text-white" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default BrandMarquee;
