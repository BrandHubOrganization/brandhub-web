import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import {
  Sparkles,
  ImageIcon,
  Video,
  PenLine,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SpotlightCard } from "@/components/landing/SpotlightCard";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

// pageIndex 3 = AI Studio trong CinematicHero (xem NAV_ITEMS). Cả 3 card
// đều mở cùng trang demo vì text/image/video gen là 3 tab trong 1 màn AI
// Studio duy nhất, không phải 3 trang riêng.
const AI_STUDIO_PAGE = 3;

interface AiCapability {
  key: string;
  icon: LucideIcon;
}

const CAPABILITIES: AiCapability[] = [
  { key: "image", icon: ImageIcon },
  { key: "video", icon: Video },
  { key: "text", icon: PenLine },
];

export function AIFeatures() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const goToPage = useLandingDemoStore((s) => s.goToPage);

  return (
    <section
      id="ai-features"
      className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 to-white py-24 dark:from-orange-950/10 dark:to-zinc-950"
    >
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
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
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CAPABILITIES.map(({ key, icon: Icon }, i) => (
            <SpotlightCard
              key={key}
              aria-label={t("landing.aiFeatures.demoAction", {
                capability: t(`landing.aiFeatures.items.${key}.title`),
              })}
              onActivate={() => goToPage(AI_STUDIO_PAGE)}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="bg-brand-orange/10 text-brand-orange mb-5 flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <Icon className="size-6" />
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
