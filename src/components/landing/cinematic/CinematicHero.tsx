import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { InstagramPost } from "./posts/InstagramPost";
import { TikTokPost } from "./posts/TikTokPost";
import { FacebookPost } from "./posts/FacebookPost";
import { LinkedInPost } from "./posts/LinkedInPost";
import { MiniPosts } from "./MiniPosts";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Cinematic Hero — scroll-driven 4-platform → BrandHub reveal.
 *
 * Flow: IG (0-15%) → TT (15-35%) → FB (35-55%) → LI (55-75%)
 * → BrandHub reveal (75-90%) → CTA (90-100%) → release.
 *
 * CSS opacity-0 handles initial state so GSAP fromTo doesn't
 * flash hidden elements before the timeline starts.
 *
 * Posts fly to 4 corners using xPercent/yPercent so they adapt
 * to any screen size without overlapping. Mini-posts + CTA use
 * a separate onEnter trigger so they stick — scrolling back up
 * does NOT reverse them.
 */
export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=3500",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    // IG post → top-left corner
    tl.to(".post-ig", {
      scale: 0.15,
      xPercent: -160,
      yPercent: -140,
      opacity: 0,
      duration: 1.2,
      ease: "power2.in",
    })
      // TikTok → top-right corner
      .fromTo(
        ".post-tt",
        { scale: 1.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" },
        "<0.3",
      )
      .to(".post-tt", {
        scale: 0.15,
        xPercent: 160,
        yPercent: -140,
        opacity: 0,
        duration: 1.2,
        ease: "power2.in",
      })
      // Facebook → bottom-left corner
      .fromTo(
        ".post-fb",
        { scale: 1.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" },
        "<0.3",
      )
      .to(".post-fb", {
        scale: 0.15,
        xPercent: -160,
        yPercent: 140,
        opacity: 0,
        duration: 1.2,
        ease: "power2.in",
      })
      // LinkedIn → bottom-right corner
      .fromTo(
        ".post-li",
        { scale: 1.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" },
        "<0.3",
      )
      .to(".post-li", {
        scale: 0.15,
        xPercent: 160,
        yPercent: 140,
        opacity: 0,
        duration: 1.2,
        ease: "power2.in",
      })
      // BrandHub dashboard fades in + scales up
      .fromTo(
        ".brandhub-bg",
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
        "<0.2",
      );

    // Mini posts + CTA: fire once when scroll reaches ~75% of the 3500px.
    // Separate ScrollTrigger so scrolling back up does NOT reverse them.
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top -=2600",
      onEnter: () => {
        gsap.to(".mini-posts", { opacity: 1, duration: 0.5 });
        gsap.to(".cta-overlay", {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.4)",
        });
      },
    });
  });

  return (
    <section
      ref={sectionRef}
      id="hero-cinematic"
      className="relative h-screen w-full overflow-hidden bg-zinc-950"
    >
      <div className="absolute inset-0">
        {/* Layer 0: BrandHub Dashboard background */}
        <BrandHubDashboardBg />

        {/* Layer 1: Post stack */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="post-ig absolute">
            <InstagramPost />
          </div>
          <div className="post-tt absolute opacity-0">
            <TikTokPost />
          </div>
          <div className="post-fb absolute opacity-0">
            <FacebookPost />
          </div>
          <div className="post-li absolute opacity-0">
            <LinkedInPost />
          </div>
        </div>

        {/* Layer 2: Mini posts 4 góc */}
        <div className="mini-posts pointer-events-none absolute inset-0 z-20 opacity-0">
          <MiniPosts />
        </div>

        {/* Layer 3: CTA overlay */}
        <div className="cta-overlay pointer-events-none absolute bottom-20 left-1/2 z-30 -translate-x-1/2 opacity-0">
          <CTAButtons />
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-white/25">
          <span className="text-[10px] tracking-[0.2em] uppercase">
            Cuộn xuống
          </span>
          <div className="h-10 w-px animate-pulse bg-linear-to-b from-white/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function BrandHubDashboardBg() {
  return (
    <div className="brandhub-bg pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-0">
      <div className="w-full max-w-4xl px-6">
        <div className="overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="bg-brand-orange flex size-7 items-center justify-center rounded-md text-xs font-bold text-white">
                B
              </div>
              <span className="text-sm font-semibold text-white">BrandHub</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="h-6 w-32 rounded-full bg-zinc-800" />
              <div className="size-7 rounded-full bg-linear-to-br from-orange-400 to-orange-600" />
            </div>
          </div>
          <div className="flex">
            <div className="w-48 shrink-0 border-r border-zinc-800 p-4">
              {[
                "📊 Tổng quan",
                "📝 Nội dung",
                "📅 Lịch",
                "📤 Xuất bản",
                "📈 Analytics",
              ].map((item, i) => (
                <div
                  key={item}
                  className={`mb-1 rounded-md px-3 py-2 text-xs ${i === 0 ? "bg-brand-orange/15 text-brand-orange font-medium" : "text-zinc-400"}`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex-1 p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">
                  Chào buổi sáng, Team! 👋
                </p>
                <p className="text-xs text-zinc-500">
                  Hôm nay có 12 nội dung cần publish
                </p>
              </div>
              <div className="mb-4 grid grid-cols-4 gap-3">
                {[
                  { label: "Tổng bài", val: "1,284", color: "text-blue-400" },
                  { label: "Đã đăng", val: "986", color: "text-emerald-400" },
                  { label: "Chờ duyệt", val: "24", color: "text-amber-400" },
                  { label: "Lỗi", val: "3", color: "text-red-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-zinc-800/50 p-3">
                    <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 rounded-lg bg-zinc-800/50 p-4">
                  <p className="mb-3 text-xs font-medium text-zinc-500">
                    HIỆU SUẤT CONTENT
                  </p>
                  <div className="flex items-end gap-2">
                    {[60, 85, 45, 90, 70, 55, 95].map((h, i) => (
                      <div key={i} className="flex-1">
                        <div
                          className="bg-brand-orange/60 mx-auto w-full max-w-[24px] rounded-t-sm"
                          style={{ height: `${h}%`, minHeight: "4px" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] text-zinc-600">
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                    <span>CN</span>
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-800/50 p-4">
                  <p className="mb-3 text-xs font-medium text-zinc-500">
                    LỊCH HÔM NAY
                  </p>
                  {[
                    {
                      time: "09:00",
                      title: "Đăng bài Heineken",
                      color: "bg-emerald-500",
                    },
                    {
                      time: "12:00",
                      title: "Review Nike",
                      color: "bg-amber-500",
                    },
                    {
                      time: "15:00",
                      title: "Publish TikTok",
                      color: "bg-cyan-500",
                    },
                  ].map((e) => (
                    <div key={e.title} className="mb-2 flex items-start gap-2">
                      <div
                        className={`mt-0.5 size-1.5 shrink-0 rounded-full ${e.color}`}
                      />
                      <div>
                        <p className="text-[10px] text-zinc-400">{e.time}</p>
                        <p className="text-xs text-zinc-300">{e.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CTAButtons() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <a
        href="/register"
        className="bg-brand-orange hover:bg-brand-orange/90 inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/40"
      >
        🚀 Bắt đầu miễn phí
      </a>
      <a
        href="/login"
        className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/10"
      >
        Đăng nhập
      </a>
    </div>
  );
}

export default CinematicHero;
