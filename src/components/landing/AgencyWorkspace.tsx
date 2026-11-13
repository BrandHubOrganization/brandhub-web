import { useTranslation } from "react-i18next";
import {
  Building2,
  Users2,
  ShieldCheck,
  MousePointerClick,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useLandingDemoStore } from "@/store/landingDemoStore";
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
      className="relative overflow-hidden bg-zinc-50/70 py-24 dark:bg-zinc-900/40"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-14 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <Layers className="size-3.5 text-brand-orange" />
            <span>KIẾN TRÚC MULTI-TENANT WORKSPACE &amp; 6 VAI TRÒ CHUẨN</span>
          </div>
          <SplitHeading text={t("landing.agencyWorkspace.title")} />
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.agencyWorkspace.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CAPABILITIES.map(
            (
              {
                key,
                icon: Icon,
                image,
                imageAlt,
                floatingBadge,
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
                className="workspace-card group flex cursor-pointer flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/45 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                      <Icon className="size-5" />
                    </div>
                    <span className="truncate font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                      0{i + 1} · {floatingBadge}
                    </span>
                  </div>

                  {/* Clean Photo Frame (zero overlays) */}
                  <div className="mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                    <img
                      src={image}
                      alt={imageAlt}
                      width={600}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {t(`landing.agencyWorkspace.items.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {t(`landing.agencyWorkspace.items.${key}.desc`)}
                  </p>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {roleTags.map((role) => (
                      <span
                        key={role}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="text-brand-orange mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-85 transition-all group-hover:translate-x-1 group-hover:opacity-100">
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
