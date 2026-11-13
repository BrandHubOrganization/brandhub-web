import { useTranslation } from "react-i18next";
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
      "from-[#FFF5EE] via-white to-orange-50/60 border-orange-200/80 hover:border-orange-400 dark:from-orange-950/60 dark:via-[#12131C] dark:to-[#0D0E15] dark:border-orange-500/35 dark:hover:border-orange-400/70",
    iconBadge:
      "bg-orange-500/12 text-orange-600 ring-1 ring-orange-300/70 dark:bg-orange-500/20 dark:text-orange-400 dark:ring-orange-500/40",
    chipBadge: "bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-orange-500/25",
    orbBadge:
      "border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-500/50 dark:bg-orange-500/20 dark:text-orange-300",
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
      "from-fuchsia-50/85 via-white to-rose-50/45 border-fuchsia-200/80 hover:border-fuchsia-400 dark:from-fuchsia-950/55 dark:via-[#13121E] dark:to-[#0D0E15] dark:border-fuchsia-500/35 dark:hover:border-fuchsia-400/70",
    iconBadge:
      "bg-fuchsia-500/12 text-fuchsia-600 ring-1 ring-fuchsia-300/70 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:ring-fuchsia-500/40",
    chipBadge: "bg-gradient-to-r from-fuchsia-600 to-rose-500 text-white shadow-fuchsia-500/25",
    orbBadge:
      "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-600 dark:border-fuchsia-500/50 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
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
      "from-violet-50/85 via-white to-indigo-50/50 border-violet-200/80 hover:border-violet-400 dark:from-violet-950/60 dark:via-[#121222] dark:to-[#0D0E15] dark:border-violet-500/35 dark:hover:border-violet-400/70",
    iconBadge:
      "bg-violet-500/12 text-violet-600 ring-1 ring-violet-300/70 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-500/40",
    chipBadge: "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-violet-500/25",
    orbBadge:
      "border-violet-300 bg-violet-50 text-violet-600 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-300",
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
      "from-cyan-50/85 via-white to-sky-50/45 border-cyan-200/80 hover:border-cyan-400 dark:from-cyan-950/55 dark:via-[#101620] dark:to-[#0D0E15] dark:border-cyan-500/35 dark:hover:border-cyan-400/70",
    iconBadge:
      "bg-cyan-500/12 text-cyan-700 ring-1 ring-cyan-300/70 dark:bg-cyan-500/20 dark:text-cyan-300 dark:ring-cyan-500/40",
    chipBadge: "bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-cyan-500/25",
    orbBadge:
      "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/50 dark:bg-cyan-500/20 dark:text-cyan-300",
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
      "from-emerald-50/85 via-white to-teal-50/45 border-emerald-200/80 hover:border-emerald-400 dark:from-emerald-950/55 dark:via-[#101918] dark:to-[#0D0E15] dark:border-emerald-500/35 dark:hover:border-emerald-400/70",
    iconBadge:
      "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-300/70 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/40",
    chipBadge: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/25",
    orbBadge:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-300",
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
      "from-amber-50/85 via-white to-orange-50/50 border-amber-200/80 hover:border-amber-400 dark:from-amber-950/55 dark:via-[#171412] dark:to-[#0D0E15] dark:border-amber-500/35 dark:hover:border-amber-400/70",
    iconBadge:
      "bg-amber-500/12 text-amber-700 ring-1 ring-amber-300/70 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/40",
    chipBadge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25",
    orbBadge:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/20 dark:text-amber-300",
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

  const { ref: gridDomRef } = { ref: { current: null } };

  return (
    <section
      id="ai-features"
      className="relative overflow-hidden border-y border-zinc-200/80 bg-white py-24 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
    >
      {/* Scroll-Scrubbed Horizontal AI Telemetry Ribbon */}
      <div
        aria-hidden="true"
        className="pointer-events-none mb-14 overflow-hidden border-y border-zinc-200/75 bg-zinc-50/75 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        <div
          data-bh-horizontal-track="right"
          className="flex w-max items-center gap-8 px-4 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase will-change-transform dark:text-zinc-400"
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
            "mx-auto mb-14 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <Sparkles className="size-3.5 text-brand-orange" />
            {t("landing.aiFeatures.badge")}
          </span>
          <SplitHeading
            text={t("landing.aiFeatures.title")}
            className="text-zinc-900 dark:text-white"
          />
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            {t("landing.aiFeatures.subtitle")}
          </p>
        </div>

        <div
          ref={gridDomRef}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
              },
              i,
            ) => (
              <div
                key={key}
                role="button"
                tabIndex={0}
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
                className="ai-card group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/45 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="mb-4 flex w-full items-center justify-between gap-2">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                      <span className="truncate uppercase">{floatingChip}</span>
                      <span className="text-brand-orange">0{i + 1}</span>
                    </div>
                  </div>

                  {/* Clean Photo Frame (zero scrim/overlays) */}
                  <div className="mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                    <img
                      src={photo}
                      alt={photoAlt}
                      width={640}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </div>

                  <p className="mb-1.5 font-mono text-[11px] font-semibold text-brand-orange">
                    {tag}
                  </p>
                  <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">
                    {t(`landing.aiFeatures.items.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {t(`landing.aiFeatures.items.${key}.desc`)}
                  </p>
                </div>

                <span className="text-brand-orange mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-85 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                  <MousePointerClick className="size-3.5" />
                  {t("landing.aiFeatures.demoLabel")}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default AIFeatures;
