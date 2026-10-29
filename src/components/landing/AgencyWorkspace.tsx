import { useTranslation } from "react-i18next";
import {
  Building2,
  Users2,
  ShieldCheck,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
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
  image: string;
  imageAlt: string;
}

const CAPABILITIES: AgencyCapability[] = [
  {
    key: "multiAgency",
    icon: Building2,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=360&fit=crop",
    imageAlt: "Không gian làm việc sáng tạo của Agency chuyên nghiệp",
  },
  {
    key: "multiClient",
    icon: Users2,
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=360&fit=crop",
    imageAlt: "Cổng tương tác và thuyết trình chiến dịch cùng Khách hàng",
  },
  {
    key: "roleAccess",
    icon: ShieldCheck,
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=360&fit=crop",
    imageAlt: "Bảo mật tài khoản mạng xã hội và phân quyền RBAC",
  },
];

export function AgencyWorkspace() {
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
      id="agency-workspace"
      className="relative overflow-hidden bg-zinc-50 py-24 dark:bg-zinc-900/50"
    >
      <SectionDecor corner="left" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-16 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={3} />
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.agencyWorkspace.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.agencyWorkspace.subtitle")}
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CAPABILITIES.map(({ key, icon: Icon, image, imageAlt }, i) => (
            <SpotlightCard
              key={key}
              aria-label={t("landing.agencyWorkspace.demoAction", {
                capability: t(`landing.agencyWorkspace.items.${key}.title`),
              })}
              onActivate={() => goToPage(WORKSPACE_PAGE)}
              style={{
                transitionDelay: gridVisible ? `${i * 100}ms` : "0ms",
              }}
              className={cn(
                "workspace-card border-zinc-100 transition-all duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none flex flex-col justify-between",
                gridVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0",
              )}
            >
              <div>
                <div className="relative mb-5 h-40 w-full overflow-hidden rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                  <img
                    src={image}
                    alt={imageAlt}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="bg-brand-orange/90 text-white absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-xl shadow-lg backdrop-blur">
                    <Icon className="size-5" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t(`landing.agencyWorkspace.items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {t(`landing.agencyWorkspace.items.${key}.desc`)}
                </p>
              </div>
              <span className="text-brand-orange mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100">
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
