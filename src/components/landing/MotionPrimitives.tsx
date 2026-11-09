import { useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Word-by-word 3D masked clip reveal inspired by giaimamanhai.vercel.app (`Hl` / `.w > .w-in`).
 * Uses IntersectionObserver so the animation reliably triggers when entering the viewport.
 */
export function SplitHeading({
  text,
  highlightText,
  as: Tag = "h2",
  className,
  highlightClassName = "text-brand-orange",
}: {
  text: string;
  highlightText?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  highlightClassName?: string;
}) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (
      typeof window === "undefined" ||
      !el ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const words = el.querySelectorAll<HTMLElement>(".bh-w-in");
    if (!words.length) return;

    gsap.set(words, {
      yPercent: 120,
      rotateX: -55,
      rotateZ: 5,
      autoAlpha: 0,
      transformPerspective: 800,
      transformOrigin: "50% 100%",
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(words, {
              yPercent: 0,
              rotateX: 0,
              rotateZ: 0,
              autoAlpha: 1,
              stagger: 0.042,
              duration: 0.88,
              ease: "expo.out",
              clearProps:
                "rotateX,rotateZ,transformPerspective,transformOrigin",
            });
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [text, highlightText]);

  const renderWords = (segment: string, isHighlight: boolean) =>
    segment
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word, idx) => (
        <span key={`${isHighlight ? "hl" : "tx"}-${idx}-${word}`}>
          <span className="inline-block overflow-hidden align-top -my-[0.16em] py-[0.16em] px-[0.04em]">
            <span
              className={cn(
                "bh-w-in inline-block will-change-transform",
                isHighlight && highlightClassName,
              )}
            >
              {word}
            </span>
          </span>{" "}
        </span>
      ));

  return (
    <Tag
      ref={containerRef}
      className={cn(
        "text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-zinc-100",
        className,
      )}
    >
      {renderWords(text, false)}
      {highlightText ? renderWords(highlightText, true) : null}
    </Tag>
  );
}

/**
 * Spinning circular SVG seal/stamp inspired by `Ul` (`.sticker` / `.sticker-spin`) in giaimamanhai.vercel.app.
 */
export function SpinningSeal({
  text = "BRANDHUB AI STUDIO • MULTI-CHANNEL OPS • ",
  centerTop = "AI",
  centerBottom = "HUB",
  className,
  variant = "orange",
}: {
  text?: string;
  centerTop?: string;
  centerBottom?: string;
  className?: string;
  variant?: "orange" | "dark" | "light";
}) {
  const rawId = useId();
  const pathId = `seal-ring-${rawId.replace(/\W/g, "")}`;

  const palette = {
    orange: {
      outerFill: "#F05A28",
      ringText: "#FFFFFF",
      innerFill: "#18181B",
      innerText: "#FFFFFF",
    },
    dark: {
      outerFill: "#18181B",
      ringText: "#F4F4F5",
      innerFill: "#F05A28",
      innerText: "#FFFFFF",
    },
    light: {
      outerFill: "#FFF7ED",
      ringText: "#9A3412",
      innerFill: "#F05A28",
      innerText: "#FFFFFF",
    },
  }[variant];

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={cn("select-none drop-shadow-xl", className)}
    >
      <defs>
        <path
          id={pathId}
          d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0"
        />
      </defs>
      <circle cx="60" cy="60" r="58" fill={palette.outerFill} />
      <g className="origin-center animate-[spin_18s_linear_infinite] motion-reduce:animate-none">
        <text
          fontSize="9.8"
          fontWeight="700"
          letterSpacing="1.5"
          fill={palette.ringText}
        >
          <textPath href={`#${pathId}`}>{text}</textPath>
        </text>
      </g>
      <circle cx="60" cy="60" r="29" fill={palette.innerFill} />
      <text
        x="60"
        y="57"
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fill={palette.innerText}
      >
        {centerTop}
      </text>
      <text
        x="60"
        y="71"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={palette.innerText}
      >
        {centerBottom}
      </text>
    </svg>
  );
}

/**
 * Floating bottom-left rotating badge CTA inspired by `.reg-bubble` in giaimamanhai.vercel.app.
 * Appears smoothly when scrolling past the Hero section.
 */
export function FloatingCtaStamp({
  label = "DÙNG THỬ MIỄN PHÍ • BRANDHUB AI • ",
}: {
  label?: string;
}) {
  const stampRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = stampRef.current;
    if (!el) return;

    const onScroll = () => {
      const y = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const shouldShow = y > window.innerHeight * 0.85 && y < maxScroll - 320;
      el.dataset.visible = shouldShow ? "true" : "false";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      ref={stampRef}
      to="/register"
      data-visible="false"
      aria-label="Đăng ký dùng thử miễn phí BrandHub"
      className="fixed bottom-6 left-6 z-40 hidden size-24 -rotate-12 scale-50 opacity-0 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-[visible=true]:rotate-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100 data-[visible=true]:pointer-events-auto hover:scale-110 active:scale-95 lg:block"
    >
      <SpinningSeal
        text={label}
        centerTop="FREE"
        centerBottom="TRIAL"
        variant="orange"
        className="size-full"
      />
      <span className="bg-white text-brand-orange absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full shadow-md">
        <Sparkles className="size-3.5" />
      </span>
    </Link>
  );
}

const CARD_SELECTOR =
  ".feature-card, .ai-card, .template-card, .team-card, .faq-row, .pricing-row, .insight-card, .workspace-card, .mp-card, .bh-reveal-card";

const STAGE_SELECTOR = ".bh-stage-reveal";

const TILT_SELECTOR =
  ".feature-card, .ai-card, .template-card, .team-card, .insight-card, .workspace-card";

/**
 * Global Landing Motion Orchestrator:
 * 1. Top glowing scroll progress bar
 * 2. Scroll-linked Lateral Fly-In (Left / Center-3D / Right vectors) & Alternating Horizontal Rail cascades
 * 3. Scroll-scrubbed Horizontal Kinetic Ribbons (`[data-bh-horizontal-track]`)
 * 4. Floating 3D Badge Counter-Parallax (`[data-bh-float]`)
 * 5. Real-time 3D Magnetic Tilt + Radial Cursor Spotlight & Border Beam Glow on interactive cards
 */
export function LandingMotionOrchestrator() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // 1. Top scroll progress bar
    let rafId = 0;
    const updateProgress = () => {
      rafId = 0;
      if (!progressRef.current) return;
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const ratio = Math.min(1, Math.max(0, window.scrollY / max));
      progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (prefersReduce) {
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }

    const ctx = gsap.context(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section"),
      ).slice(1); // Skip Hero section

      // 2. Scroll-Scrubbed Horizontal Kinetic Tracks (`[data-bh-horizontal-track]`)
      document
        .querySelectorAll<HTMLElement>("[data-bh-horizontal-track]")
        .forEach((track) => {
          const dir = track.getAttribute("data-bh-horizontal-track");
          const fromX = dir === "right" ? -18 : 14;
          const toX = dir === "right" ? 10 : -18;
          gsap.fromTo(
            track,
            { xPercent: fromX },
            {
              xPercent: toX,
              ease: "none",
              scrollTrigger: {
                trigger: track.closest("section") ?? track,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            },
          );
        });

      // 3. Floating 3D Badges Counter-Parallax (`[data-bh-float]`)
      document
        .querySelectorAll<HTMLElement>("[data-bh-float]")
        .forEach((badge, idx) => {
          gsap.fromTo(
            badge,
            { y: 6, rotate: idx % 2 === 0 ? -1.5 : 1.5 },
            {
              y: -8,
              rotate: idx % 2 === 0 ? 1.5 : -1.5,
              ease: "none",
              scrollTrigger: {
                trigger: badge.closest("section") ?? badge,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            },
          );
        });

      // 4. Multi-Directional Fly-In & Horizontal Slide for Section Stages & Cards
      sections.forEach((sec) => {
        const stages = sec.querySelectorAll<HTMLElement>(STAGE_SELECTOR);
        stages.forEach((st, sIdx) => {
          st.dataset.bhEntering = "true";
          const fromX = sIdx % 2 === 0 ? -90 : 90;
          gsap.set(st, {
            x: fromX,
            y: 48,
            scale: 0.92,
            rotateX: 10,
            rotateY: sIdx % 2 === 0 ? 8 : -8,
            autoAlpha: 0,
            filter: "blur(10px)",
            transformPerspective: 1400,
          });
        });

        const cards = sec.querySelectorAll<HTMLElement>(CARD_SELECTOR);
        cards.forEach((card, idx) => {
          card.classList.add("bh-spotlight-card");
          card.dataset.bhEntering = "true";

          // Determine directional fly-in vector (Left fly-in / Center 3D pop / Right fly-in)
          const isStackRow =
            card.classList.contains("faq-row") ||
            card.classList.contains("pricing-row");
          const lane = isStackRow ? (idx % 2 === 0 ? 0 : 2) : idx % 3;

          const startX = lane === 0 ? -115 : lane === 2 ? 115 : 0;
          const startY = lane === 1 ? 92 : 52;
          const startRotZ = lane === 0 ? -4.5 : lane === 2 ? 4.5 : 0;
          const startRotY = lane === 0 ? 14 : lane === 2 ? -14 : 0;
          const startRotX = lane === 1 ? 18 : 10;

          gsap.set(card, {
            x: startX,
            y: startY,
            scale: 0.86,
            rotateX: startRotX,
            rotateY: startRotY,
            rotateZ: startRotZ,
            autoAlpha: 0,
            filter: "blur(10px)",
            transformPerspective: 1200,
            transformOrigin: "50% 85%",
          });
        });

        const imgs = sec.querySelectorAll<HTMLElement>(
          `${CARD_SELECTOR} img:not([width="44"]):not([width="64"]):not([width="96"]):not(.template-photo):not(.timeline-photo)`,
        );
        imgs.forEach((img) => {
          img.dataset.bhEntering = "true";
        });
        if (imgs.length > 0) {
          gsap.set(imgs, {
            scale: 1.28,
            clipPath: "inset(18% 14% 18% 14% round 28px)",
            filter: "brightness(0.75) saturate(1.25)",
          });
        }
      });

      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const sec = entry.target as HTMLElement;
            sectionObserver.unobserve(sec);

            const stages = sec.querySelectorAll<HTMLElement>(STAGE_SELECTOR);
            if (stages.length > 0) {
              gsap.to(stages, {
                x: 0,
                y: 0,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 1.1,
                stagger: 0.12,
                ease: "expo.out",
                overwrite: "auto",
                onComplete: () => {
                  stages.forEach((st) => {
                    delete st.dataset.bhEntering;
                  });
                },
                clearProps:
                  "filter,rotateX,rotateY,transformPerspective,x,y,scale",
              });
            }

            const cards = sec.querySelectorAll<HTMLElement>(CARD_SELECTOR);
            if (cards.length > 0) {
              gsap.to(cards, {
                x: 0,
                y: 0,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 1.05,
                stagger: 0.09,
                ease: "expo.out",
                overwrite: "auto",
                onComplete: () => {
                  cards.forEach((card) => {
                    delete card.dataset.bhEntering;
                  });
                },
                clearProps:
                  "filter,rotateX,rotateY,rotateZ,transformPerspective,transformOrigin,x,y,scale",
              });

              const imgs = sec.querySelectorAll<HTMLElement>(
                `${CARD_SELECTOR} img`,
              );
              if (imgs.length > 0) {
                gsap.to(imgs, {
                  scale: 1,
                  clipPath: "inset(0% 0% 0% 0% round 14px)",
                  filter: "brightness(1) saturate(1)",
                  duration: 1.25,
                  stagger: 0.09,
                  delay: 0.06,
                  ease: "power4.out",
                  overwrite: "auto",
                  onComplete: () => {
                    imgs.forEach((img) => {
                      delete img.dataset.bhEntering;
                    });
                  },
                  clearProps: "clipPath,filter,scale",
                });
              }
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -45px 0px" },
      );

      sections.forEach((sec) => sectionObserver.observe(sec));

      return () => sectionObserver.disconnect();
    });

    // Multi-pass ScrollTrigger refresh after Hero pin spacer settles
    const t1 = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    const t2 = window.setTimeout(() => ScrollTrigger.refresh(), 850);

    // 5. Interactive 3D Magnetic Tilt & Cursor Spotlight on Hover (Desktop)
    let activeCard: HTMLElement | null = null;

    const onPointerMove = (e: PointerEvent) => {
      if (window.innerWidth < 1024) return;
      const target = (e.target as HTMLElement | null)?.closest?.(
        CARD_SELECTOR,
      ) as HTMLElement | null;

      if (activeCard && activeCard !== target) {
        gsap.to(activeCard, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.55,
          ease: "power3.out",
          overwrite: "auto",
          clearProps: "rotateX,rotateY,transformPerspective",
        });
        activeCard = null;
      }

      if (!target || target.dataset.bhEntering === "true") return;
      const rect = target.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      target.style.setProperty("--bh-mx", `${relX}px`);
      target.style.setProperty("--bh-my", `${relY}px`);

      if (target.matches(TILT_SELECTOR)) {
        activeCard = target;
        const normX = (relX / rect.width - 0.5) * 2;
        const normY = (relY / rect.height - 0.5) * 2;
        gsap.to(target, {
          rotateX: -normY * 4.5,
          rotateY: normX * 5.5,
          transformPerspective: 1100,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      if (rafId) window.cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <style>{`
        [data-bh-entering="true"] {
          transition: none !important;
        }
        .bh-spotlight-card {
          position: relative;
        }
        .bh-spotlight-card::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            440px circle at var(--bh-mx, 50%) var(--bh-my, 50%),
            rgba(240, 90, 40, 0.14),
            transparent 65%
          );
          opacity: 0;
          transition: opacity 0.35s ease;
          z-index: 1;
        }
        .bh-spotlight-card::after {
          content: "";
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: radial-gradient(
            300px circle at var(--bh-mx, 50%) var(--bh-my, 50%),
            rgba(240, 90, 40, 0.7),
            transparent 70%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.35s ease;
          z-index: 2;
        }
        .bh-spotlight-card:hover::before,
        .bh-spotlight-card:hover::after {
          opacity: 1;
        }
        .bh-cutout-tr {
          clip-path: polygon(0 0, calc(100% - 42px) 0, 100% 42px, 100% 100%, 0 100%);
        }
        .bh-cutout-br {
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 44px), calc(100% - 44px) 100%, 0 100%);
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
      >
        <div
          ref={progressRef}
          className="from-brand-orange h-full w-full origin-left scale-x-0 bg-gradient-to-r via-amber-400 to-rose-500 shadow-[0_0_12px_rgba(240,90,40,0.7)]"
        />
      </div>
    </>
  );
}
