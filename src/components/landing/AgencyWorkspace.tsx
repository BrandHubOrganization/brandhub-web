import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import {
  Building2,
  Users2,
  ShieldCheck,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SpotlightCard } from "@/components/landing/SpotlightCard";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

// pageIndex 6 = Workspace trong CinematicHero (xem NAV_ITEMS) — demo có
// sẵn multi-workspace/multi-client, search, filter theo trạng thái.
const WORKSPACE_PAGE = 6;

interface AgencyCapability {
  key: string;
  icon: LucideIcon;
}

const CAPABILITIES: AgencyCapability[] = [
  { key: "multiAgency", icon: Building2 },
  { key: "multiClient", icon: Users2 },
  { key: "roleAccess", icon: ShieldCheck },
];

export function AgencyWorkspace() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const goToPage = useLandingDemoStore((s) => s.goToPage);

  return (
    <section
      id="agency-workspace"
      className="relative overflow-hidden bg-zinc-50 py-24 dark:bg-zinc-900/50"
    >
      <SectionDecor corner="left" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <SectionEyebrow index={3} />
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.agencyWorkspace.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.agencyWorkspace.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CAPABILITIES.map(({ key, icon: Icon }, i) => (
            <SpotlightCard
              key={key}
              aria-label={t("landing.agencyWorkspace.demoAction", {
                capability: t(`landing.agencyWorkspace.items.${key}.title`),
              })}
              onActivate={() => goToPage(WORKSPACE_PAGE)}
              className="border-zinc-100"
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="bg-brand-orange/10 text-brand-orange mb-5 flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <Icon className="size-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {t(`landing.agencyWorkspace.items.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {t(`landing.agencyWorkspace.items.${key}.desc`)}
              </p>
              <span className="text-brand-orange mt-4 flex items-center gap-1.5 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                <MousePointerClick className="size-3.5" />
                {t("landing.agencyWorkspace.demoLabel")}
              </span>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AgencyWorkspace;
