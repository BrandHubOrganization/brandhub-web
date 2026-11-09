import { useTranslation } from "react-i18next";
import {
  Building2,
  Users2,
  ShieldCheck,
  MousePointerClick,
  Layers,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

// pageIndex 6 = Workspace trong CinematicHero (xem NAV_ITEMS) — demo có
// sẵn multi-workspace/multi-client, search, filter theo trạng thái.
const WORKSPACE_PAGE = 6;

interface AgencyCapability {
  key: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  floatingBadge: string;
  cardTheme: string;
  pillTheme: string;
  orbTheme: string;
  frameCutout: string;
  roleTags: string[];
}

const CAPABILITIES: AgencyCapability[] = [
  {
    key: "multiAgency",
    icon: Building2,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=360&fit=crop",
    imageAlt: "Không gian làm việc sáng tạo của Agency chuyên nghiệp",
    floatingBadge: "MULTI-TENANT ISOLATION",
    cardTheme:
      "from-orange-50/90 via-white to-amber-50/40 border-orange-200/90 dark:from-orange-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-orange-800/40",
    pillTheme: "bg-brand-orange text-white shadow-orange-500/30",
    orbTheme: "bg-gradient-to-br from-brand-orange to-amber-500 text-white",
    frameCutout: "rounded-t-[999px] rounded-b-[22px]",
    roleTags: ["Owner", "Manager", "Creator"],
  },
  {
    key: "multiClient",
    icon: Users2,
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=360&fit=crop",
    imageAlt: "Cổng tương tác và thuyết trình chiến dịch cùng Khách hàng",
    floatingBadge: "DEDICATED CLIENT PORTAL",
    cardTheme:
      "from-indigo-50/90 via-white to-sky-50/40 border-indigo-200/90 dark:from-indigo-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-indigo-800/40",
    pillTheme: "bg-indigo-600 text-white shadow-indigo-500/30",
    orbTheme: "bg-gradient-to-br from-indigo-600 to-violet-600 text-white",
    frameCutout: "rounded-l-[22px] rounded-r-[999px]",
    roleTags: ["Client", "Manager", "Guest"],
  },
  {
    key: "roleAccess",
    icon: ShieldCheck,
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=360&fit=crop",
    imageAlt: "Bảo mật tài khoản mạng xã hội và phân quyền RBAC",
    floatingBadge: "6-ROLE ZERO-TRUST RBAC",
    cardTheme:
      "from-emerald-50/90 via-white to-teal-50/40 border-emerald-200/90 dark:from-emerald-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-emerald-800/40",
    pillTheme: "bg-emerald-600 text-white shadow-emerald-500/30",
    orbTheme: "bg-gradient-to-br from-emerald-600 to-teal-600 text-white",
    frameCutout: "rounded-[22px] bh-cutout-br",
    roleTags: ["Admin", "Owner", "Manager", "Creator", "Client", "Guest"],
  },
];

export function AgencyWorkspace() {
  const { t } = useTranslation();
  const goToPage = useLandingDemoStore((s) => s.goToPage);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );

  return (
    <section
      id="agency-workspace"
      className="relative overflow-hidden bg-gradient-to-b from-[#F6F5F0] via-zinc-50 to-white py-24 dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950"
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
          <div className="border-brand-orange/25 bg-brand-orange/10 text-brand-orange mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-bold">
            <Layers className="size-3.5" />
            <span>KIẾN TRÚC MULTI-TENANT WORKSPACE &amp; 6 VAI TRÒ CHUẨN</span>
          </div>
          <SplitHeading text={t("landing.agencyWorkspace.title")} />
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.agencyWorkspace.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-3">
          {CAPABILITIES.map(
            (
              {
                key,
                icon: Icon,
                image,
                imageAlt,
                floatingBadge,
                cardTheme,
                pillTheme,
                orbTheme,
                frameCutout,
                roleTags,
              },
              i,
            ) => (
              <div
                key={key}
                role="button"
                tabIndex={0}
                aria-label={t("landing.agencyWorkspace.demoAction", {
                  capability: t(`landing.agencyWorkspace.items.${key}.title`),
                })}
                onClick={() => goToPage(WORKSPACE_PAGE)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goToPage(WORKSPACE_PAGE);
                  }
                }}
                className={cn(
                  "workspace-card group relative flex cursor-pointer flex-col justify-between rounded-[30px] rounded-tl-[56px] border bg-gradient-to-br p-7 pt-9 shadow-sm transition-all duration-500 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none",
                  cardTheme,
                )}
              >
                {/* Floating 3D Badge (Khối nổi) */}
                <div
                  data-bh-float
                  className={cn(
                    "absolute -top-3.5 right-6 z-20 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10px] font-black tracking-wider uppercase shadow-lg",
                    pillTheme,
                  )}
                >
                  <Lock className="size-3" />
                  <span>{floatingBadge}</span>
                </div>

                {/* Top-Left Cutout Pocket (Khối cắt) */}
                <div
                  aria-hidden="true"
                  className="absolute -top-2 -left-2 z-10 flex size-15 items-center justify-center rounded-tl-[24px] rounded-br-[24px] border-r border-b border-zinc-200/80 bg-[#F6F5F0] p-1.5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-2xl shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6",
                      orbTheme,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-end">
                    <span className="font-mono text-xs font-black tracking-wider text-zinc-400">
                      PILLAR 0{i + 1}
                    </span>
                  </div>

                  {/* Architectural Cutout Photo Window */}
                  <div
                    className={cn(
                      "relative mb-5 h-44 w-full overflow-hidden border border-zinc-200/70 shadow-inner dark:border-zinc-800",
                      frameCutout,
                    )}
                  >
                    <img
                      src={image}
                      alt={imageAlt}
                      width={600}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute right-3 bottom-2.5 left-3 flex flex-wrap gap-1">
                      {roleTags.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {t(`landing.agencyWorkspace.items.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {t(`landing.agencyWorkspace.items.${key}.desc`)}
                  </p>
                </div>

                <span className="text-brand-orange mt-5 flex items-center gap-1.5 text-xs font-bold opacity-85 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                  <MousePointerClick className="size-3.5" />
                  {t("landing.agencyWorkspace.demoLabel")}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default AgencyWorkspace;
