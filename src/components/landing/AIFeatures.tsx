import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import {
  Sparkles,
  TrendingUp,
  UserCheck,
  Network,
  Palette,
  ShieldCheck,
  Handshake,
  MousePointerClick,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { AiVectorArt } from "@/components/landing/AiVectorArt";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

// pageIndex 3 = AI Studio trong CinematicHero (xem NAV_ITEMS). Bấm card
// sẽ điều hướng demo mở AI Studio.
const AI_STUDIO_PAGE = 3;

interface AiCapability {
  key: string;
  icon: LucideIcon;
  photo: string;
  photoAlt: string;
  tag: string;
  floatingChip: string;
  shapeClass: string;
  cardSurface: string;
  iconBadge: string;
  chipBadge: string;
  orbBadge: string;
}

const CAPABILITIES: AiCapability[] = [
  {
    key: "trendCrawler",
    icon: TrendingUp,
    photo:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=400&fit=crop",
    photoAlt: "AI Social Trend Crawler phân tích dữ liệu TikTok & Google Trends",
    tag: "TikTok & Google Trends",
    floatingChip: "LIVE TREND RADAR",
    shapeClass: "rounded-[22px] bh-cutout-tr",
    cardSurface:
      "from-orange-950/60 via-[#12131C] to-[#0D0E15] border-orange-500/35 hover:border-orange-400/70",
    iconBadge: "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40",
    chipBadge: "bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-orange-500/30",
    orbBadge: "border-orange-500/50 bg-orange-500/20 text-orange-300",
  },
  {
    key: "virtualAmbassador",
    icon: UserCheck,
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&h=400&fit=crop&crop=faces",
    photoAlt: "AI Virtual Ambassador tổng hợp đại sứ thương hiệu ảo bằng LoRA",
    tag: "100% Face Consistency · LoRA",
    floatingChip: "CUSTOM LORA MODEL",
    shapeClass: "rounded-t-[999px] rounded-b-[22px]",
    cardSurface:
      "from-fuchsia-950/55 via-[#13121E] to-[#0D0E15] border-fuchsia-500/35 hover:border-fuchsia-400/70",
    iconBadge: "bg-fuchsia-500/20 text-fuchsia-300 ring-1 ring-fuchsia-500/40",
    chipBadge: "bg-gradient-to-r from-fuchsia-600 to-rose-500 text-white shadow-fuchsia-500/30",
    orbBadge: "border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-300",
  },
  {
    key: "graphRag",
    icon: Network,
    photo:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&h=400&fit=crop",
    photoAlt: "GraphRAG Neo4j và ChromaDB kiểm soát Brand Guidelines",
    tag: "Neo4j + ChromaDB Vector",
    floatingChip: "KNOWLEDGE GRAPH",
    shapeClass: "rounded-l-[22px] rounded-r-[999px]",
    cardSurface:
      "from-violet-950/60 via-[#121222] to-[#0D0E15] border-violet-500/35 hover:border-violet-400/70",
    iconBadge: "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40",
    chipBadge: "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-violet-500/30",
    orbBadge: "border-violet-500/50 bg-violet-500/20 text-violet-300",
  },
  {
    key: "generativeStudio",
    icon: Palette,
    photo:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=640&h=400&fit=crop",
    photoAlt: "Multi-Modal Generative Studio tạo ảnh và video thương mại",
    tag: "Multi-Modal Image & Video",
    floatingChip: "4K STUDIO RENDER",
    shapeClass: "rounded-l-[999px] rounded-r-[22px]",
    cardSurface:
      "from-cyan-950/55 via-[#101620] to-[#0D0E15] border-cyan-500/35 hover:border-cyan-400/70",
    iconBadge: "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40",
    chipBadge: "bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-cyan-500/30",
    orbBadge: "border-cyan-500/50 bg-cyan-500/20 text-cyan-300",
  },
  {
    key: "complianceCheck",
    icon: ShieldCheck,
    photo:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=640&h=400&fit=crop",
    photoAlt: "AI Content Compliance Guard tự động kiểm duyệt an toàn nội dung",
    tag: "Safety & Policy Guardrails",
    floatingChip: "COMMUNITY GUARD",
    shapeClass: "rounded-t-[999px] rounded-b-[22px]",
    cardSurface:
      "from-emerald-950/55 via-[#101918] to-[#0D0E15] border-emerald-500/35 hover:border-emerald-400/70",
    iconBadge: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40",
    chipBadge: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/30",
    orbBadge: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300",
  },
  {
    key: "collaboratorRecommender",
    icon: Handshake,
    photo:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&h=400&fit=crop",
    photoAlt: "AI Media Collaborator Recommender đề xuất đối tác báo chí và truyền hình",
    tag: "Press · TV · Media Matching",
    floatingChip: "PARTNER MATCH AI",
    shapeClass: "rounded-[22px] bh-cutout-br",
    cardSurface:
      "from-amber-950/55 via-[#171412] to-[#0D0E15] border-amber-500/35 hover:border-amber-400/70",
    iconBadge: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40",
    chipBadge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30",
    orbBadge: "border-amber-500/50 bg-amber-500/20 text-amber-300",
  },
];

const AI_TELEMETRY_STREAM = [
  "19 TRÍ TUỆ NHÂN TẠO CHUYÊN BIỆT",
  "NEO4J KNOWLEDGE GRAPH",
  "CHROMADB SEMANTIC RETRIEVAL",
  "LORA VIRTUAL AMBASSADOR",
  "TIKTOK & GOOGLE TREND CRAWLER",
  "COMMUNITY COMPLIANCE GUARD",
];

export function AIFeatures() {
  const { t } = useTranslation();
  const goToPage = useLandingDemoStore((s) => s.goToPage);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );

  const gridDomRef = useRef<HTMLDivElement | null>(null);
  const peekRef = useRef<HTMLDivElement | null>(null);
  const peekImgRef = useRef<HTMLImageElement | null>(null);

  // Cursor-following circular preview lens inspired by `.theme-peek` in giaimamanhai.vercel.app
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }
    const gridEl = gridDomRef.current;
    const peekEl = peekRef.current;
    const imgEl = peekImgRef.current;
    if (!gridEl || !peekEl || !imgEl) return;

    const xTo = gsap.quickTo(peekEl, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(peekEl, "y", { duration: 0.45, ease: "power3" });
    let activeCard: Element | null = null;

    gsap.set(peekEl, { scale: 0, autoAlpha: 0 });

    const onPointerMove = (e: PointerEvent) => {
      xTo(e.clientX + 28);
      yTo(e.clientY - 28);
    };

    const hidePeek = () => {
      activeCard = null;
      gsap.to(peekEl, {
        scale: 0,
        autoAlpha: 0,
        duration: 0.3,
        ease: "power3.in",
        overwrite: "auto",
      });
    };

    const onPointerOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("[data-peek-img]");
      if (!target) {
        if (activeCard) hidePeek();
        return;
      }
      if (target !== activeCard) {
        activeCard = target;
        const src = target.getAttribute("data-peek-img");
        if (src) imgEl.src = src;
        gsap.to(peekEl, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.45,
          ease: "back.out(1.6)",
          overwrite: "auto",
        });
        gsap.fromTo(
          imgEl,
          { rotate: -10, scale: 1.2 },
          { rotate: 0, scale: 1, duration: 0.65, ease: "power3.out" },
        );
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    gridEl.addEventListener("pointerover", onPointerOver);
    gridEl.addEventListener("pointerleave", hidePeek);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      gridEl.removeEventListener("pointerover", onPointerOver);
      gridEl.removeEventListener("pointerleave", hidePeek);
    };
  }, []);

  return (
    <section
      id="ai-features"
      className="relative overflow-hidden bg-[#090A10] py-24 text-white"
    >
      {/* Ambient Cyber-Editorial Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 size-[28rem] rounded-full bg-orange-500/15 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 -bottom-24 size-[28rem] rounded-full bg-violet-600/15 blur-[130px]"
      />
      <SectionDecor corner="right" />

      {/* Scroll-Scrubbed Horizontal AI Telemetry Ribbon */}
      <div
        aria-hidden="true"
        className="pointer-events-none mb-14 overflow-hidden border-y border-white/10 bg-white/[0.03] py-2.5 backdrop-blur-xs"
      >
        <div
          data-bh-horizontal-track="right"
          className="flex w-max items-center gap-8 px-4 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase will-change-transform"
        >
          {[...AI_TELEMETRY_STREAM, ...AI_TELEMETRY_STREAM].map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-3">
              <Cpu className="text-brand-orange size-3.5" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-16 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={2} />
          <span className="border-brand-orange/35 bg-brand-orange/15 text-brand-orange mb-4 inline-flex items-center gap-1.5 rounded-full border px-4 py-1 text-xs font-bold">
            <Sparkles className="size-3.5" />
            {t("landing.aiFeatures.badge")}
          </span>
          <SplitHeading
            text={t("landing.aiFeatures.title")}
            className="text-white"
          />
          <p className="mt-4 text-base text-zinc-400">
            {t("landing.aiFeatures.subtitle")}
          </p>
        </div>

        <div
          ref={gridDomRef}
          className="grid grid-cols-1 gap-8 pt-3 md:grid-cols-2 lg:grid-cols-3"
        >
          {CAPABILITIES.map(
            (
              {
                key,
                icon: Icon,
                photo,
                photoAlt,
                tag,
                floatingChip,
                shapeClass,
                cardSurface,
                iconBadge,
                chipBadge,
                orbBadge,
              },
              i,
            ) => (
              <div
                key={key}
                role="button"
                tabIndex={0}
                data-peek-img={photo}
                aria-label={t("landing.aiFeatures.demoAction", {
                  capability: t(`landing.aiFeatures.items.${key}.title`),
                })}
                onClick={() => goToPage(AI_STUDIO_PAGE)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goToPage(AI_STUDIO_PAGE);
                  }
                }}
                className={cn(
                  "ai-card group relative flex cursor-pointer flex-col justify-between rounded-[30px] rounded-br-[68px] border bg-gradient-to-br p-6 pt-8 shadow-xl transition-all duration-500 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none",
                  cardSurface,
                )}
              >
                {/* Floating 3D Telemetry Badge (Khối nổi) */}
                <div
                  data-bh-float
                  className={cn(
                    "absolute -top-3.5 left-6 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase shadow-lg",
                    chipBadge,
                  )}
                >
                  <Sparkles className="size-3" />
                  <span>{floatingChip}</span>
                </div>

                {/* Architectural Bottom-Right Cutout Orb (Khối cắt) */}
                <div
                  aria-hidden="true"
                  className="absolute -right-2 -bottom-2 z-10 flex size-16 items-center justify-center rounded-tl-[28px] rounded-br-[28px] border-t border-l border-white/10 bg-[#090A10] p-2"
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full border font-mono text-xs font-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12",
                      orbBadge,
                    )}
                  >
                    0{i + 1}
                  </span>
                </div>

                <div>
                  <div className="mb-4 flex w-full items-start justify-between">
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
                        iconBadge,
                      )}
                    >
                      <Icon className="size-6" />
                    </div>
                    <div className="group-hover:text-brand-orange h-10 w-20 text-zinc-500 transition-transform duration-300 group-hover:scale-105">
                      <AiVectorArt type={key} />
                    </div>
                  </div>

                  {/* Architectural Cutout Photo Frame */}
                  <div
                    className={cn(
                      "relative mb-5 h-40 w-full overflow-hidden border border-white/15 shadow-inner",
                      shapeClass,
                    )}
                  >
                    <img
                      src={photo}
                      alt={photoAlt}
                      width={640}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 rounded-full border border-white/15 bg-black/70 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-xs">
                      {tag}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-white">
                    {t(`landing.aiFeatures.items.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {t(`landing.aiFeatures.items.${key}.desc`)}
                  </p>
                </div>

                <span className="text-brand-orange mt-5 flex items-center gap-1.5 pr-12 text-xs font-bold opacity-90 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                  <MousePointerClick className="size-3.5" />
                  {t("landing.aiFeatures.demoLabel")}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Floating Cursor-Following Circular Preview Lens (.theme-peek) */}
      <div
        ref={peekRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-40 hidden size-36 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white shadow-2xl ring-2 ring-brand-orange/40 lg:block dark:border-zinc-900"
      >
        <img
          ref={peekImgRef}
          src={CAPABILITIES[0].photo}
          alt=""
          className="size-full object-cover"
        />
      </div>
    </section>
  );
}

export default AIFeatures;
