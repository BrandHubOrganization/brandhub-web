import { useTranslation } from "react-i18next";
import {
  Sparkles,
  TrendingUp,
  UserCheck,
  Network,
  Palette,
  Radio,
  Handshake,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SpotlightCard } from "@/components/landing/SpotlightCard";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

import { AiVectorArt } from "@/components/landing/AiVectorArt";

// pageIndex 3 = AI Studio trong CinematicHero (xem NAV_ITEMS). Bấm card
// sẽ điều hướng demo mở AI Studio.
const AI_STUDIO_PAGE = 3;

interface AiCapability {
  key: string;
  icon: LucideIcon;
}

const CAPABILITIES: AiCapability[] = [
  { key: "trendCrawler", icon: TrendingUp },
  { key: "virtualAmbassador", icon: UserCheck },
  { key: "graphRag", icon: Network },
  { key: "generativeStudio", icon: Palette },
  { key: "livestreamScript", icon: Radio },
  { key: "collaboratorRecommender", icon: Handshake },
];

export function AIFeatures() {
  const { t } = useTranslation();
  const goToPage = useLandingDemoStore((s) => s.goToPage);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const { ref: gridRef, isIntersecting: gridVisible } = useIntersectionObserver(
    { threshold: 0.1, freezeOnceVisible: true },
  );

  return (
    <section
      id="ai-features"
      className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 to-white py-24 dark:from-orange-950/10 dark:to-zinc-950"
    >
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-16 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={2} />
          <span className="bg-brand-orange/10 text-brand-orange mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            {t("landing.aiFeatures.badge")}
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.aiFeatures.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.aiFeatures.subtitle")}
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {CAPABILITIES.map(({ key, icon: Icon }, i) => (
            <SpotlightCard
              key={key}
              aria-label={t("landing.aiFeatures.demoAction", {
                capability: t(`landing.aiFeatures.items.${key}.title`),
              })}
              onActivate={() => goToPage(AI_STUDIO_PAGE)}
              style={{
                transitionDelay: gridVisible ? `${i * 80}ms` : "0ms",
              }}
              className={cn(
                "ai-card transition-all duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
                gridVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0",
              )}
            >
              <div className="mb-4 flex w-full items-start justify-between">
                <div className="bg-brand-orange/10 text-brand-orange flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                  <Icon className="size-6" />
                </div>
                <div className="group-hover:text-brand-orange h-12 w-24 text-zinc-400 transition-transform duration-300 group-hover:scale-105">
                  <AiVectorArt type={key} />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {t(`landing.aiFeatures.items.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {t(`landing.aiFeatures.items.${key}.desc`)}
              </p>
              <span className="text-brand-orange mt-4 flex items-center gap-1.5 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                <MousePointerClick className="size-3.5" />
                {t("landing.aiFeatures.demoLabel")}
              </span>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AIFeatures;
